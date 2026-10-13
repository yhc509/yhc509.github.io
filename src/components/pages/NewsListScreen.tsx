import Link from "next/link";
import type { Metadata } from "next";
import { getAllNewsIssues } from "@/lib/news";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { languageAlternates, toSiteUrl } from "@/lib/site";

const copy = {
  en: {
    title: "AI News",
    description: "A few AI stories a day, summarized, with my take.",
    empty: "No issues yet.",
    koreanOnly: "Korean only",
  },
  ko: {
    title: "AI 뉴스",
    description: "매일 AI 소식 몇 개를 골라 짧게 정리하고 내 생각을 붙인다.",
    empty: "아직 이슈가 없다.",
    koreanOnly: "Korean only",
  },
} as const;

export function newsListMetadata(language: DevLanguage): Metadata {
  return {
    title: copy[language].title,
    description: copy[language].description,
    alternates: {
      ...languageAlternates(
        language === "en" ? "/news" : "/ko/news",
        "/news",
        "/ko/news",
      ),
      types: {
        "application/rss+xml": toSiteUrl(
          language === "en" ? "/news/feed.xml" : "/ko/news/feed.xml",
        ),
      },
    },
  };
}

export function NewsListScreen({ language }: { language: DevLanguage }) {
  const issues = getAllNewsIssues(language);
  const text = copy[language];

  return (
    <div className="max-w-3xl mx-auto px-5 pb-10">
      <section className="pt-6 pb-1 sm:pt-7">
        <div
          className="border-b pb-5"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
            {text.title}
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            {text.description}
          </p>
        </div>
      </section>
      {issues.length === 0 ? (
        <p
          className="border-b py-8"
          style={{
            color: "var(--text-muted)",
            borderColor: "var(--card-border)",
          }}
        >
          {text.empty}
        </p>
      ) : (
        issues.map((issue) => (
          <Link
            key={issue.id}
            href={localizedPath(`/news/${issue.id}`, language)}
            className="block border-b py-5 transition-colors hover:opacity-85"
            style={{ borderColor: "var(--card-border)" }}
          >
            <article className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {issue.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={issue.thumbnail}
                  alt=""
                  width={1200}
                  height={630}
                  loading="lazy"
                  className="aspect-[40/21] w-full rounded-md object-cover sm:w-48 sm:flex-none"
                />
              )}
              <div className="min-w-0 flex-1">
                <div
                  className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>
                    {language === "en"
                      ? `Issue ${issue.issue}`
                      : `${issue.issue}호`}
                  </span>
                  <time dateTime={issue.date}>{issue.date}</time>
                  {language === "en" && issue.missingEnglish && (
                    <span>{text.koreanOnly}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold leading-snug">
                  {issue.title}
                </h2>
                {issue.description && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {issue.description}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))
      )}
    </div>
  );
}
