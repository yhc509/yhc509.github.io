import { SlidesListScreen, slidesListMetadata } from "@/components/pages/SlidesListScreen";

export const metadata = slidesListMetadata("en");

export default function EnglishSlidesPage() {
  return <SlidesListScreen language="en" />;
}
