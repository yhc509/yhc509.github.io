import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

export const metadata: Metadata = {
  title: "소개",
  description: "블로그 주인장을 소개합니다.",
};

function getAboutContent(): string {
  const filePath = path.join(process.cwd(), "content/about.mdx");
  return fs.readFileSync(filePath, "utf8");
}

export default function AboutPage() {
  const content = getAboutContent();

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="prose max-w-none">
        <MDXRemote source={content} />
      </div>
    </div>
  );
}
