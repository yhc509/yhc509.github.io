import { endOfSeoulDay, resolveModifiedDate } from "./contentDates.mjs";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { formatPostDate } from "./postAssets.mjs";

export const NEWS_DIR = path.join(process.cwd(), "content/news");
export const MIN_ITEMS = 3;
export const MAX_ITEMS = 5;

const ISSUE_FILE = /^(\d{4}-\d{2}-\d{2})(-en)?\.md$/;

/**
 * @typedef {{ title: string, url: string, source: string, summary?: string, points?: string[], image?: string, imageAlt?: string, figure?: string, comment?: string }} NewsItem
 * @typedef {{ id: string, issue: number, date: string, modified: string, title: string, description: string,
 *   open: boolean, thumbnail: string | null, thumbnailBase: string | null,
 *   thumbnailLabel: string | null, thumbnailLanguage: "ko" | "en", items: NewsItem[], content: string, missingEnglish: boolean }} NewsIssue
 */

const LABELS = {
  ko: { source: "출처", comment: "내 생각" },
  en: { source: "Source", comment: "My take" },
};

/** @param {boolean} condition @param {string} message */
function assertNews(condition, message) {
  if (!condition) throw new Error(message);
}

/** @param {string} filePath @returns {"ko" | "en"} */
function fileLanguage(filePath) {
  return filePath.endsWith("-en.md") ? "en" : "ko";
}

/** Next top-level `## ` heading, skipping fenced blocks. @param {string} rest @param {number} from */
function nextH2(rest, from) {
  let fence = false;
  let index = from;
  while (index < rest.length) {
    const lineEnd = rest.indexOf("\n", index);
    const end = lineEnd === -1 ? rest.length : lineEnd;
    const line = rest.slice(index, end);
    if (line.startsWith("```")) fence = !fence;
    else if (!fence && line.startsWith("## ")) return index;
    if (lineEnd === -1) break;
    index = lineEnd + 1;
  }
  return rest.length;
}

/** @param {unknown} value @param {string} where */
function requireString(value, where) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where} must be a non-empty string`);
  }
  return value.trim();
}

export const NEWS_IMAGE_DIR = path.join(NEWS_DIR, "img");

/** Public URL of an item image copied from content/news/img by scripts/generate-news-og.mjs. @param {string} name */
export function newsItemImagePath(name) {
  return `/news-img/${name}`;
}

/**
 * `image: img/<name>` names a per-item image in content/news/img; a missing file fails the build.
 * @param {unknown} value @param {string} where @returns {string}
 */
function resolveItemImage(value, where) {
  const name = requireString(value, `${where}.image`).replace(/^\.\//, "").replace(/^img\//, "");
  if (!fs.existsSync(path.join(NEWS_IMAGE_DIR, name))) {
    throw new Error(`${where}.image ${name} not found in content/news/img`);
  }
  return name;
}

/** Built thumbnail (base image + per-language label) path under public/. @param {string} id @param {"ko" | "en"} language */
export function newsOgPath(id, language) {
  return language === "en" ? `/og/news/${id}.png` : `/og/ko/news/${id}.png`;
}

/**
 * `thumbnail: ./img/<name>` names the base image in content/news/img. Missing field -> null; a named file that does not exist fails the build.
 * @param {unknown} value @param {string} file @returns {string | null}
 */
function resolveThumbnailBase(value, file) {
  if (value == null || value === "") return null;
  const name = requireString(value, `${file}: thumbnail`).replace(/^\.\//, "").replace(/^img\//, "");
  if (!fs.existsSync(path.join(NEWS_IMAGE_DIR, name))) {
    throw new Error(`${file}: thumbnail ${name} not found in content/news/img`);
  }
  return name;
}

/**
 * One `##` item, or null when this heading belongs to the article below the items.
 * The returned rest keeps the separator newline so the article bytes stay intact.
 * @param {string} rest @param {number} offset @param {string} file @param {"ko" | "en"} language
 * @returns {{ item: NewsItem, rest: string } | null}
 */
function parseItemAt(rest, offset, file, language) {
  const labels = LABELS[language];
  const lineEnd = rest.indexOf("\n", offset);
  assertNews(lineEnd > offset, `${file}: an item title must be one line`);
  const title = rest.slice(offset + 3, lineEnd).trim();
  assertNews(title !== "", `${file}: an item title is empty`);
  const where = `${file}: ${title}`;

  const section = rest.slice(lineEnd + 1, nextH2(rest, lineEnd + 1));
  if (!section.includes(`\n### ${labels.source}\n`)) return null;

  let pos = lineEnd + 1;
  assertNews(rest.startsWith("\n", pos), `${where}: expected a blank line after the title`);
  pos += 1;

  /** @type {string | undefined} */
  let figure;
  /** @type {string | undefined} */
  let image;
  /** @type {string | undefined} */
  let imageAlt;
  if (rest.startsWith("```", pos)) {
    const fenceLineEnd = rest.indexOf("\n", pos);
    const lang = rest.slice(pos + 3, fenceLineEnd);
    assertNews(/^(?:chart|cards|matrix)$/.test(lang), `${where}: a figure fence must be chart, cards, or matrix`);
    const closeAt = rest.indexOf("\n```\n", pos);
    assertNews(closeAt !== -1, `${where}: a figure fence is not closed`);
    figure = rest.slice(pos, closeAt + 4);
    pos = closeAt + 5;
    assertNews(rest.startsWith("\n", pos), `${where}: expected a blank line after the figure`);
    pos += 1;
  } else if (rest.startsWith("![", pos)) {
    const imageMatch = /^!\[([^\]]*)\]\((?:\.\/)?img\/([^)\s]+)\)\n\n/.exec(rest.slice(pos));
    assertNews(imageMatch !== null, `${where}: an image must be a single ![alt](img/file) line`);
    imageAlt = requireString(imageMatch[1], `${where}.imageAlt`);
    image = resolveItemImage(imageMatch[2], where);
    pos += imageMatch[0].length;
  }

  /** @type {string | undefined} */
  let summary;
  /** @type {string[] | undefined} */
  let points;
  if (!rest.startsWith("- ", pos) && !rest.startsWith("### ", pos)) {
    const blank = rest.indexOf("\n\n", pos);
    assertNews(blank !== -1, `${where}: a summary paragraph is not closed`);
    summary = rest.slice(pos, blank);
    assertNews(!summary.includes("\n") && summary.trim() !== "", `${where}: a summary must be one paragraph`);
    pos = blank + 2;
  }
  if (rest.startsWith("- ", pos)) {
    points = [];
    while (rest.startsWith("- ", pos)) {
      const end = rest.indexOf("\n", pos);
      assertNews(end !== -1, `${where}: a bullet is not closed`);
      points.push(requireString(rest.slice(pos + 2, end), `${where}.points`));
      pos = end + 1;
    }
    assertNews(rest.startsWith("\n", pos), `${where}: expected a blank line after the bullets`);
    pos += 1;
  }
  assertNews(Boolean(summary || points), `${where}: needs a paragraph or bullets`);

  const sourceHeading = `### ${labels.source}\n\n`;
  assertNews(rest.startsWith(sourceHeading, pos), `${where}: expected ### ${labels.source}`);
  pos += sourceHeading.length;
  const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\n/.exec(rest.slice(pos));
  assertNews(link !== null, `${where}: source must be a [name](https://...) link`);
  const source = link[1];
  const url = link[2];
  pos += link[0].length;

  /** @type {string | undefined} */
  let comment;
  const commentHeading = `\n### ${labels.comment}\n\n`;
  if (rest.startsWith(commentHeading, pos)) {
    pos += commentHeading.length;
    const blank = rest.indexOf("\n\n", pos);
    let text = rest.slice(pos, blank === -1 ? rest.length : blank);
    if (blank === -1 && text.endsWith("\n")) text = text.slice(0, -1);
    assertNews(text.trim() !== "" && !text.includes("\n"), `${where}: a comment must be one paragraph`);
    comment = text;
    pos = blank === -1 ? rest.length : blank + 1;
  }

  return {
    item: {
      title,
      url,
      source,
      ...(summary ? { summary } : {}),
      ...(points ? { points } : {}),
      ...(image ? { image, imageAlt } : {}),
      ...(figure ? { figure } : {}),
      ...(comment ? { comment } : {}),
    },
    rest: rest.slice(pos),
  };
}

/**
 * @param {string} rest
 * @param {string} file
 * @param {"ko" | "en"} language
 * @returns {{ item: NewsItem, rest: string } | null}
 */
function takeItem(rest, file, language) {
  const offset = /^\n*/.exec(rest)?.[0].length ?? 0;
  if (!rest.startsWith("## ", offset)) return null;
  return parseItemAt(rest, offset, file, language);
}

/** @param {string} content @param {string} file @param {"ko" | "en"} language @returns {{ items: NewsItem[], content: string }} */
function parseNewsBody(content, file, language) {
  const items = [];
  let rest = content;
  while (items.length <= MAX_ITEMS) {
    const parsed = takeItem(rest, file, language);
    if (!parsed) break;
    items.push(parsed.item);
    rest = parsed.rest;
  }

  const label = LABELS[language].source;
  if (items.length < MIN_ITEMS || items.length > MAX_ITEMS) {
    throw new Error(`${file}: body must contain ${MIN_ITEMS} to ${MAX_ITEMS} items with a ### ${label} link`);
  }
  return { items, content: rest };
}

/** @param {string} filePath @param {string} id @param {boolean} missingEnglish @returns {NewsIssue} */
function parseIssueFile(filePath, id, missingEnglish) {
  const file = path.relative(process.cwd(), filePath);
  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));

  if (!Number.isInteger(data.issue) || data.issue < 1) {
    throw new Error(`${file}: issue must be a positive integer`);
  }
  const date = formatPostDate(data.date);
  if (date !== id) {
    throw new Error(`${file}: date must match the file name (${id})`);
  }
  if (Object.prototype.hasOwnProperty.call(data, "items")) {
    throw new Error(`${file}: write items in the body. The frontmatter items field is gone`);
  }

  const language = fileLanguage(filePath);
  const parsed = parseNewsBody(content, file, language);
  const { items } = parsed;

  const thumbnailBase = resolveThumbnailBase(data.thumbnail, file);
  const thumbnailLanguage = language;

  return {
    id,
    issue: data.issue,
    date,
    modified: resolveModifiedDate(filePath, date, data.updated, formatPostDate),
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : `AI News #${data.issue}`,
    description: typeof data.description === "string" ? data.description.trim() : "",
    open: data.open !== false,
    thumbnail: thumbnailBase ? newsOgPath(id, thumbnailLanguage) : null,
    thumbnailBase,
    thumbnailLabel: typeof data.thumbnailLabel === "string" && data.thumbnailLabel.trim() ? data.thumbnailLabel.trim() : null,
    thumbnailLanguage,
    items,
    content: parsed.content,
    missingEnglish,
  };
}

/** Open issues whose date is today or earlier in Asia/Seoul. @param {NewsIssue} issue */
function isVisible(issue) {
  return issue.open && new Date(issue.date) <= endOfSeoulDay();
}

/**
 * Issues for one language, newest first. A missing `-en` file falls back to the Korean issue.
 * @param {"ko" | "en"} language
 * @param {{ includeHidden?: boolean }} [options] include `open: false` and future-dated issues
 * @returns {NewsIssue[]}
 */
export function readNewsIssues(language, { includeHidden = false } = {}) {
  if (!fs.existsSync(NEWS_DIR)) {
    return [];
  }

  const names = fs.readdirSync(NEWS_DIR);
  const ids = names.map((name) => ISSUE_FILE.exec(name)).filter((m) => m && !m[2]).map((m) => /** @type {RegExpExecArray} */ (m)[1]);

  return ids
    .map((id) => {
      const hasEnglish = names.includes(`${id}-en.md`);
      const useEnglish = language === "en" && hasEnglish;
      return parseIssueFile(path.join(NEWS_DIR, `${id}${useEnglish ? "-en" : ""}.md`), id, !hasEnglish);
    })
    .filter((issue) => includeHidden || isVisible(issue))
    .sort((a, b) => b.date.localeCompare(a.date));
}
