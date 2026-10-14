import { authorPerson } from "@/lib/author";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentPosts, getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Comments } from "@/components/Comments";
import { KoreanFallbackNote } from "@/components/KoreanFallbackNote";
import type { Metadata } from "next";
import {
  createPostAssetRemarkPlugin,
  resolvePostAssetSrc,
} from "@/lib/postAssets.mjs";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { XPost } from "@/components/XPost";
import { remarkXPost } from "@/lib/remarkXPost.mjs";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { languageAlternates, toSiteUrl } from "@/lib/site";
import { getSiteCopy } from "@/lib/siteContent";

export interface PostPageProps {
  params: Promise<{ slug: string[] }>;
}

function postPaths(slug: string) {
  return {
    englishPath: `/posts/${slug}`,
    koreanPath: `/ko/posts/${slug}`,
  };
}

function postImagePath(slug: string, language: DevLanguage) {
  return language === "ko" ? `/og/ko/${slug}.png` : `/og/${slug}.png`;
}

export function generatePostStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generatePostMetadata(
  { params }: PostPageProps,
  language: DevLanguage
): Promise<Metadata> {
  const { slug } = await params;
  const currentSlug = slug.join("/");

  try {
    const post = getPostBySlug(currentSlug, language);
    const { englishPath, koreanPath } = postPaths(currentSlug);
    const canonicalPath =
      language === "en" && post.missingEnglish
        ? koreanPath
        : language === "en"
          ? englishPath
          : koreanPath;
    const url = toSiteUrl(canonicalPath);
    const imagePath = postImagePath(currentSlug, language);
    const contentLanguage = language === "ko" || post.missingEnglish ? "ko" : "en";

    return {
      title: post.title,
      description: post.description,
      openGraph: {
        type: "article",
        locale: contentLanguage === "en" ? "en_US" : "ko_KR",
        title: post.title,
        description: post.description,
        url,
        publishedTime: post.date,
        images: [
          {
            url: toSiteUrl(imagePath),
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
        images: [toSiteUrl(imagePath)],
      },
      alternates: languageAlternates(canonicalPath, englishPath, koreanPath),
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export async function PostScreen({
  params,
  language,
}: PostPageProps & { language: DevLanguage }) {
  const { slug } = await params;
  const useEnglish = language === "en";
  const { author } = getSiteCopy(language);
  const currentSlug = slug.join("/");
  let post;

  try {
    post = getPostBySlug(currentSlug, language);
  } catch {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(currentSlug, language);
  const { englishPath } = postPaths(currentSlug);
  const pagePath = localizedPath(englishPath, language);
  const contentLanguage = language === "ko" || post.missingEnglish ? "ko" : "en";
  const imagePath = postImagePath(currentSlug, language);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    inLanguage: contentLanguage,
    image: toSiteUrl(imagePath),
    url: toSiteUrl(pagePath),
    datePublished: post.date,
    dateModified: post.modified,
    author: authorPerson(author),
    wordCount: post.content.split(/\s+/).length,
    publisher: authorPerson(),
  };

  const postDir = slug.length > 1 ? slug.slice(0, -1).join("/") : "";

  const components = {
    ...createMarkdownComponents({
      resolveAssetSrc: (src) => resolvePostAssetSrc(src, postDir),
    }),
    XPost,
  };
  const postNavigationLabel = useEnglish ? "Post navigation" : "포스트 탐색";
  const previousPostLabel = useEnglish ? "← Previous post" : "← 이전 글";
  const nextPostLabel = useEnglish ? "Next post →" : "다음 글 →";

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <BackButton />
      </Suspense>
      <KoreanFallbackNote
        show={useEnglish && post.missingEnglish}
        message="This post is only available in Korean."
      />
      <article lang={contentLanguage}>
        <header
          className="mb-8 pb-8 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div
            className="flex items-center gap-3 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <time dateTime={post.date}>{post.date}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
        </header>
        <div className="prose max-w-none">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [
                  remarkGfm,
                  remarkXPost,
                  createPostAssetRemarkPlugin(postDir),
                ],
              },
            }}
          />
        </div>
      </article>
      {(prev || next) && (
        <nav
          className="mt-12 pt-8 border-t flex justify-between gap-4"
          style={{ borderColor: "var(--card-border)" }}
          aria-label={postNavigationLabel}
        >
          {prev ? (
            <Link
              href={localizedPath(`/posts/${prev.slug}`, language)}
              className="flex-1 group"
            >
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {previousPostLabel}
              </span>
              <p className="text-sm font-medium mt-1 group-hover:underline">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              href={localizedPath(`/posts/${next.slug}`, language)}
              className="flex-1 text-right group"
            >
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {nextPostLabel}
              </span>
              <p className="text-sm font-medium mt-1 group-hover:underline">
                {next.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      )}
      <Comments term={`posts/${currentSlug}`} />
      <ScrollToTop />
    </div>
  );
}
