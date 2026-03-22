import "server-only";

import { isDevelopmentEnvironment } from "./devLanguage";
import { shouldUseEnglishVersionInDevelopment } from "./serverDevLanguage";
import { siteContent } from "./siteContent";

const aboutExtensions = [".mdx", ".md"] as const;

async function findAboutPath(slug: string): Promise<string | null> {
  const [{ access }, path] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const contentDirectory = path.join(process.cwd(), "content");

  for (const ext of aboutExtensions) {
    const filePath = path.join(contentDirectory, `${slug}${ext}`);

    try {
      await access(filePath);
      return filePath;
    } catch {
      // Ignore missing files and continue checking other extensions.
    }
  }

  return null;
}

async function shouldUseEnglishVersion(): Promise<boolean> {
  if (!isDevelopmentEnvironment()) {
    return false;
  }

  const englishPath = await findAboutPath("about-en");
  if (!englishPath) {
    return false;
  }

  return shouldUseEnglishVersionInDevelopment();
}

export async function getAboutContent(): Promise<string> {
  const [{ readFile }, useEnglish, englishPath, koreanPath] = await Promise.all([
    import("node:fs/promises"),
    shouldUseEnglishVersion(),
    findAboutPath("about-en"),
    findAboutPath("about"),
  ]);
  const filePath = useEnglish ? englishPath ?? koreanPath : koreanPath ?? englishPath;

  if (!filePath) {
    throw new Error("About content not found");
  }

  return readFile(filePath, "utf8");
}

export async function getAboutPageCopy() {
  const useEnglish = await shouldUseEnglishVersion();

  return {
    headline: siteContent.about.headline,
    title: useEnglish ? siteContent.about.titleEn : siteContent.about.title,
    intro: useEnglish ? siteContent.about.introEn : siteContent.about.intro,
    role: useEnglish ? siteContent.about.roleEn : siteContent.about.role,
    imageAlt: useEnglish ? siteContent.about.imageAltEn : siteContent.about.imageAlt,
  };
}
