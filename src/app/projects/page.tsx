import { Suspense } from "react";
import { getAllProjects, buildProjectTagTree } from "@/lib/projects";
import { ProjectsHome } from "@/components/ProjectsHome";
import { siteContent } from "@/lib/siteContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로젝트",
  description: siteContent.projects.intro,
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
