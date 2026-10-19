import type { Metadata } from "next";
import type { DevLanguage } from "./devLanguage";
import { siteContent } from "./siteContent";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://kinkeep.dev";

export function toSiteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function rssAlternateTypes(
  language: DevLanguage,
): NonNullable<Metadata["alternates"]>["types"] {
  return {
    "application/rss+xml": [
      {
        url: toSiteUrl("/feed.xml"),
        title: language === "ko" ? "글" : "Posts",
      },
      {
        url: toSiteUrl("/news/feed.xml"),
        title: "AI News",
      },
      {
        url: toSiteUrl("/ko/news/feed.xml"),
        title: language === "ko" ? "AI 뉴스" : "AI News, Korean",
      },
    ],
  };
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

const shareImage = {
  url: toSiteUrl("/profile.png"),
  width: 400,
  height: 400,
  alt: siteContent.name,
};

export function pageSocial(
  language: DevLanguage,
  path: string,
  title: string,
  description: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      siteName: siteContent.name,
      locale: language === "en" ? "en_US" : "ko_KR",
      url: toSiteUrl(path),
      title,
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage.url],
    },
  };
}

export function pageAlternates(
  language: DevLanguage,
  canonicalPath: string,
  englishPath: string,
  koreanPath: string,
): Metadata["alternates"] {
  return {
    ...languageAlternates(canonicalPath, englishPath, koreanPath),
    types: rssAlternateTypes(language),
  };
}
