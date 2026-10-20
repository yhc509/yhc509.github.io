import Link from "next/link";
import type { Metadata } from "next";
import { getSlidesForLanguage } from "@/lib/slides";
import { localizedPath, type DevLanguage } from "@/lib/devLanguage";
import { absoluteDocumentTitle, indexDocumentTitle } from "@/lib/documentTitle";
import { clampMetaDescription } from "@/lib/metaDescription";
import { pageAlternates, pageSocial, toSiteUrl } from "@/lib/site";
import {
  breadcrumbList,
  jsonLdGraph,
  mainEntityOfPage,
  websiteReference,
} from "@/lib/structuredData";

const copy = {
  en: {
    title: "Slides",
    description: "Talks and session decks, viewed on the site.",
    empty: "No slides yet.",
    home: "Home",
    slides: (count: number) => (count === 1 ? "1 slide" : `${count} slides`),
  },
  ko: {
    title: "발표자료",
    description: "발표와 세션 슬라이드를 사이트에서 본다.",
    empty: "아직 발표자료가 없다.",
    home: "홈",
    slides: (count: number) => `${count}장`,
  },
} as const;

export function slidesListMetadata(language: DevLanguage): Metadata {
  const description = clampMetaDescription(copy[language].description);
  const title = indexDocumentTitle("slides", language);
  const path = language === "en" ? "/slides" : "/ko/slides";

  return {
    ...absoluteDocumentTitle(title),
    description,
    alternates: pageAlternates(language, path, "/slides", "/ko/slides"),
    ...pageSocial(language, path, title, description),
  };
}

export function SlidesListScreen({ language }: { language: DevLanguage }) {
  const decks = getSlidesForLanguage(language);
  const text = copy[language];
  const path = language === "en" ? "/slides" : "/ko/slides";
  const pageUrl = toSiteUrl(path);
  const homeUrl = toSiteUrl(language === "en" ? "/" : "/ko");
  const listJsonLd = jsonLdGraph([
    {
      "@type": "CollectionPage",
      "@id": pageUrl,
      url: pageUrl,
      name: text.title,
      description: clampMetaDescription(text.description),
      inLanguage: language,
      isPartOf: websiteReference(),
      mainEntityOfPage: mainEntityOfPage(pageUrl),
    },
    breadcrumbList([
      { name: text.home, item: homeUrl },
      { name: text.title, item: pageUrl },
    ]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />
      <section className="pt-6 pb-1 sm:pt-7">
        <div className="border-b pb-5" style={{ borderColor: "var(--card-border)" }}>
          <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{text.title}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            {text.description}
          </p>
        </div>
      </section>
      {decks.length === 0 ? (
        <p
          className="border-b py-8"
          style={{ color: "var(--text-muted)", borderColor: "var(--card-border)" }}
        >
          {text.empty}
        </p>
      ) : (
        <ul className="slide-gallery">
          {decks.map((deck) => (
            <li key={deck.slug}>
              <Link href={localizedPath(`/slides/${deck.slug}`, language)}>
                <span className="slide-thumb">
                  <img
                    src={deck.thumbnail}
                    alt=""
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <h2 lang={deck.lang}>{deck.title}</h2>
                <p className="slide-card-meta">
                  <time dateTime={deck.date}>{deck.date}</time>
                  <span>{text.slides(deck.slideCount)}</span>
                </p>
                {deck.description ? (
                  <p className="slide-card-desc" lang={deck.lang}>
                    {deck.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
