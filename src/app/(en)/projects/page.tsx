import { ProjectsScreen, projectsMetadata } from "@/components/pages/ProjectsScreen";

export const metadata = projectsMetadata("en");

export default function ProjectsPage() {
  return <ProjectsScreen language="en" />;
}
