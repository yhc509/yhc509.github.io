import { AboutScreen, aboutMetadata } from "@/components/pages/AboutScreen";

export function generateMetadata() {
  return aboutMetadata("en");
}

export default function AboutPage() {
  return <AboutScreen language="en" />;
}
