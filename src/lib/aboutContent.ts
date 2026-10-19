import "server-only";

import type { DevLanguage } from "./devLanguage";
import { siteContent } from "./siteContent";

import fs from "fs";
import path from "path";

const contentDirectory = path.join(process.cwd(), "content");

function findAboutPath(slug: string): string | null {
  for (const ext of [".mdx", ".md"]) {
    const filePath = path.join(contentDirectory, `${slug}${ext}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

export function hasEnglishAbout(): boolean {
  return findAboutPath("about-en") !== null;
}

export function getAboutContent(language: DevLanguage): string {
  const englishPath = findAboutPath("about-en");
  const koreanPath = findAboutPath("about");
  const filePath = language === "en" ? englishPath ?? koreanPath : koreanPath ?? englishPath;

  if (!filePath) {
    throw new Error("About content not found");
  }

  return fs.readFileSync(filePath, "utf8");
}

function assertAboutDescription(description: string, language: DevLanguage) {
  const sentences = description.split(/[.!?。]/u).map((part) => part.trim()).filter(Boolean);
  if (description.length > 160 || sentences.length !== 1) {
    throw new Error(
      `About ${language} description must be one sentence of at most 160 characters. It is ${description.length} characters and ${sentences.length} sentences.`,
    );
  }
}

export function getAboutPageCopy(language: DevLanguage) {
  const useEnglish = language === "en" && hasEnglishAbout();
  const description = useEnglish ? siteContent.about.descriptionEn : siteContent.about.description;
  assertAboutDescription(description, useEnglish ? "en" : "ko");

  return {
    headline: useEnglish ? siteContent.about.headlineEn : siteContent.about.headline,
    title: useEnglish ? siteContent.about.titleEn : siteContent.about.title,
    description,
    imageAlt: useEnglish ? siteContent.about.imageAltEn : siteContent.about.imageAlt,
    missingEnglish: !hasEnglishAbout(),
  };
}
