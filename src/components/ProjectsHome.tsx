"use client";

import Link from "next/link";
import Image from "next/image";
import { localizedPath } from "@/lib/devLanguage";
import { useLocationSearch } from "@/lib/useLocationSearch";
import { useDevLanguage } from "@/components/DevLanguageProvider";
import type { ProjectKind, ProjectMeta } from "@/lib/projects";
import { getProjectsCopy } from "@/lib/siteContent";
import { ProjectExternalLinks } from "@/components/ProjectExternalLinks";

interface ProjectsHomeProps {
  projects: ProjectMeta[];
}

interface ProjectCardProps {
  project: ProjectMeta;
  href: string;
}

function ProjectGridCard({ project, href }: ProjectCardProps) {
  return (
    <article className="min-w-0">
      <Link href={href} className="group block">
        <div
          className="relative aspect-[315/250] overflow-hidden rounded-xl border"
          style={{ borderColor: "var(--card-border)" }}
        >
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
        <h2
          className="mt-2 text-sm font-bold leading-snug transition-opacity group-hover:opacity-80 sm:text-[15px]"
          style={{ color: "var(--accent)" }}
        >
          {project.title}
        </h2>
      </Link>
      <p
        className="mt-1 line-clamp-2 text-xs leading-5 sm:text-sm sm:leading-6"
        style={{ color: "var(--text-secondary)" }}
      >
        {project.description}
      </p>
      <div className="mt-2">
        <ProjectExternalLinks links={project.links} compact />
      </div>
    </article>
  );
}

export function ProjectsHome({ projects }: ProjectsHomeProps) {
  const language = useDevLanguage();
  const useEnglish = language === "en";
  const { headline, description, searchPlaceholder, emptyStateTitle, emptyStateDescription } =
    getProjectsCopy(language);
  const [searchParams, navigate] = useLocationSearch();
  const searchQuery = searchParams.get("q") || "";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const updateSearch = (query: string) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    const queryString = params.toString();
    const projectsPath = localizedPath("/projects", language);
    navigate(`${projectsPath}${queryString ? `?${queryString}` : ""}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch(e.target.value);
  };

  const filteredProjects = projects.filter((project) => {
    if (normalizedSearchQuery.length === 0) {
      return true;
    }

    return [project.title, project.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearchQuery);
  });

  const hasProjects = projects.length > 0;
  const getProjectHref = (slug: string) =>
    localizedPath(`/projects/${slug}`, language);
  const searchAriaLabel = useEnglish ? "Search projects" : "프로젝트 검색";
  const emptySearchResultLabel = useEnglish
    ? "No results found."
    : "검색 결과가 없습니다.";
  const sectionLabels: Record<ProjectKind, string> = {
    game: useEnglish ? "Games" : "게임",
    tool: useEnglish ? "Tools" : "툴",
  };
  const projectSections = (["game", "tool"] as const).map((kind) => ({
    kind,
    label: sectionLabels[kind],
    projects: filteredProjects.filter((project) => project.kind === kind),
  }));

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <section
        className="mb-8 border-b pb-6"
        style={{ borderColor: "var(--card-border)" }}
      >
        <p className="section-kicker">PROJECTS</p>
        <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
          {headline}
        </h1>
        <p
          className="mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      </section>

      {hasProjects ? (
        <div
          className="mb-6 border-b pb-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
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
          <h2 className="text-xl font-bold">{emptyStateTitle}</h2>
          <p
            className="mt-3 text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            {emptyStateDescription}
          </p>
        </div>
      )}

      {hasProjects &&
        (filteredProjects.length > 0 ? (
          <div className="space-y-10">
            {projectSections.map((section) =>
              section.projects.length > 0 ? (
                <section key={section.kind}>
                  <h2 className="section-kicker mb-4">{section.label}</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
                    {section.projects.map((project) => (
                      <ProjectGridCard
                        key={project.slug}
                        project={project}
                        href={getProjectHref(project.slug)}
                      />
                    ))}
                  </div>
                </section>
              ) : null
            )}
          </div>
        ) : (
          <div
            className="py-8 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {emptySearchResultLabel}
          </div>
        ))}
    </div>
  );
}
