import { SiteFrame } from "@/components/SiteFrame";
import { rootMetadata } from "@/lib/rootMetadata";
import "../globals.css";

export const metadata = rootMetadata("ko");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteFrame language="ko">{children}</SiteFrame>;
}
