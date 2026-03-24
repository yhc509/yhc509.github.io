import type { Metadata } from "next";
import Link from "next/link";
import { Hahmlet } from "next/font/google";
import { DevLanguageToggle } from "@/components/DevLanguageToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import { getRequestDevLanguage } from "@/lib/serverDevLanguage";
import { SITE_URL, toSiteUrl } from "@/lib/site";
import { siteContent } from "@/lib/siteContent";
import "./globals.css";

const hahmlet = Hahmlet({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-hahmlet",
});

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
  authors: [{ name: "KineticKeeper" }],
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
  verification: {
    // google: "your-google-verification-code",
    // naver: "your-naver-verification-code",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestLanguage = await getRequestDevLanguage();
  const useEnglish = requestLanguage === "en";
  const skipToContentLabel = useEnglish
    ? "Skip to content"
    : "본문으로 건너뛰기";

  return (
    <html
      lang={useEnglish ? "en" : "ko"}
      data-dev-language={requestLanguage}
      suppressHydrationWarning
      className={hahmlet.variable}
    >
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            {skipToContentLabel}
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
                <span className="hidden sm:inline">{siteTitle}</span>
                <span className="sm:hidden">KineticKeeper</span>
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
          {process.env.NODE_ENV === "development" ? (
            <DevLanguageToggle />
          ) : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
