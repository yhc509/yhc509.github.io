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
    headline: "Posts",
    headlineEn: "Posts",
  },
  about: {
    headline: "kinkeep.dev",
    title: "소개",
    titleEn: "About",
    intro: `2017년부터 Unity 모바일 게임 클라이언트 프로그래머로 일하고 있습니다. 개인 작업으로는 자체 웹엔진을 만들며 HD-2D SRPG를 개발하고 있습니다. 개발은 AI 에이전트와 함께 합니다. 작업 환경과 규칙, 즉 하네스를 직접 만들고 그 안에서 AI를 굴리는 방식입니다.

이 블로그에서는 이런 것들을 다룹니다.
- 게임 엔진과 그래픽스
- AI 에이전트 개발과 하네스 엔지니어링
- 개인 게임 개발 기록
- AI 도구 뉴스 (제가 직접 쓰는 도구만)`,
    introEn: `I've been a Unity mobile game client programmer since 2017. On my own time, I'm building an HD-2D SRPG on a web engine I'm writing myself. I develop with AI agents: I build the harness, meaning the working environment and rules, and run the AI inside it.

This blog covers:
- Game engines and graphics
- AI agent development and harness engineering
- My own game development log
- AI tool news (only tools I actually use)`,
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
    searchPlaceholder: "제목, 요약, 태그로 검색...",
    searchPlaceholderEn: "Search by title, summary, or tag...",
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
