import Link from "next/link";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { getAllNewsIssues } from "@/lib/news";
import { getBlogCopy } from "@/lib/siteContent";

export function HomeHero({ language }: { language: DevLanguage }) {
  const { headline } = getBlogCopy(language);
  const latestIssue = getAllNewsIssues(language)[0];

  return (
    <section className="max-w-3xl mx-auto px-5 pt-6 pb-1 sm:pt-7">
      <div
        className="border-b pb-5"
        style={{ borderColor: "var(--card-border)" }}
      >
        <h1 className="max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">
          {headline}
        </h1>
        {latestIssue && (
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            {language === "en" ? "Latest AI News: " : "최신 AI 뉴스: "}
            <Link
              href={localizedPath(`/news/${latestIssue.id}`, language)}
              className="underline underline-offset-4 hover:opacity-75"
            >
              {latestIssue.title}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
