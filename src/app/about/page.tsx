import type { Metadata } from "next";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { getAboutContent, getAboutPageCopy } from "@/lib/aboutContent";


export async function generateMetadata(): Promise<Metadata> {
  const about = getAboutPageCopy();

  return {
    title: about.title,
    description: about.intro,
  };
}

export default async function AboutPage() {
  const content = getAboutContent();
  const about = getAboutPageCopy();

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
              alt={about.imageAlt}
              width={120}
              height={120}
              className="rounded-full object-cover"
              style={{
                border: "1px solid var(--card-border)",
              }}
            />
          </div>
          <div>
            <p className="section-kicker">{about.title}</p>
            <h1 className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
              {about.headline}
            </h1>
            <p className="mt-2 text-sm leading-6">{about.role}</p>
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
