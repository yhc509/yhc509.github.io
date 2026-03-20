import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { siteContent } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "소개",
  description: siteContent.about.intro,
};

function getAboutContent(): string {
  const extensions = [".mdx", ".md"];
  for (const ext of extensions) {
    const filePath = path.join(process.cwd(), `content/about${ext}`);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  }
  throw new Error("About content not found");
}

export default function AboutPage() {
  const content = getAboutContent();

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <section
        className="mb-10 border-b pb-8"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="mx-auto shrink-0 sm:mx-0">
            <Image
              src="/profile.png"
              alt="yhc509 프로필"
              width={120}
              height={120}
              className="rounded-full object-cover"
              style={{
                border: "1px solid var(--card-border)",
              }}
            />
          </div>
          <div>
            <p className="section-kicker">소개</p>
            <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
              {siteContent.about.headline}
            </h1>
            <p className="mt-2 text-sm leading-6">- Unity 클라이언트 프로그래머</p>
          </div>
        </div>
      </section>
      <div className="prose max-w-none">
        <MDXRemote
          source={content}
          components={createMarkdownComponents()}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
      </div>
    </div>
  );
}
