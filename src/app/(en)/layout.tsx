import type { Metadata } from "next";
import { SiteFrame } from "@/components/SiteFrame";
import { SITE_URL, toSiteUrl } from "@/lib/site";
import { siteContent } from "@/lib/siteContent";
import "../globals.css";

const siteTitle = siteContent.name;
const siteDescription = siteContent.descriptionEn;

export const metadata: Metadata = {
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
  authors: [{ name: "yhc509" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: siteTitle,
    title: siteTitle,
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
    title: siteTitle,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteFrame language="en">{children}</SiteFrame>;
}
