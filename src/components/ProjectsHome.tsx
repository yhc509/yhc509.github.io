"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ProjectMeta, ProjectTagNode } from "@/lib/projects";
import { siteContent } from "@/lib/siteContent";
import { ProjectTagFilter } from "./ProjectTagFilter";

interface ProjectsHomeProps {
  projects: ProjectMeta[];
  tagTree: ProjectTagNode[];
}

interface ProjectCardProps {
  project: ProjectMeta;
  href: string;
}

function ProjectSummaryCard({ project, href }: ProjectCardProps) {
  return (
    <article
      className="border-b py-8 first:pt-0 last:border-b-0 last:pb-0"
      style={{ borderColor: "var(--card-border)" }}
    >
      <Link
        href={href}
        className="group relative block aspect-[16/10] overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--card-border)" }}
      >
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <h2 className="mt-4 text-lg font-bold leading-snug sm:text-xl">
        <Link href={href} className="transition-opacity hover:opacity-75">
          {project.title}
        </Link>
      </h2>

      <ul
        className="mt-4 space-y-2 text-sm leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {project.highlights.slice(0, 3).map((highlight) => (
          <li key={highlight} className="pl-4 -indent-4">
            - {highlight}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--foreground)" }}
        >
          상세 보기
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export function ProjectsHome({ projects, tagTree }: ProjectsHomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTags =
    searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("q") || "";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const updateURL = (tags: string[], query: string) => {
    const params = new URLSearchParams();
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }
    if (query) {
      params.set("q", query);
    }
    const queryString = params.toString();
    router.push(`/projects${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleTagsChange = (tags: string[]) => {
    updateURL(tags, searchQuery);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    updateURL(selectedTags, query);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((t) => t !== tagToRemove);
    handleTagsChange(newTags);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((selectedTag) =>
        project.tags.some(
          (projectTag) =>
            projectTag === selectedTag || projectTag.startsWith(selectedTag + "/")
        )
      );

    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      [
        project.title,
        project.description,
        project.role,
        ...project.highlights,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearchQuery);

    return matchesTags && matchesSearch;
  });

  const hasProjects = projects.length > 0;
  const projectQueryString = searchParams.toString();
  const getProjectHref = (slug: string) =>
    projectQueryString
      ? `/projects/${slug}?${projectQueryString}`
      : `/projects/${slug}`;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 relative">
      <section
        className="mb-8 border-b pb-6"
        style={{ borderColor: "var(--card-border)" }}
      >
        <p className="section-kicker">PROJECTS</p>
        <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
          {siteContent.projects.headline}
        </h1>
        <p
          className="mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {siteContent.projects.intro}
        </p>
      </section>

      {hasProjects && tagTree.length > 0 && (
        <div
          className="hidden lg:block absolute right-full mr-8"
          style={{ width: "200px", top: "280px" }}
        >
          <ProjectTagFilter
            tagTree={tagTree}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
          />
        </div>
      )}

      {hasProjects ? (
        <div
          className="mb-6 border-b pb-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="relative mb-4">
            <input
              type="text"
              placeholder={siteContent.projects.searchPlaceholder}
              aria-label="프로젝트 검색"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{
                backgroundColor: "transparent",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {selectedTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "white",
                  }}
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 transition-opacity hover:opacity-70"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {tagTree.length > 0 && (
            <div className="mb-4 lg:hidden">
              <ProjectTagFilter
                tagTree={tagTree}
                selectedTags={selectedTags}
                onTagsChange={handleTagsChange}
              />
            </div>
          )}
        </div>
      ) : null}

      {!hasProjects && (
        <div
          className="rounded-3xl border px-6 py-10 text-center"
          style={{
            borderColor: "var(--card-border)",
            backgroundColor: "var(--card-bg)",
          }}
        >
          <h2 className="text-xl font-bold">{siteContent.projects.emptyStateTitle}</h2>
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {siteContent.projects.emptyStateDescription}
          </p>
        </div>
      )}

      {hasProjects && (
        filteredProjects.length > 0 ? (
          <section>
            {filteredProjects.map((project) => (
              <ProjectSummaryCard
                key={project.slug}
                project={project}
                href={getProjectHref(project.slug)}
              />
            ))}
          </section>
        ) : (
          <div
            className="border-b py-8 text-center"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--card-border)",
            }}
          >
            검색 결과가 없습니다.
          </div>
        )
      )}
    </div>
  );
}
