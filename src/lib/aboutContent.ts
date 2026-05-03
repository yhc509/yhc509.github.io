import "server-only";

import { shouldUseEnglish } from "./devLanguage";
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

function shouldUseEnglishAbout(): boolean {
  if (findAboutPath("about-en") === null) return false;
  return shouldUseEnglish();
}

export function getAboutContent(): string {
  const useEnglish = shouldUseEnglishAbout();
  const filePath = useEnglish
    ? findAboutPath("about-en") ?? findAboutPath("about")
    : findAboutPath("about") ?? findAboutPath("about-en");

  if (!filePath) {
    throw new Error("About content not found");
  }

  return fs.readFileSync(filePath, "utf8");
}

export function getAboutPageCopy() {
  const useEnglish = shouldUseEnglishAbout();

  return {
    headline: siteContent.about.headline,
    title: useEnglish ? siteContent.about.titleEn : siteContent.about.title,
    intro: useEnglish ? siteContent.about.introEn : siteContent.about.intro,
    role: useEnglish ? siteContent.about.roleEn : siteContent.about.role,
    imageAlt: useEnglish ? siteContent.about.imageAltEn : siteContent.about.imageAlt,
  };
}
