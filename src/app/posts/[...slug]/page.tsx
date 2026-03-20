import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentPosts, getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Comments } from "@/components/Comments";
import type { Metadata } from "next";
import {
  createPostAssetRemarkPlugin,
  resolvePostAssetSrc,
} from "@/lib/postAssets";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { toSiteUrl } from "@/lib/site";

interface PostPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug.join("/"));
    const url = toSiteUrl(`/posts/${slug.join("/")}`);

    return {
      title: post.title,
      description: post.description,
      keywords: post.tags,
      openGraph: {
        type: "article",
        title: post.title,
        description: post.description,
        url,
        publishedTime: post.date,
        tags: post.tags,
        images: [
          {
            url: toSiteUrl(`/og/${slug.join("/")}.png`),
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
        images: [toSiteUrl(`/og/${slug.join("/")}.png`)],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const currentSlug = slug.join("/");
  let post;

  try {
    post = getPostBySlug(currentSlug);
  } catch {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(currentSlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "yhc509",
    },
    keywords: post.tags.join(", "),
  };

  // If the slug is "aws/1_cloud", dirname is "aws". 
  // If slug is "hello-world", dirname is "." (but we want empty string effectively for joining).
  const postDir = slug.length > 1 ? slug.slice(0, -1).join("/") : "";

  const components = createMarkdownComponents({
    resolveAssetSrc: (src) => resolvePostAssetSrc(src, postDir),
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <BackButton />
      </Suspense>
      <article>
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
                remarkPlugins: [remarkGfm, createPostAssetRemarkPlugin(postDir)],
              },
            }}
          />
        </div>
      </article>
      {(prev || next) && (
        <nav
          className="mt-12 pt-8 border-t flex justify-between gap-4"
          style={{ borderColor: "var(--card-border)" }}
          aria-label="포스트 탐색"
        >
          {prev ? (
            <Link href={`/posts/${prev.slug}`} className="flex-1 group">
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                ← 이전 글
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
              href={`/posts/${next.slug}`}
              className="flex-1 text-right group"
            >
              <span
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                다음 글 →
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
      <Comments />
      <ScrollToTop />
    </div>
  );
}
