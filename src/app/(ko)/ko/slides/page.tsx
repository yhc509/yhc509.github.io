import { SlidesListScreen, slidesListMetadata } from "@/components/pages/SlidesListScreen";

export const metadata = slidesListMetadata("ko");

export default function KoreanSlidesPage() {
  return <SlidesListScreen language="ko" />;
}
