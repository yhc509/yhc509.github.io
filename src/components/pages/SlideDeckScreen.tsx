import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SlideViewer } from "@/components/SlideViewer";
import { getSlide, getSlideSlugs } from "@/lib/slides";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { clampMetaDescription } from "@/lib/metaDescription";
import { pageAlternates, toSiteUrl } from "@/lib/site";
import {
  breadcrumbList,
  jsonLdGraph,
  mainEntityOfPage,
  personReference,
  websiteReference,
} from "@/lib/structuredData";

const EMPTY_SLUG = "__empty__";

export interface SlideDeckPageProps {
  params: Promise<{ slug: string }>;
}

export function generateSlideStaticParams() {
  const slugs = getSlideSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: EMPTY_SLUG }];
}

export async function generateSlideMetadata(
  { params }: SlideDeckPageProps,
  language: DevLanguage,
): Promise<Metadata> {
  const { slug } = await params;
  const deck = getSlide(slug, language) ?? getSlide(slug, language === "en" ? "ko" : "en");
  if (!deck) {
    return { robots: { index: false, follow: false } };
  }

  const englishPath = `/slides/${slug}`;
  const koreanPath = `/ko/slides/${slug}`;
  const canonical = deck.lang === "en" ? englishPath : koreanPath;
  const description = clampMetaDescription(deck.description);
  const inEnglish = deck.lang === "en";

  return {
    title: deck.title,
    description,
    robots: deck.draft ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      locale: inEnglish ? "en_US" : "ko_KR",
      title: deck.title,
      description,
      url: toSiteUrl(canonical),
      publishedTime: deck.date,
    },
    twitter: {
      card: "summary",
      title: deck.title,
      description,
    },
    alternates: pageAlternates(language, canonical, englishPath, koreanPath),
  };
}

export async function SlideDeckScreen({
  params,
  language,
}: SlideDeckPageProps & { language: DevLanguage }) {
  const { slug } = await params;
  const preferred = getSlide(slug, language);
  const deck = preferred ?? getSlide(slug, language === "en" ? "ko" : "en");
  if (!deck || slug === EMPTY_SLUG) {
    notFound();
  }

  const useEnglish = language === "en";
  const missingEnglish = useEnglish && deck.lang !== "en";
  const pagePath = localizedPath(`/slides/${deck.slug}`, language);
  const pageUrl = toSiteUrl(pagePath);
  const listUrl = toSiteUrl(localizedPath("/slides", language));
  const listName = useEnglish ? "Slides" : "발표자료";
  const backLabel = useEnglish ? "All slides" : "발표자료 목록";
  const jsonLd = jsonLdGraph([
    {
      "@type": "PresentationDigitalDocument",
      name: deck.title,
      description: clampMetaDescription(deck.description),
      inLanguage: deck.lang,
      url: pageUrl,
      mainEntityOfPage: mainEntityOfPage(pageUrl),
      datePublished: deck.date,
      author: personReference(),
      isPartOf: websiteReference(),
    },
    breadcrumbList([
      {
        name: useEnglish ? "Home" : "홈",
        item: toSiteUrl(localizedPath("/", language)),
      },
      { name: listName, item: listUrl },
      { name: deck.title, item: pageUrl },
    ]),
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style dangerouslySetInnerHTML={{ __html: deck.css }} />
      <SlideViewer
        slides={deck.slides}
        label={useEnglish && missingEnglish ? "Slides" : deck.title}
        title={deck.title}
        date={deck.date}
        backHref={localizedPath("/slides", language)}
        backLabel={backLabel}
        note={useEnglish && missingEnglish ? "This deck is only available in Korean." : null}
        language={language}
        contentLanguage={deck.lang}
      />
    </div>
  );
}
