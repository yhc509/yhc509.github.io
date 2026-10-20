import type { DevLanguage } from "./devLanguage";
import { decksForLanguage, readSlideDecks } from "./slides.mjs";

export type SlideDeck = {
  slug: string;
  title: string;
  date: string;
  description: string;
  lang: DevLanguage;
  draft: boolean;
  slides: string[];
  css: string;
  slideCount: number;
};

export function getAllSlides(): SlideDeck[] {
  return readSlideDecks() as SlideDeck[];
}

export function getSlidesForLanguage(language: DevLanguage): SlideDeck[] {
  return decksForLanguage(language) as SlideDeck[];
}

export function getSlide(slug: string): SlideDeck | null {
  return getAllSlides().find((deck) => deck.slug === slug) ?? null;
}
