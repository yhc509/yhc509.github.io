"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ProjectMeta, ProjectTagNode } from "@/lib/projects";
import { ProjectTagFilter } from "./ProjectTagFilter";

interface ProjectsHomeProps {
  projects: ProjectMeta[];
  tagTree: ProjectTagNode[];
}

export function ProjectsHome({ projects, tagTree }: ProjectsHomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("q") || "";

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
      !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTags && matchesSearch;
  });

  const hasProjects = projects.length > 0;
  const projectQueryString = searchParams.toString();
  const getProjectHref = (slug: string) =>
    projectQueryString ? `/projects/${slug}?${projectQueryString}` : `/projects/${slug}`;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 relative">
      <section
        className="mb-8 border-b pb-4"
        style={{ borderColor: "var(--card-border)" }}
      >
        <h1 className="text-2xl font-bold leading-snug sm:text-3xl">Project</h1>
      </section>

      {hasProjects && tagTree.length > 0 && (
        <div
          className="hidden lg:block absolute right-full mr-8"
          style={{ width: "200px", top: "240px" }}
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
              placeholder="프로젝트 검색..."
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

      {hasProjects && (
        <>
          {filteredProjects.length > 0 ? (
            <div>
              {filteredProjects.map((project) => (
                <Link
                  key={project.slug}
                  href={getProjectHref(project.slug)}
                  className="group block border-b py-5 transition-colors hover:opacity-85"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <article className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div
                        className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <time dateTime={project.date}>{project.date}</time>
                        {project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span key={tag}>#{tag.split("/").pop()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <h2
                        className="mb-2 text-lg font-bold leading-snug group-hover:underline"
                        style={{ color: "var(--foreground)" }}
                      >
                        {project.title}
                      </h2>
                      <p
                        className="max-w-2xl text-sm leading-6"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {project.description}
                      </p>
                    </div>
                    <div
                      className="relative aspect-[16/10] overflow-hidden rounded-xl sm:w-40 sm:flex-none"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <Image
                        src={project.thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
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
          )}
        </>
      )}
    </div>
  );
}
