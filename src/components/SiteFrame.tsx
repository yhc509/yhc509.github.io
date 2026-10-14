import { AUTHOR_NAME, authorPerson } from "@/lib/author";
import Link from "next/link";
import { Hahmlet } from "next/font/google";
import { DevLanguageProvider } from "@/components/DevLanguageProvider";
import { DevLanguageToggle } from "@/components/DevLanguageToggle";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLinks } from "@/components/NavLinks";
import { GoatCounterScripts } from "@/components/GoatCounterScripts";
import {
  localizedPath,
  type DevLanguage,
} from "@/lib/devLanguage";
import { SITE_URL } from "@/lib/site";
import { getSiteCopy, siteContent } from "@/lib/siteContent";

const hahmlet = Hahmlet({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-hahmlet",
});

export function SiteFrame({
  language,
  children,
}: {
  language: DevLanguage;
  children: React.ReactNode;
}) {
  const useEnglish = language === "en";
  const { description, author } = getSiteCopy(language);
  const siteTitle = siteContent.name;
  const skipToContentLabel = useEnglish ? "Skip to content" : "본문으로 건너뛰기";

  return (
    <html
      lang={useEnglish ? "en" : "ko"}
      data-dev-language={language}
      suppressHydrationWarning
      className={hahmlet.variable}
    >
      <body className="antialiased min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteTitle,
                url: SITE_URL,
                description,
                inLanguage: useEnglish ? "en" : "ko",
                author: { "@type": "Person", name: AUTHOR_NAME, url: SITE_URL },
              },
              {
                "@context": "https://schema.org",
                ...authorPerson(author),
              },
            ]),
          }}
        />
        <ThemeProvider>
          <DevLanguageProvider language={language}>
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
                  href={localizedPath("/", language)}
                  className="text-lg sm:text-2xl font-bold transition-opacity hover:opacity-70 flex-shrink-0"
                  style={{ color: "var(--foreground)" }}
                >
                  <span className="hidden sm:inline">{siteTitle}</span>
                  <span className="sm:hidden">{siteTitle}</span>
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
            <DevLanguageToggle />
          </DevLanguageProvider>
        </ThemeProvider>
        <GoatCounterScripts />
      </body>
    </html>
  );
}
