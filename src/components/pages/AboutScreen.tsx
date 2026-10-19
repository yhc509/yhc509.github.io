import type { Metadata } from "next";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ContactLinks } from "@/components/ContactLinks";
import { KoreanFallbackNote } from "@/components/KoreanFallbackNote";
import { createMarkdownComponents } from "@/components/MarkdownComponents";
import { getAboutContent, getAboutPageCopy } from "@/lib/aboutContent";
import type { DevLanguage } from "@/lib/devLanguage";
import { absoluteDocumentTitle, indexDocumentTitle } from "@/lib/documentTitle";
import { clampMetaDescription } from "@/lib/metaDescription";
import { pageAlternates, pageSocial, toSiteUrl } from "@/lib/site";
import { jsonLdGraph, personReference, websiteReference } from "@/lib/structuredData";

export async function aboutMetadata(language: DevLanguage): Promise<Metadata> {
  const about = getAboutPageCopy(language);
  const englishPath = "/about";
  const koreanPath = "/ko/about";
  const canonicalPath =
    language === "en" && about.missingEnglish ? koreanPath : language === "en" ? englishPath : koreanPath;
  const description = clampMetaDescription(about.description);
  const title = indexDocumentTitle("about", language);

  return {
    ...absoluteDocumentTitle(title),
    description,
    alternates: pageAlternates(language, canonicalPath, englishPath, koreanPath),
    ...pageSocial(language, canonicalPath, title, description),
  };
}

export function AboutScreen({ language }: { language: DevLanguage }) {
  const content = getAboutContent(language);
  const about = getAboutPageCopy(language);
  const contentLanguage = language === "ko" || about.missingEnglish ? "ko" : "en";
  const pagePath = language === "en" && about.missingEnglish ? "/ko/about" : language === "en" ? "/about" : "/ko/about";
  const pageUrl = toSiteUrl(pagePath);
  const profileJsonLd = jsonLdGraph([
    {
      "@type": "ProfilePage",
      "@id": pageUrl,
      url: pageUrl,
      name: about.headline,
      description: clampMetaDescription(about.description),
      inLanguage: contentLanguage,
      mainEntity: personReference(),
      isPartOf: websiteReference(),
    },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <KoreanFallbackNote
        show={language === "en" && about.missingEnglish}
        message="This page is only available in Korean."
      />
      <section
        className="mb-10 border-b pb-8"
        style={{ borderColor: "var(--card-border)" }}
        lang={contentLanguage}
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
          </div>
        </div>
      </section>
      <div className="prose max-w-none" lang={contentLanguage}>
        <MDXRemote
          source={content}
          components={createMarkdownComponents()}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
        <ContactLinks />
      </div>
    </div>
  );
}
