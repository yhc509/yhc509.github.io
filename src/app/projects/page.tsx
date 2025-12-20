import { Suspense } from "react";
import { getAllProjects, buildProjectTagTree } from "@/lib/projects";
import { ProjectsHome } from "@/components/ProjectsHome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "프로젝트 모음입니다.",
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
