# 블로그 프로젝트 문서

Next.js 16 + MDX 기반 정적 블로그입니다.

이 저장소 하나가 소스 저장소이자 GitHub Pages 배포 기준 저장소입니다.

## 목차

- [프로젝트 구조](./project-structure.md)
- [설정 가이드](./configuration.md)
- [콘텐츠 작성 가이드](./content-guide.md)

## 빠른 시작

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

## 배포 흐름

1. 이 저장소에서 수정합니다.
2. `main` 브랜치에 push 합니다.
3. GitHub Actions가 정적 사이트를 빌드해서 GitHub Pages에 배포합니다.

## 주요 기능

- **MDX 지원**: 마크다운 + React 컴포넌트
- **포스트**: 블로그 글 작성 및 관리
- **프로젝트**: 포트폴리오/프로젝트 쇼케이스 (이미지 중심 그리드)
- **계층형 태그**: 3단계 깊이까지 지원 (예: `개발/웹/React`)
  - 포스트와 프로젝트 각각 독립적인 태그 시스템
- **검색**: 제목, 설명 검색
- **다크모드**: 시스템 설정 연동 + 수동 토글
- **SEO**: sitemap, robots.txt, Open Graph, JSON-LD
- **정적 생성**: 빠른 로딩 속도

## 콘텐츠 구조

```
content/
├── posts/      # 블로그 포스트 (MDX)
├── projects/   # 프로젝트 (MDX, 썸네일 이미지 포함)
└── about.mdx   # 소개 페이지
```

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- MDX (next-mdx-remote)
- gray-matter (frontmatter 파싱)
- GitHub Pages + GitHub Actions
