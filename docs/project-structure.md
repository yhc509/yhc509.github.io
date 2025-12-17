# 프로젝트 구조

## 디렉토리 구조

```
blog/
├── content/
│   └── posts/                    # 블로그 포스트 (MDX)
│       ├── hello-world.mdx
│       └── ...
├── docs/                         # 프로젝트 문서
├── public/                       # 정적 파일 (이미지 등)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── globals.css           # 전역 스타일 + 테마 변수
│   │   ├── layout.tsx            # 루트 레이아웃 + 메타데이터
│   │   ├── page.tsx              # 홈페이지 (포스트 목록)
│   │   ├── sitemap.ts            # sitemap.xml 생성
│   │   ├── robots.ts             # robots.txt 생성
│   │   └── posts/
│   │       └── [slug]/
│   │           └── page.tsx      # 포스트 상세 페이지
│   ├── components/               # React 컴포넌트
│   │   ├── BackButton.tsx        # 뒤로가기 버튼
│   │   ├── BlogHome.tsx          # 홈페이지 메인 컴포넌트
│   │   ├── TagFilter.tsx         # 태그 필터 사이드바
│   │   ├── ThemeProvider.tsx     # 다크모드 Context
│   │   └── ThemeToggle.tsx       # 다크모드 토글 버튼
│   └── lib/
│       └── posts.ts              # 포스트 유틸리티 함수
├── mdx-components.tsx            # MDX 커스텀 컴포넌트
├── next.config.ts                # Next.js 설정
├── package.json
├── tailwind.config.ts            # Tailwind 설정 (v4는 CSS 기반)
└── tsconfig.json                 # TypeScript 설정
```

## 주요 파일 설명

### `src/lib/posts.ts`

포스트 관련 유틸리티 함수들:

| 함수 | 설명 |
|------|------|
| `getAllPostSlugs()` | 모든 포스트 slug 목록 반환 |
| `getPostBySlug(slug)` | slug로 포스트 조회 |
| `getAllPosts()` | 모든 포스트 메타데이터 (날짜순 정렬) |
| `buildTagTree(posts)` | 계층형 태그 트리 생성 |
| `filterPostsByTags(posts, tags)` | 태그로 포스트 필터링 |

### `src/components/BlogHome.tsx`

홈페이지 메인 컴포넌트:
- URL 쿼리 파라미터로 상태 관리 (`?tags=...&q=...`)
- 태그 필터링 (OR 조건)
- 검색 기능 (제목, 설명, 태그)

### `src/components/ThemeProvider.tsx`

다크모드 관리:
- `localStorage`에 테마 저장
- 시스템 설정 자동 감지
- `data-theme` 속성으로 CSS 변수 전환

### `src/app/globals.css`

테마 CSS 변수:

```css
:root {
  --background: #f8f7f4;
  --foreground: #2d2d2d;
  --card-bg: #ffffff;
  --card-border: #e8e6e1;
  --text-secondary: #6b6b6b;
  --text-muted: #9a9a9a;
  --accent: #4a6fa5;
  --header-bg: #e8e6e1;
}

[data-theme="dark"] {
  --background: #1c1c1e;
  --foreground: #e5e5e5;
  /* ... */
}
```

## 데이터 흐름

```
content/posts/*.mdx
        ↓
  gray-matter (frontmatter 파싱)
        ↓
  src/lib/posts.ts (데이터 처리)
        ↓
  src/app/page.tsx (목록) / src/app/posts/[slug]/page.tsx (상세)
        ↓
  next-mdx-remote (MDX 렌더링)
        ↓
  정적 HTML 생성
```
