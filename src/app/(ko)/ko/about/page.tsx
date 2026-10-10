import { AboutScreen, aboutMetadata } from "@/components/pages/AboutScreen";

export function generateMetadata() {
  return aboutMetadata("ko");
}

export default function KoreanAboutPage() {
  return <AboutScreen language="ko" />;
}
