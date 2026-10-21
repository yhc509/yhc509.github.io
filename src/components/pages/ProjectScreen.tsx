import { personReference } from "@/lib/author";
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
import { KoreanFallbackNote } from "@/components/KoreanFallbackNote";
import { ProjectExternalLinks } from "@/components/ProjectExternalLinks";
import { ScrollToTop } from "@/components/ScrollToTop";
import type { Metadata } from "next";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { clampMetaDescription } from "@/lib/metaDescription";
import { pageAlternates, toSiteUrl } from "@/lib/site";

const EMPTY_PROJECT_SLUG = "__empty__";

export interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

function ProjectPostCard({
  post,
  language,
}: {
  post: PostMeta;
  language: DevLanguage;
}) {
  return (
    <Link
      href={localizedPath(`/posts/${post.slug}`, language)}
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

function projectPaths(slug: string) {
  return {
    englishPath: `/projects/${slug}`,
    koreanPath: `/ko/projects/${slug}`,
  };
}

function projectImagePath(slug: string, language: DevLanguage) {
  return language === "ko" ? `/og/ko/projects/${slug}.png` : `/og/projects/${slug}.png`;
}

export function generateProjectStaticParams() {
  const slugs = getAllProjectSlugs();
  if (slugs.length === 0) {
    return [{ slug: EMPTY_PROJECT_SLUG }];
  }

  return slugs.map((slug) => ({ slug }));
}

export async function generateProjectMetadata(
  { params }: ProjectPageProps,
  language: DevLanguage
): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = getProjectBySlug(slug, language);
    if (!project.open) {
      return {
        title: "Project Not Found",
      };
    }
    const { englishPath, koreanPath } = projectPaths(slug);
    const canonicalPath =
      language === "en" && project.missingEnglish
        ? koreanPath
        : language === "en"
          ? englishPath
          : koreanPath;
    const url = toSiteUrl(canonicalPath);
    const description = clampMetaDescription(project.description);
    const imagePath = projectImagePath(slug, language);
    const contentLanguage = language === "ko" || project.missingEnglish ? "ko" : "en";

    return {
      title: project.title,
      description,
      keywords: [project.role],
      openGraph: {
        type: "article",
        locale: contentLanguage === "en" ? "en_US" : "ko_KR",
        title: project.title,
        description,
        url,
        publishedTime: project.date,
        images: [
          {
            url: toSiteUrl(imagePath),
            width: 1200,
            height: 630,
            alt: project.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description,
        images: [toSiteUrl(imagePath)],
      },
      alternates: pageAlternates(language, canonicalPath, englishPath, koreanPath),
    };
  } catch {
    return {
      title: "Project Not Found",
    };
  }
}

export async function ProjectScreen({
  params,
  language,
}: ProjectPageProps & { language: DevLanguage }) {
  const { slug } = await params;
  const useEnglish = language === "en";

  if (slug === EMPTY_PROJECT_SLUG) {
    notFound();
  }

  let project: ReturnType<typeof getProjectBySlug>;

  try {
    project = getProjectBySlug(slug, language);
  } catch {
    notFound();
  }

  if (!project.open) {
    notFound();
  }

  const relatedPosts = getProjectPostGroups(slug, language);
  const contentLanguage = language === "ko" || project.missingEnglish ? "ko" : "en";
  const roleLabel = useEnglish ? "Role" : "역할";
  const linksLabel = useEnglish ? "Links" : "링크";
  const highlightsLabel = useEnglish ? "Highlights" : "구성";
  const projectLogsLabel = useEnglish ? "Project logs" : "프로젝트 기록";
  const relatedPostsLabel = useEnglish ? "Related posts" : "관련 글";
  const developmentLogsLabel = useEnglish ? "Development logs" : "개발 기록";
  const furtherReadingLabel = useEnglish ? "Further reading" : "같이 읽을 글";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.title,
    description: project.description,
    inLanguage: contentLanguage,
    datePublished: project.date,
    codeRepository: project.links.github,
    author: personReference(),
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
      <KoreanFallbackNote
        show={useEnglish && project.missingEnglish}
        message="This project is only available in Korean."
      />
      <article lang={contentLanguage}>
        <header
          className="mb-8 pb-8 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="mb-6 flex justify-center">
            <div className="relative aspect-[315/250] w-full max-w-[420px] overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--card-border)" }}
            >
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 420px) 100vw, 420px"
              />
            </div>
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
              <p className="section-kicker sm:pt-1">{roleLabel}</p>
              <p className="text-sm leading-6">{project.role}</p>

              <p className="section-kicker sm:pt-1">{linksLabel}</p>
              <ProjectExternalLinks links={project.links} />

              <p className="section-kicker sm:pt-1">{highlightsLabel}</p>
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
                <p className="section-kicker mb-2">{projectLogsLabel}</p>
                <h2 className="text-2xl font-semibold">{relatedPostsLabel}</h2>
              </div>

              {relatedPosts.devlogs.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold">
                    {developmentLogsLabel}
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.devlogs.map((post) => (
                      <ProjectPostCard key={post.slug} post={post} language={language} />
                    ))}
                  </div>
                </div>
              )}

              {relatedPosts.articles.length > 0 && (
                <div>
                  <h3 className="mb-4 text-xl font-semibold">
                    {furtherReadingLabel}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {relatedPosts.articles.map((post) => (
                      <ProjectPostCard key={post.slug} post={post} language={language} />
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
