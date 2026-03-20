import type { Metadata } from "next";
import Link from "next/link";
import { Hahmlet } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import { SITE_URL, toSiteUrl } from "@/lib/site";
import { siteContent } from "@/lib/siteContent";
import "./globals.css";

const hahmlet = Hahmlet({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-hahmlet",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteContent.name,
    template: `%s | ${siteContent.name}`,
  },
  description: siteContent.description,
  alternates: {
    types: {
      "application/rss+xml": toSiteUrl("/feed.xml"),
    },
  },
  keywords: [...siteContent.keywords],
  authors: [{ name: "yhc509" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: siteContent.name,
    title: siteContent.name,
    description: siteContent.description,
    images: [
      {
        url: toSiteUrl("/profile.png"),
        width: 400,
        height: 400,
        alt: siteContent.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.name,
    description: siteContent.description,
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
  verification: {
    // google: "your-google-verification-code",
    // naver: "your-naver-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={hahmlet.variable}>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            본문으로 건너뛰기
          </a>
          <header
            className="w-full py-4 sm:py-8 border-b"
            style={{
              backgroundColor: "var(--header-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="max-w-3xl mx-auto px-3 sm:px-5 flex items-center justify-between gap-2">
              <Link
                href="/"
                className="text-lg sm:text-2xl font-bold transition-opacity hover:opacity-70 flex-shrink-0"
                style={{ color: "var(--foreground)" }}
              >
                <span className="hidden sm:inline">{siteContent.name}</span>
                <span className="sm:hidden">yhc509</span>
              </Link>
              <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <NavLinks />
                <div
                  className="w-px h-5 mx-0.5 sm:mx-1"
                  style={{ backgroundColor: "var(--card-border)" }}
                />
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main id="main-content">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
