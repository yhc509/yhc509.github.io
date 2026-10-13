import {
  generateNewsIssueMetadata,
  generateNewsIssueStaticParams,
  NewsIssueScreen,
  type NewsIssuePageProps,
} from "@/components/pages/NewsIssueScreen";

export const generateStaticParams = generateNewsIssueStaticParams;

export function generateMetadata(props: NewsIssuePageProps) {
  return generateNewsIssueMetadata(props, "ko");
}

export default function KoreanNewsIssuePage(props: NewsIssuePageProps) {
  return <NewsIssueScreen {...props} language="ko" />;
}
