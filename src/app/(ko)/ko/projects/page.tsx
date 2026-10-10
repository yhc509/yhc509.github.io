import { ProjectsScreen, projectsMetadata } from "@/components/pages/ProjectsScreen";

export const metadata = projectsMetadata("ko");

export default function KoreanProjectsPage() {
  return <ProjectsScreen language="ko" />;
}
