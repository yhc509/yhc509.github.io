import { authorPerson } from "@/lib/author";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { EditThisPage } from "@/components/EditThisPage";
import { Comments } from "@/components/Comments";
import { KoreanFallbackNote } from "@/components/KoreanFallbackNote";
import { ScrollToTop } from "@/components/ScrollToTop";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { Cards } from "@/components/Cards";
import { Chart } from "@/components/Chart";
import { Matrix } from "@/components/Matrix";
import { XPost } from "@/components/XPost";
import { remarkChart } from "@/lib/remarkChart.mjs";
import { remarkCards, remarkMatrix } from "@/lib/remarkSpec.mjs";
import { remarkXPost } from "@/lib/remarkXPost.mjs";
import {
  getAdjacentNewsIssues,
  getAllNewsIssues,
  getNewsIssue,
} from "@/lib/news";
import { newsItemImagePath } from "@/lib/newsIssues.mjs";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { languageAlternates, toAssetUrl, toSiteUrl } from "@/lib/site";

const EMPTY_ISSUE_ID = "__empty__";

export interface NewsIssuePageProps {
  params: Promise<{ issue: string }>;
}

export function generateNewsIssueStaticParams() {
  const ids = getAllNewsIssues("ko").map((issue) => issue.id);
  return ids.length > 0
    ? ids.map((issue) => ({ issue }))
    : [{ issue: EMPTY_ISSUE_ID }];
}

export async function generateNewsIssueMetadata(
  { params }: NewsIssuePageProps,
  language: DevLanguage,
): Promise<Metadata> {
  const { issue: id } = await params;
  const issue = getNewsIssue(id, language);
  if (!issue) {
    return { robots: { index: false, follow: false } };
  }

  const englishPath = `/news/${id}`;
  const koreanPath = `/ko/news/${id}`;
  const canonical =
    language === "en" && !issue.missingEnglish ? englishPath : koreanPath;

  const images = issue.thumbnail
    ? [
        {
          url: toAssetUrl(issue.thumbnail),
          width: 1200,
          height: 630,
          alt: issue.title,
        },
      ]
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

const ENGLISH_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-10-13" -> "Oct 13, 2026" / "2026년 10월 13일". */
function formatIssueDate(date: string, useEnglish: boolean) {
  const [year, month, day] = date.split("-").map(Number);
  return useEnglish
    ? `${ENGLISH_MONTHS[month - 1]} ${day}, ${year}`
    : `${year}년 ${month}월 ${day}일`;
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
  const issueLink = (target: { id: string }) =>
    localizedPath(`/news/${target.id}`, language);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: issue.title,
    description: issue.description,
    inLanguage: contentLanguage,
    url: toSiteUrl(issueLink(issue)),
    ...(issue.thumbnail ? { image: toAssetUrl(issue.thumbnail) } : {}),
    datePublished: issue.date,
    dateModified: issue.modified,
    author: authorPerson(),
    publisher: authorPerson(),
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <BackButton basePath="/news" />
      </Suspense>
      <KoreanFallbackNote
        show={useEnglish && issue.missingEnglish}
        message="This issue is only available in Korean."
      />
      <article lang={contentLanguage}>
        <header
          className="mb-8 pb-8 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          {issue.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issue.thumbnail}
              alt={
                issue.thumbnailLabel
                  ? issue.thumbnailLabel.replaceAll("**", "")
                  : ""
              }
              width={1200}
              height={630}
              className="mb-6 aspect-[40/21] w-full rounded-lg object-cover"
            />
          )}
          <h1 className="text-3xl font-bold mb-4">{issue.title}</h1>
          <div
            className="flex items-center gap-3 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span>
              {useEnglish ? `Issue ${issue.issue}` : `${issue.issue}호`}
            </span>
            <time dateTime={issue.date}>
              {formatIssueDate(issue.date, useEnglish)}
            </time>
          </div>
          <EditThisPage sourcePath={issue.sourcePath} language={language} />
        </header>
        <ol className="space-y-8">
          {issue.items.map((item, index) => (
            <li
              key={item.url}
              className="border-b pb-8 last:border-b-0"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full text-sm font-bold"
                  style={{ backgroundColor: "#facc15", color: "#0b1220" }}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <h2 className="text-lg font-bold leading-snug">{item.title}</h2>
              </div>
              {item.figure ? (
                <div className="news-figure">
                  <MDXRemote
                    source={item.figure}
                    components={{ Chart, Cards, Matrix }}
                    options={{
                      mdxOptions: {
                        remarkPlugins: [remarkChart, remarkCards, remarkMatrix],
                      },
                    }}
                  />
                </div>
              ) : item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={newsItemImagePath(item.image)}
                  alt={item.imageAlt ?? ""}
                  loading="lazy"
                  className="mt-3 h-auto w-full rounded-lg"
                />
              ) : null}
              {item.summary && (
                <p className="news-copy mt-3 leading-7">{item.summary}</p>
              )}
              {item.points && (
                <ul className="news-copy mt-3 list-disc space-y-1 pl-5 leading-7">
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              <p
                className="mt-2 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {useEnglish ? "Source: " : "출처: "}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:opacity-75"
                >
                  {item.source} ↗
                </a>
              </p>
              {item.comment && (
                <div
                  className="mt-4 rounded-r-md border-l-4 px-4 py-3 text-sm leading-6"
                  style={{
                    borderColor: "#facc15",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  <div
                    className="mb-1 text-xs font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {useEnglish ? "My take" : "내 생각"}
                  </div>
                  <p className="news-copy">{item.comment}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
        {issue.content.trim() && (
          <div className="prose max-w-none mt-8 overflow-x-auto">
            <MDXRemote
              source={issue.content}
              components={{ ...createMarkdownComponents(), XPost, Chart, Cards, Matrix }}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm, remarkChart, remarkCards, remarkMatrix, remarkXPost],
                },
              }}
            />
          </div>
        )}
      </article>
      {(newer || older) && (
        <nav
          className="mt-12 pt-8 border-t flex justify-between gap-4"
          style={{ borderColor: "var(--card-border)" }}
          aria-label={useEnglish ? "Issue navigation" : "호 탐색"}
        >
          {older ? (
            <Link href={issueLink(older)} className="flex-1 group">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {useEnglish ? "← Previous issue" : "← 이전 호"}
              </span>
              <p className="text-sm font-medium mt-1 group-hover:underline">
                {older.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {newer ? (
            <Link href={issueLink(newer)} className="flex-1 text-right group">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {useEnglish ? "Next issue →" : "다음 호 →"}
              </span>
              <p className="text-sm font-medium mt-1 group-hover:underline">
                {newer.title}
              </p>
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
