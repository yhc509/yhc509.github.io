import type { Metadata } from "next";
import type { DevLanguage } from "@/lib/devLanguage";

const MIN_TITLE_LENGTH = 30;
const MAX_TITLE_LENGTH = 60;
const FORBIDDEN_TITLE_CHARS = /[·・—–]/u;

const indexDocumentTitles = {
  home: {
    en: "kinkeep.dev | Game Engines, Graphics and AI Agent Dev",
    ko: "kinkeep.dev | 게임 엔진, 그래픽스, AI 에이전트 개발",
  },
  news: {
    en: "kinkeep.dev | News on the AI Tools I Actually Use",
    ko: "kinkeep.dev | 내가 쓰는 AI 도구 뉴스 요약",
  },
  about: {
    en: "kinkeep.dev | About a Unity Game Programmer",
    ko: "kinkeep.dev | Unity 게임 프로그래머 소개",
  },
} as const satisfies Record<string, Record<DevLanguage, string>>;

export type IndexDocumentPage = keyof typeof indexDocumentTitles;

export function indexDocumentTitle(
  page: IndexDocumentPage,
  language: DevLanguage,
): string {
  const title = indexDocumentTitles[page][language];

  if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `${page} ${language} document title is ${title.length} characters. Keep it between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH}.`,
    );
  }

  if (FORBIDDEN_TITLE_CHARS.test(title)) {
    throw new Error(
      `${page} ${language} document title uses a middle dot or dash.`,
    );
  }

  return title;
}

export function absoluteDocumentTitle(title: string): Pick<Metadata, "title"> {
  return {
    title: { absolute: title },
  };
}
