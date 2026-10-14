import { execFileSync } from "child_process";

const SEOUL = "Asia/Seoul";

/** Calendar date `YYYY-MM-DD` in Asia/Seoul. Independent of the process timezone. @param {Date} [now] */
export function seoulCalendarDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SEOUL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (/** @type {Intl.DateTimeFormatPartTypes} */ type) =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

/**
 * 23:59:59.999 in Asia/Seoul on the Seoul day that contains `now`.
 * A date-only issue (`YYYY-MM-DD`) parses as UTC midnight, which is 09:00 KST that same day,
 * so it is included for the whole Seoul calendar day and hidden on the next one.
 * @param {Date} [now]
 */
export function endOfSeoulDay(now = new Date()) {
  const [year, month, day] = seoulCalendarDate(now).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 14, 59, 59, 999));
}

let shallow;
function isShallowClone() {
  if (shallow === undefined) {
    try {
      shallow =
        execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim() !== "false";
    } catch {
      shallow = true;
    }
  }
  return shallow;
}

/** Last git commit date (YYYY-MM-DD) of a file, or null when unavailable. @param {string} filePath */
export function gitLastModified(filePath) {
  // A shallow clone (default actions/checkout) would report HEAD's date for every file.
  if (isShallowClone()) return null;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", filePath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

/**
 * Real modification date: frontmatter `updated`, else git last-commit date, else published date.
 * Never earlier than the published date.
 * @param {string} filePath @param {string} published @param {unknown} updated @param {(v: unknown) => string} format
 */
export function resolveModifiedDate(filePath, published, updated, format) {
  const candidate = updated ? format(updated) : gitLastModified(filePath) ?? published;
  return candidate && candidate > published ? candidate : published;
}
