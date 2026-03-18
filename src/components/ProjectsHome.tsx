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
  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const searchQuery = searchParams.get("q") ?? "";

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

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 relative">
      {tagTree.length > 0 && (
        <div
          className="hidden lg:block absolute right-full mr-8"
          style={{ width: "200px", top: "40px" }}
        >
          <ProjectTagFilter
            tagTree={tagTree}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
          />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Projects</h1>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="프로젝트 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: "var(--card-bg)",
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
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                }}
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:opacity-70 transition-opacity"
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
          <div className="lg:hidden mb-4">
            <ProjectTagFilter
              tagTree={tagTree}
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}?${searchParams.toString()}`}
            className="group block rounded-xl overflow-hidden border transition-all hover:shadow-lg"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h2
                className="font-bold text-lg mb-1 group-hover:underline"
                style={{ color: "var(--foreground)" }}
              >
                {project.title}
              </h2>
              <p
                className="text-sm mb-2 line-clamp-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {project.description}
              </p>
              <div className="flex items-center justify-between">
                <time
                  dateTime={project.date}
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {project.date}
                </time>
                {project.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap justify-end">
                    {project.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "var(--card-border)",
                          color: "var(--text-muted)",
                        }}
                      >
                        #{tag.split("/").pop()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div
          className="text-center py-12"
          style={{ color: "var(--text-muted)" }}
        >
          검색 결과가 없습니다.
        </div>
      )}
    </div>
  );
}
