import type { DevLanguage } from "./devLanguage";

export const siteContent = {
  name: "kinkeep.dev",
  description:
    "Unity 클라이언트 프로그래머의 게임 엔진, 그래픽스, Agentic Coding, Harness Engineering 노트.",
  descriptionEn:
    "Notes on game engines, graphics, agentic coding, and harness engineering from a Unity client programmer.",
  author: "게임 프로그래머",
  authorEn: "Game Programmer",
  keywords: [
    "게임 프로그래머",
    "Unity",
    "Unreal",
    "Graphics",
    "Game Engine",
    "Agentic Coding",
    "Harness Engineering",
    "AI Workflow",
    "Coding Workflow",
    "Tech Blog",
  ],
  blog: {
    headline: "Posts",
    headlineEn: "Posts",
    searchPlaceholder: "검색...",
    searchPlaceholderEn: "Search...",
  },
  homeHero: {
    headline: "게임 엔진, 그래픽스, AI 에이전트 개발 노트",
    headlineEn: "Notes on game engines, graphics, and AI agent development",
  },
  about: {
    headline: "Unity 게임 프로그래머",
    headlineEn: "Unity game programmer",
    title: "소개",
    titleEn: "About",
    description: "Unity 클라이언트 프로그래머가 게임 엔진, 그래픽스, AI 에이전트 개발을 기록합니다.",
    descriptionEn:
      "Unity client programmer writing notes on game engines, graphics, and AI agent development.",
    imageAlt: "kinkeep.dev 프로필",
    imageAltEn: "kinkeep.dev profile",
  },
  projects: {
    headline: "프로젝트",
    headlineEn: "Projects",
    description: "공개 가능한 프로젝트만 적어둡니다.",
    descriptionEn: "Only publicly shareable projects are listed here.",
    intro: "공개 가능한 프로젝트만 적어둡니다.",
    introEn: "Only publicly shareable projects are listed here.",
    searchPlaceholder: "제목, 요약으로 검색...",
    searchPlaceholderEn: "Search by title or summary...",
    emptyStateTitle: "공개 가능한 프로젝트를 정리 중입니다.",
    emptyStateTitleEn: "Public projects are being organized.",
    emptyStateDescription:
      "공개해도 되는 것부터 하나씩 올리겠습니다.",
    emptyStateDescriptionEn:
      "Projects go up here one by one as they're cleared to share.",
  },
} as const;

export function getSiteCopy(language: DevLanguage) {
  const useEnglish = language === "en";

  return {
    description: useEnglish
      ? siteContent.descriptionEn
      : siteContent.description,
    author: useEnglish ? siteContent.authorEn : siteContent.author,
  };
}

export function getBlogCopy(language: DevLanguage) {
  const useEnglish = language === "en";

  return {
    headline: useEnglish ? siteContent.blog.headlineEn : siteContent.blog.headline,
    searchPlaceholder: useEnglish
      ? siteContent.blog.searchPlaceholderEn
      : siteContent.blog.searchPlaceholder,
  };
}

export function getProjectsCopy(language: DevLanguage) {
  const useEnglish = language === "en";

  return {
    headline: useEnglish
      ? siteContent.projects.headlineEn
      : siteContent.projects.headline,
    description: useEnglish
      ? siteContent.projects.descriptionEn
      : siteContent.projects.description,
    searchPlaceholder: useEnglish
      ? siteContent.projects.searchPlaceholderEn
      : siteContent.projects.searchPlaceholder,
    emptyStateTitle: useEnglish
      ? siteContent.projects.emptyStateTitleEn
      : siteContent.projects.emptyStateTitle,
    emptyStateDescription: useEnglish
      ? siteContent.projects.emptyStateDescriptionEn
      : siteContent.projects.emptyStateDescription,
  };
}
