import {
  generateProjectMetadata,
  generateProjectStaticParams,
  ProjectScreen,
  type ProjectPageProps,
} from "@/components/pages/ProjectScreen";

export const generateStaticParams = generateProjectStaticParams;

export function generateMetadata(props: ProjectPageProps) {
  return generateProjectMetadata(props, "ko");
}

export default function KoreanProjectPage(props: ProjectPageProps) {
  return <ProjectScreen {...props} language="ko" />;
}
