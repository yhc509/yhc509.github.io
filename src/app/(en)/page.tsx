import { HomeScreen, homeMetadata } from "@/components/pages/HomeScreen";

export const metadata = homeMetadata("en");

export default function Home() {
  return <HomeScreen language="en" />;
}
