import { shouldUseEnglish } from "./devLanguage";

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
    headline: "KineticKeeper",
    title: "소개",
    titleEn: "About",
    intro:
      "2017- Unity 모바일 게임 클라이언트 프로그래머. 개발 경험과 AI 활용 워크플로우를 기록합니다.",
    introEn:
      "Unity mobile game client programmer since 2017. Writing about development work and AI-assisted workflows.",
    role: "- Unity 모바일 게임 클라이언트 프로그래머",
    roleEn: "- Unity mobile game client programmer",
    imageAlt: "KineticKeeper 프로필",
    imageAltEn: "KineticKeeper profile",
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
      "보안과 공개 범위를 정리한 뒤, 실험 프로젝트와 재현용 데모부터 순서대로 올릴 예정입니다.",
    emptyStateDescriptionEn:
      "After reviewing security and disclosure scope, experimental projects and reproducible demos will be published first.",
  },
} as const;

export function getSiteCopy() {
  const useEnglish = shouldUseEnglish();

  return {
    description: useEnglish
      ? siteContent.descriptionEn
      : siteContent.description,
    author: useEnglish ? siteContent.authorEn : siteContent.author,
  };
}

export function getBlogCopy() {
  const useEnglish = shouldUseEnglish();

  return {
    headline: useEnglish ? siteContent.blog.headlineEn : siteContent.blog.headline,
    searchPlaceholder: useEnglish
      ? siteContent.blog.searchPlaceholderEn
      : siteContent.blog.searchPlaceholder,
  };
}

export function getProjectsCopy() {
  const useEnglish = shouldUseEnglish();

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
