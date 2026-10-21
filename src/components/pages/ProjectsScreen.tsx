import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { ProjectsHome } from "@/components/ProjectsHome";
import type { DevLanguage } from "@/lib/devLanguage";
import { clampMetaDescription } from "@/lib/metaDescription";
import { pageAlternates } from "@/lib/site";
import { getProjectsCopy } from "@/lib/siteContent";

export function projectsMetadata(language: DevLanguage): Metadata {
  const copy = getProjectsCopy(language);
  const englishPath = "/projects";
  const koreanPath = "/ko/projects";
  const canonicalPath = language === "en" ? englishPath : koreanPath;

  return {
    title: copy.headline,
    description: clampMetaDescription(copy.description),
    alternates: pageAlternates(language, canonicalPath, englishPath, koreanPath),
  };
}

export function ProjectsScreen({ language }: { language: DevLanguage }) {
  const projects = getAllProjects(language);

  return (
    <>
      <ProjectsHome projects={projects} />
    </>
  );
}
