import { NewsListScreen, newsListMetadata } from "@/components/pages/NewsListScreen";

export const metadata = newsListMetadata("ko");

export default function KoreanNewsPage() {
  return <NewsListScreen language="ko" />;
}
