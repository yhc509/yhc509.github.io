import { resolveModifiedDate } from "./contentDates.mjs";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { formatPostDate } from "./postAssets.mjs";

export const NEWS_DIR = path.join(process.cwd(), "content/news");
export const MIN_ITEMS = 3;
export const MAX_ITEMS = 5;

const ISSUE_FILE = /^(\d{4}-\d{2}-\d{2})(-en)?\.md$/;

/**
 * @typedef {{ title: string, url: string, source: string, summary?: string, points?: string[], image?: string, imageAlt?: string, comment?: string }} NewsItem
 * @typedef {{ id: string, issue: number, date: string, modified: string, title: string, description: string,
 *   open: boolean, thumbnail: string | null, thumbnailBase: string | null,
 *   thumbnailLabel: string | null, thumbnailLanguage: "ko" | "en", items: NewsItem[], content: string, missingEnglish: boolean }} NewsIssue
 */

/** @param {unknown} value @param {string} where */
function requireString(value, where) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where} must be a non-empty string`);
  }
  return value.trim();
}

function requireStringList(value, where) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${where} must be a non-empty list of strings`);
  }
  return value.map((entry, index) => requireString(entry, `${where}[${index}]`));
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
  if (!Array.isArray(data.items) || data.items.length < MIN_ITEMS || data.items.length > MAX_ITEMS) {
    throw new Error(`${file}: items must contain ${MIN_ITEMS} to ${MAX_ITEMS} entries`);
  }

  const items = data.items.map((/** @type {Record<string, unknown>} */ item, index) => {
    const where = `${file}: items[${index}]`;
    const url = requireString(item.url, `${where}.url`);
    if (!/^https?:\/\//.test(url)) {
      throw new Error(`${where}.url must start with http:// or https://`);
    }
    return {
      title: requireString(item.title, `${where}.title`),
      url,
      source: requireString(item.source, `${where}.source`),
      ...(item.summary == null && item.points != null
        ? {}
        : { summary: requireString(item.summary, `${where}.summary`) }),
      ...(item.points == null ? {} : { points: requireStringList(item.points, `${where}.points`) }),
      ...(item.image == null
        ? {}
        : {
            image: resolveItemImage(item.image, where),
            imageAlt: requireString(item.imageAlt, `${where}.imageAlt`),
          }),
      ...(item.comment == null ? {} : { comment: requireString(item.comment, `${where}.comment`) }),
    };
  });

  const thumbnailBase = resolveThumbnailBase(data.thumbnail, file);
  const thumbnailLanguage = filePath.endsWith("-en.md") ? "en" : "ko";

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
    content,
    missingEnglish,
  };
}

/** @param {NewsIssue} issue */
function isVisible(issue) {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return issue.open && new Date(issue.date) <= endOfToday;
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
