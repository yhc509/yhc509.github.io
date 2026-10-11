import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://kinkeep.dev";

export function toSiteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function languageAlternates(
  canonicalPath: string,
  englishPath: string,
  koreanPath: string
): Metadata["alternates"] {
  return {
    canonical: toSiteUrl(canonicalPath),
    languages: {
      en: toSiteUrl(englishPath),
      ko: toSiteUrl(koreanPath),
      "x-default": toSiteUrl(englishPath),
    },
  };
}
