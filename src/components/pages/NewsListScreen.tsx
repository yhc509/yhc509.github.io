import Link from "next/link";
import type { Metadata } from "next";
import { getAllNewsIssues } from "@/lib/news";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { languageAlternates, toSiteUrl } from "@/lib/site";

const copy = {
  en: {
    title: "AI News",
    description: "A short AI newsletter: a few links per issue, each with a summary and a one-line take.",
    empty: "No issues yet.",
    koreanOnly: "Korean only",
  },
  ko: {
    title: "AI 뉴스",
    description: "짧은 AI 뉴스레터. 이슈마다 링크 몇 개와 요약, 한 줄 코멘트를 붙인다.",
    empty: "아직 발행된 이슈가 없습니다.",
    koreanOnly: "Korean only",
  },
} as const;

export function newsListMetadata(language: DevLanguage): Metadata {
  return {
    title: copy[language].title,
    description: copy[language].description,
    alternates: {
      ...languageAlternates(language === "en" ? "/news" : "/ko/news", "/news", "/ko/news"),
      types: {
        "application/rss+xml": toSiteUrl(language === "en" ? "/news/feed.xml" : "/ko/news/feed.xml"),
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
        <div className="border-b pb-5" style={{ borderColor: "var(--card-border)" }}>
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{text.title}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            {text.description}
          </p>
        </div>
      </section>
      {issues.length === 0 ? (
        <p className="border-b py-8" style={{ color: "var(--text-muted)", borderColor: "var(--card-border)" }}>
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
            <article>
              <div
                className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <span>#{issue.issue}</span>
                <span>·</span>
                <time dateTime={issue.date}>{issue.date}</time>
                {language === "en" && issue.missingEnglish && (
                  <>
                    <span>·</span>
                    <span>{text.koreanOnly}</span>
                  </>
                )}
              </div>
              <h2 className="text-lg font-bold leading-snug">{issue.title}</h2>
              {issue.description && (
                <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  {issue.description}
                </p>
              )}
            </article>
          </Link>
        ))
      )}
    </div>
  );
}
