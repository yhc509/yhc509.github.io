import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { formatPostDate } from "./postAssets.mjs";

export const NEWS_DIR = path.join(process.cwd(), "content/news");
export const MIN_ITEMS = 3;
export const MAX_ITEMS = 5;

const ISSUE_FILE = /^(\d{4}-\d{2}-\d{2})(-en)?\.md$/;

/**
 * @typedef {{ title: string, url: string, source: string, summary: string, comment: string }} NewsItem
 * @typedef {{ id: string, issue: number, date: string, title: string, description: string,
 *   open: boolean, items: NewsItem[], content: string, missingEnglish: boolean }} NewsIssue
 */

/** @param {unknown} value @param {string} where */
function requireString(value, where) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${where} must be a non-empty string`);
  }
  return value.trim();
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
      summary: requireString(item.summary, `${where}.summary`),
      comment: requireString(item.comment, `${where}.comment`),
    };
  });

  return {
    id,
    issue: data.issue,
    date,
    title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : `AI News #${data.issue}`,
    description: typeof data.description === "string" ? data.description.trim() : "",
    open: data.open !== false,
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
