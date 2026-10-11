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

export function getAboutPageCopy(language: DevLanguage) {
  const useEnglish = language === "en" && hasEnglishAbout();

  return {
    headline: siteContent.about.headline,
    title: useEnglish ? siteContent.about.titleEn : siteContent.about.title,
    intro: useEnglish ? siteContent.about.introEn : siteContent.about.intro,
    role: useEnglish ? siteContent.about.roleEn : siteContent.about.role,
    imageAlt: useEnglish ? siteContent.about.imageAltEn : siteContent.about.imageAlt,
    missingEnglish: !hasEnglishAbout(),
  };
}
