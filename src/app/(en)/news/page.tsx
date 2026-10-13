import { NewsListScreen, newsListMetadata } from "@/components/pages/NewsListScreen";

export const metadata = newsListMetadata("en");

export default function EnglishNewsPage() {
  return <NewsListScreen language="en" />;
}
