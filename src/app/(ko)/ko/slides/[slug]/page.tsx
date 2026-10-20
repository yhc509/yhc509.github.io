import {
  generateSlideMetadata,
  generateSlideStaticParams,
  SlideDeckScreen,
  type SlideDeckPageProps,
} from "@/components/pages/SlideDeckScreen";

export const generateStaticParams = generateSlideStaticParams;

export function generateMetadata(props: SlideDeckPageProps) {
  return generateSlideMetadata(props, "ko");
}

export default function KoreanSlideDeckPage(props: SlideDeckPageProps) {
  return <SlideDeckScreen {...props} language="ko" />;
}
