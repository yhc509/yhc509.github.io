import { execFileSync } from "child_process";

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
