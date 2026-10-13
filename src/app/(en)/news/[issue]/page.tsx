import {
  generateNewsIssueMetadata,
  generateNewsIssueStaticParams,
  NewsIssueScreen,
  type NewsIssuePageProps,
} from "@/components/pages/NewsIssueScreen";

export const generateStaticParams = generateNewsIssueStaticParams;

export function generateMetadata(props: NewsIssuePageProps) {
  return generateNewsIssueMetadata(props, "en");
}

export default function EnglishNewsIssuePage(props: NewsIssuePageProps) {
  return <NewsIssueScreen {...props} language="en" />;
}
