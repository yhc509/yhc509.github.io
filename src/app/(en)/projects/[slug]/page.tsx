import {
  generateProjectMetadata,
  generateProjectStaticParams,
  ProjectScreen,
  type ProjectPageProps,
} from "@/components/pages/ProjectScreen";

export const generateStaticParams = generateProjectStaticParams;

export function generateMetadata(props: ProjectPageProps) {
  return generateProjectMetadata(props, "en");
}

export default function ProjectPage(props: ProjectPageProps) {
  return <ProjectScreen {...props} language="en" />;
}
