import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Comments } from "@/components/Comments";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

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
    const url = `${SITE_URL}/posts/${slug.join("/")}`;

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
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.description,
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
  let post;

  try {
    post = getPostBySlug(slug.join("/"));
  } catch {
    notFound();
  }

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

  const components = {
    img: (props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
      let src = props.src;
      if (typeof src === "string" && src && !src.startsWith("http") && !src.startsWith("/")) {
        // Resolve relative path
        // e.g. src="./img/cloud.png", postDir="aws" -> "aws/img/cloud.png"
        const cleanSrc = src.replace(/^\.\//, "");
        const relativePath = postDir ? `${postDir}/${cleanSrc}` : cleanSrc;
        src = `/posts-images/${relativePath}`;
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} src={src as string} alt={props.alt || ""} />;
    },
  };

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
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>
      </article>
      <Comments />
      <ScrollToTop />
    </div>
  );
}
