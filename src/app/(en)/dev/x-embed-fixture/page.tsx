import type { Metadata } from "next";
import { XEmbedFixtureScreen } from "@/components/pages/XEmbedFixtureScreen";

export const metadata: Metadata = {
  title: "X embed fixture",
  robots: { index: false, follow: false },
};

export default function XEmbedFixturePage() {
  return <XEmbedFixtureScreen />;
}
