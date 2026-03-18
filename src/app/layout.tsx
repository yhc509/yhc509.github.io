import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "yhc509's Dev Journey",
    template: "%s | yhc509's Dev Journey",
  },
  description: "개발과 일상을 기록하는 블로그입니다.",
  keywords: ["블로그", "개발", "프로그래밍", "기술"],
  authors: [{ name: "yhc509" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "yhc509's Dev Journey",
    title: "yhc509's Dev Journey",
    description: "개발과 일상을 기록하는 블로그입니다.",
    images: [
      {
        url: `${SITE_URL}/profile.png`,
        width: 400,
        height: 400,
        alt: "yhc509's Dev Journey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "yhc509's Dev Journey",
    description: "개발과 일상을 기록하는 블로그입니다.",
    images: [`${SITE_URL}/profile.png`],
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
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
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
                <span className="hidden sm:inline">yhc509&apos;s Dev Journey</span>
                <span className="sm:hidden">yhc509</span>
              </Link>
              <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <NavLinks />
                <div className="w-px h-5 mx-0.5 sm:mx-1" style={{ backgroundColor: "var(--card-border)" }} />
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
