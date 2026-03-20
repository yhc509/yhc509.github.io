import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/projects";
import { getProjectPostGroups, type PostMeta } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { BackButton } from "@/components/BackButton";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { ProjectExternalLinks } from "@/components/ProjectExternalLinks";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { Metadata } from "next";
import { toSiteUrl } from "@/lib/site";

const EMPTY_PROJECT_SLUG = "__empty__";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

function ProjectPostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block rounded-2xl border px-5 py-4 transition-colors"
      style={{ borderColor: "var(--card-border)" }}
    >
      <div className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <time dateTime={post.date}>{post.date}</time>
      </div>
      <h3 className="text-lg font-semibold leading-snug group-hover:underline">
        {post.title}
      </h3>
      <p
        className="mt-2 text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {post.description}
      </p>
    </Link>
  );
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  if (slugs.length === 0) {
    return [{ slug: EMPTY_PROJECT_SLUG }];
  }

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = getProjectBySlug(slug);
    if (!project.open) {
      return {
        title: "Project Not Found",
      };
    }
    const url = toSiteUrl(`/projects/${slug}`);

    return {
      title: project.title,
      description: project.description,
      keywords: [...project.tags, project.role],
      openGraph: {
        type: "article",
        title: project.title,
        description: project.description,
        url,
        publishedTime: project.date,
        tags: project.tags,
        images: [
          {
            url: toSiteUrl(`/og/projects/${slug}.png`),
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description: project.description,
        images: [toSiteUrl(`/og/projects/${slug}.png`)],
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

  if (slug === EMPTY_PROJECT_SLUG) {
    notFound();
  }

  let project: ReturnType<typeof getProjectBySlug>;

  try {
    project = getProjectBySlug(slug);
  } catch {
    notFound();
  }

  if (!project.open) {
    notFound();
  }

  const relatedPosts = getProjectPostGroups(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    datePublished: project.date,
    codeRepository: project.links.github,
    author: {
      "@type": "Person",
      name: "yhc509",
    },
    keywords: project.tags.join(", "),
    image: toSiteUrl(project.thumbnail),
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
          <div
            className="mb-4 flex flex-wrap items-center gap-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <time dateTime={project.date}>{project.date}</time>
          </div>
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          <p
            className="text-lg mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {project.description}
          </p>
          <div
            className="mt-6 border-t pt-5"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="grid gap-y-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-x-6">
              <p className="section-kicker sm:pt-1">역할</p>
              <p className="text-sm leading-6">{project.role}</p>

              <p className="section-kicker sm:pt-1">태그</p>
              <div
                className="flex flex-wrap gap-x-3 gap-y-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {project.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>

              <p className="section-kicker sm:pt-1">링크</p>
              <ProjectExternalLinks links={project.links} variant="plain" />

              <p className="section-kicker sm:pt-1">구성</p>
              <ul className="space-y-2 text-sm leading-6">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>
        <div className="prose max-w-none">
          <MDXRemote
            source={project.content}
            components={createMarkdownComponents()}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>
        {(relatedPosts.devlogs.length > 0 || relatedPosts.articles.length > 0) && (
          <section
            className="mt-12 border-t pt-10"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="space-y-10">
              <div>
                <p className="section-kicker mb-2">프로젝트 기록</p>
                <h2 className="text-2xl font-semibold">관련 글</h2>
              </div>

              {relatedPosts.devlogs.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold">개발 기록</h3>
                  <div className="space-y-4">
                    {relatedPosts.devlogs.map((post) => (
                      <ProjectPostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {relatedPosts.articles.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold">같이 읽을 글</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {relatedPosts.articles.map((post) => (
                      <ProjectPostCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </article>
      <ScrollToTop />
    </div>
  );
}
