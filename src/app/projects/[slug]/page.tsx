import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/projects";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = getProjectBySlug(slug);
    const url = `${BASE_URL}/projects/${slug}`;

    return {
      title: project.title,
      description: project.description,
      keywords: project.tags,
      openGraph: {
        type: "article",
        title: project.title,
        description: project.description,
        url,
        publishedTime: project.date,
        tags: project.tags,
        images: [project.thumbnail],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description: project.description,
        images: [project.thumbnail],
      },
      alternates: {
        canonical: url,
      },
    };
  } catch {
    return {
      title: "Project Not Found",
    };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  try {
    const project = getProjectBySlug(slug);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title,
      description: project.description,
      datePublished: project.date,
      author: {
        "@type": "Person",
        name: "Blog Author",
      },
      keywords: project.tags.join(", "),
      image: project.thumbnail,
    };

    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Suspense>
          <BackButton basePath="/projects" />
        </Suspense>
        <article>
          <header
            className="mb-8 pb-8 border-b"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <p
              className="text-lg mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              {project.description}
            </p>
            <div
              className="flex items-center gap-3 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <time dateTime={project.date}>{project.date}</time>
              {project.tags.length > 0 && (
                <>
                  <span>·</span>
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>
          <div className="prose max-w-none">
            <MDXRemote
              source={project.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </article>
        <ScrollToTop />
      </div>
    );
  } catch {
    notFound();
  }
}
