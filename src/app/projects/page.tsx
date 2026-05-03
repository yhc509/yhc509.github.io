import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllProjects, buildProjectTagTree } from "@/lib/projects";
import { ProjectsHome } from "@/components/ProjectsHome";
import { shouldUseEnglish } from "@/lib/devLanguage";
import { siteContent } from "@/lib/siteContent";

const useEnglish = shouldUseEnglish();

export const metadata: Metadata = {
  title: useEnglish
    ? siteContent.projects.headlineEn
    : siteContent.projects.headline,
  description: useEnglish
    ? siteContent.projects.descriptionEn
    : siteContent.projects.description,
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const tagTree = buildProjectTagTree(projects);

  return (
    <Suspense>
      <ProjectsHome projects={projects} tagTree={tagTree} />
    </Suspense>
  );
}
