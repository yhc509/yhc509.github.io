import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BackButton } from "@/components/BackButton";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
    };
  } catch {
    return {
      title: "Post Not Found",
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);

    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
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
            <MDXRemote source={post.content} />
          </div>
        </article>
      </div>
    );
  } catch {
    notFound();
  }
}
