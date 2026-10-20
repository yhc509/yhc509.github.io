import {
  generateSlideMetadata,
  generateSlideStaticParams,
  SlideDeckScreen,
  type SlideDeckPageProps,
} from "@/components/pages/SlideDeckScreen";

export const generateStaticParams = generateSlideStaticParams;

export function generateMetadata(props: SlideDeckPageProps) {
  return generateSlideMetadata(props, "en");
}

export default function EnglishSlideDeckPage(props: SlideDeckPageProps) {
  return <SlideDeckScreen {...props} language="en" />;
}
