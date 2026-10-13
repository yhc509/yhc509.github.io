import type { DevLanguage } from "./devLanguage";
import { readNewsIssues } from "./newsIssues.mjs";

export type { NewsIssue, NewsItem } from "./newsIssues.mjs";

const includeHidden = process.env.NODE_ENV === "development";

export function getAllNewsIssues(language: DevLanguage) {
  return readNewsIssues(language, { includeHidden });
}

export function getNewsIssue(id: string, language: DevLanguage) {
  return getAllNewsIssues(language).find((issue) => issue.id === id) ?? null;
}

export function getAdjacentNewsIssues(id: string, language: DevLanguage) {
  const issues = getAllNewsIssues(language);
  const index = issues.findIndex((issue) => issue.id === id);
  return {
    newer: index > 0 ? issues[index - 1] : null,
    older: index >= 0 && index < issues.length - 1 ? issues[index + 1] : null,
  };
}
