import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProjects, buildProjectTagTree } from "@/lib/projects";
import { ProjectsHome } from "@/components/ProjectsHome";
import type { DevLanguage } from "@/lib/devLanguage";
import { languageAlternates } from "@/lib/site";
import { getProjectsCopy } from "@/lib/siteContent";

export function projectsMetadata(language: DevLanguage): Metadata {
  const copy = getProjectsCopy(language);
  const englishPath = "/projects";
  const koreanPath = "/ko/projects";
  const canonicalPath = language === "en" ? englishPath : koreanPath;

  return {
    title: copy.headline,
    description: copy.description,
    alternates: languageAlternates(canonicalPath, englishPath, koreanPath),
  };
}

export function ProjectsScreen({ language }: { language: DevLanguage }) {
  const projects = getAllProjects(language);
  const tagTree = buildProjectTagTree(projects);

  return (
    <Suspense>
      <ProjectsHome projects={projects} tagTree={tagTree} />
    </Suspense>
  );
}
