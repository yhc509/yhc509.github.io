import { Suspense } from "react";
import { getAllProjects, buildProjectTagTree } from "@/lib/projects";
import { ProjectsHome } from "@/components/ProjectsHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로젝트",
  description: "Project",
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
