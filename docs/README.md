# 블로그 프로젝트 문서

Next.js 16 + MDX 기반 정적 블로그입니다.

## 목차

- [프로젝트 구조](./project-structure.md)
- [설정 가이드](./configuration.md)
- [콘텐츠 작성 가이드](./content-guide.md)

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

## 주요 기능

- **MDX 지원**: 마크다운 + React 컴포넌트
- **계층형 태그**: 3단계 깊이까지 지원 (예: `개발/웹/React`)
- **검색**: 제목, 설명, 태그 검색
- **다크모드**: 시스템 설정 연동 + 수동 토글
- **SEO**: sitemap, robots.txt, Open Graph, JSON-LD
- **정적 생성**: 빠른 로딩 속도

## 기술 스택

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- MDX (next-mdx-remote)
- gray-matter (frontmatter 파싱)
