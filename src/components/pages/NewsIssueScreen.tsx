import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { Comments } from "@/components/Comments";
import { KoreanFallbackNote } from "@/components/KoreanFallbackNote";
import { ScrollToTop } from "@/components/ScrollToTop";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { getAdjacentNewsIssues, getAllNewsIssues, getNewsIssue } from "@/lib/news";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { languageAlternates, toSiteUrl } from "@/lib/site";

const EMPTY_ISSUE_ID = "__empty__";

export interface NewsIssuePageProps {
  params: Promise<{ issue: string }>;
}

export function generateNewsIssueStaticParams() {
  const ids = getAllNewsIssues("ko").map((issue) => issue.id);
  return ids.length > 0 ? ids.map((issue) => ({ issue })) : [{ issue: EMPTY_ISSUE_ID }];
}

export async function generateNewsIssueMetadata(
  { params }: NewsIssuePageProps,
  language: DevLanguage
): Promise<Metadata> {
  const { issue: id } = await params;
  const issue = getNewsIssue(id, language);
  if (!issue) {
    return { robots: { index: false, follow: false } };
  }

  const englishPath = `/news/${id}`;
  const koreanPath = `/ko/news/${id}`;
  const canonical = language === "en" && !issue.missingEnglish ? englishPath : koreanPath;

  const images = issue.thumbnail
    ? [{ url: toSiteUrl(issue.thumbnail), width: 1200, height: 630, alt: issue.title }]
    : undefined;

  return {
    title: issue.title,
    description: issue.description,
    openGraph: {
      type: "article",
      locale: language === "en" && !issue.missingEnglish ? "en_US" : "ko_KR",
      title: issue.title,
      description: issue.description,
      url: toSiteUrl(canonical),
      publishedTime: issue.date,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: issue.title,
      description: issue.description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
    alternates: languageAlternates(canonical, englishPath, koreanPath),
  };
}

export async function NewsIssueScreen({
  params,
  language,
}: NewsIssuePageProps & { language: DevLanguage }) {
  const { issue: id } = await params;
  const issue = getNewsIssue(id, language);
  if (!issue) {
    notFound();
  }

  const useEnglish = language === "en";
  const contentLanguage = useEnglish && !issue.missingEnglish ? "en" : "ko";
  const { newer, older } = getAdjacentNewsIssues(id, language);
  const issueLink = (target: { id: string }) => localizedPath(`/news/${target.id}`, language);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <Suspense>
        <BackButton basePath="/news" />
      </Suspense>
      <KoreanFallbackNote
        show={useEnglish && issue.missingEnglish}
        message="This issue is only available in Korean."
      />
      <article lang={contentLanguage}>
        <header className="mb-8 pb-8 border-b" style={{ borderColor: "var(--card-border)" }}>
          {issue.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issue.thumbnail}
              alt=""
              width={1200}
              height={630}
              className="mb-6 aspect-[40/21] w-full rounded-lg object-cover"
            />
          )}
          <h1 className="text-3xl font-bold mb-4">{issue.title}</h1>
          <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
            <span>#{issue.issue}</span>
            <span>·</span>
            <time dateTime={issue.date}>{issue.date}</time>
          </div>
          {issue.description && (
            <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
              {issue.description}
            </p>
          )}
        </header>
        <ol className="space-y-8">
          {issue.items.map((item, index) => (
            <li key={item.url} className="border-b pb-8 last:border-b-0" style={{ borderColor: "var(--card-border)" }}>
              <div className="mb-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {index + 1}. {item.source}
              </div>
              <h2 className="text-lg font-bold leading-snug">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.title}
                </a>
              </h2>
              <p className="mt-2 leading-7">{item.summary}</p>
              {item.comment && (
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  {item.comment}
                </p>
              )}
            </li>
          ))}
        </ol>
        {issue.content.trim() && (
          <div className="prose max-w-none mt-8">
            <MDXRemote
              source={issue.content}
              components={createMarkdownComponents()}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        )}
      </article>
      {(newer || older) && (
        <nav
          className="mt-12 pt-8 border-t flex justify-between gap-4"
          style={{ borderColor: "var(--card-border)" }}
          aria-label={useEnglish ? "Issue navigation" : "이슈 탐색"}
        >
          {older ? (
            <Link href={issueLink(older)} className="flex-1 group">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {useEnglish ? "← Previous issue" : "← 이전 이슈"}
              </span>
              <p className="text-sm font-medium mt-1 group-hover:underline">{older.title}</p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {newer ? (
            <Link href={issueLink(newer)} className="flex-1 text-right group">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {useEnglish ? "Next issue →" : "다음 이슈 →"}
              </span>
              <p className="text-sm font-medium mt-1 group-hover:underline">{newer.title}</p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      )}
      <Comments term={`news/${issue.id}`} />
      <ScrollToTop />
    </div>
  );
}
