import { HomeScreen, homeMetadata } from "@/components/pages/HomeScreen";

export const metadata = homeMetadata("ko");

export default function KoreanHome() {
  return <HomeScreen language="ko" />;
}
