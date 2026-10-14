import { AUTHOR_NAME } from "./author";
import type { Metadata } from "next";
import type { DevLanguage } from "@/lib/devLanguage";
import { SITE_URL, toSiteUrl } from "@/lib/site";
import { siteContent } from "@/lib/siteContent";

const siteTitle = siteContent.name;

export function rootMetadata(language: DevLanguage): Metadata {
  const siteDescription = language === "en" ? siteContent.descriptionEn : siteContent.description;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description: siteDescription,
    alternates: {
      types: {
        "application/rss+xml": toSiteUrl("/feed.xml"),
      },
    },
    keywords: [...siteContent.keywords],
    authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
    openGraph: {
      type: "website",
      locale: language === "en" ? "en_US" : "ko_KR",
      url: language === "en" ? SITE_URL : toSiteUrl("/ko"),
      siteName: siteTitle,
      description: siteDescription,
      images: [
        {
          url: toSiteUrl("/profile.png"),
          width: 400,
          height: 400,
          alt: siteTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      description: siteDescription,
      images: [toSiteUrl("/profile.png")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
