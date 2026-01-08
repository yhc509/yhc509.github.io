import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Blog",
    template: "%s | Blog",
  },
  description: "개발과 일상을 기록하는 블로그입니다.",
  keywords: ["블로그", "개발", "프로그래밍", "기술"],
  authors: [{ name: "Blog Author" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "Blog",
    title: "Blog",
    description: "개발과 일상을 기록하는 블로그입니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description: "개발과 일상을 기록하는 블로그입니다.",
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
            className="w-full py-8 border-b"
            style={{
              backgroundColor: "var(--header-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="max-w-3xl mx-auto px-5 flex items-center justify-between">
              <Link
                href="/"
                className="text-2xl font-bold transition-opacity hover:opacity-70"
                style={{ color: "var(--foreground)" }}
              >
                yhc509&apos;s Dev Journey
              </Link>
              <nav className="flex items-center gap-2">
                <NavLinks />
                <div className="w-px h-5 mx-1" style={{ backgroundColor: "var(--card-border)" }} />
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
