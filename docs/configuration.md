# 설정 가이드

## 환경 변수

`.env.local` 파일 생성:

```env
# 필수: 사이트 기본 URL (SEO에 사용)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 사이트 정보 변경

### 블로그 제목 및 설명

`src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: "내 블로그",           // 기본 제목
    template: "%s | 내 블로그",     // 포스트 제목 템플릿
  },
  description: "블로그 설명",
  keywords: ["키워드1", "키워드2"],
  authors: [{ name: "작성자 이름" }],
  // ...
};
```

### 헤더 로고

`src/app/layout.tsx`의 `<Link>` 컴포넌트:

```tsx
<Link href="/">
  내 블로그  {/* 또는 <Image> 컴포넌트로 로고 이미지 */}
</Link>
```

## SEO 설정

### Google Search Console 인증

`src/app/layout.tsx`의 `verification` 속성:

```typescript
verification: {
  google: "your-google-verification-code",
},
```

### Naver Search Advisor 인증

```typescript
verification: {
  other: {
    "naver-site-verification": "your-naver-code",
  },
},
```

### Open Graph 이미지

기본 OG 이미지 설정:

```typescript
openGraph: {
  images: [
    {
      url: "/og-image.png",  // public/og-image.png
      width: 1200,
      height: 630,
    },
  ],
},
```

## 테마 커스터마이징

### 색상 변경

`src/app/globals.css`:

```css
:root {
  /* 라이트 모드 */
  --background: #f8f7f4;      /* 배경색 */
  --foreground: #2d2d2d;      /* 텍스트 색 */
  --card-bg: #ffffff;         /* 카드 배경 */
  --card-border: #e8e6e1;     /* 테두리 색 */
  --text-secondary: #6b6b6b;  /* 보조 텍스트 */
  --text-muted: #9a9a9a;      /* 흐린 텍스트 */
  --accent: #4a6fa5;          /* 강조색 (링크 등) */
  --header-bg: #e8e6e1;       /* 헤더 배경 */
}

[data-theme="dark"] {
  /* 다크 모드 */
  --background: #1c1c1e;
  --foreground: #e5e5e5;
  /* ... */
}
```

### 폰트 변경

`src/app/globals.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONT&display=swap');

body {
  font-family: 'YOUR_FONT', sans-serif;
}
```

## MDX 설정

### 커스텀 컴포넌트

`mdx-components.tsx`에서 MDX 요소 커스터마이징:

```tsx
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 기본 요소 오버라이드
    h1: ({ children }) => <h1 className="custom-h1">{children}</h1>,
    a: ({ href, children }) => <a href={href} target="_blank">{children}</a>,

    // 커스텀 컴포넌트 추가
    Callout: ({ children }) => <div className="callout">{children}</div>,

    ...components,
  };
}
```

### remark/rehype 플러그인

`next.config.ts`:

```typescript
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // remarkGfm,  // GitHub Flavored Markdown
    ],
    rehypePlugins: [
      // rehypePrism,  // 코드 하이라이팅
    ],
  },
});
```

## 레이아웃 설정

### 콘텐츠 너비

`src/components/BlogHome.tsx`, `src/components/ProjectsHome.tsx` 및 상세 페이지:

```tsx
<div className="max-w-3xl mx-auto">  {/* 768px */}
```

다른 너비 옵션:
- `max-w-2xl`: 672px
- `max-w-4xl`: 896px
- `max-w-5xl`: 1024px

### 사이드바 너비

`src/components/BlogHome.tsx`, `src/components/ProjectsHome.tsx`:

```tsx
<aside className="w-56">  {/* 224px */}
```

### 프로젝트 그리드

`src/components/ProjectsHome.tsx`:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
```

3열 그리드로 변경:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 네비게이션 설정

`src/components/NavLinks.tsx`에서 네비게이션 메뉴 커스터마이징:

```tsx
// 현재 메뉴 구성
- 포스트 (/)
- 프로젝트 (/projects)
- 소개 (/about)
```

메뉴 추가/삭제 시 해당 파일에서 `<Link>` 컴포넌트와 `isXxxActive` 변수 수정.

## 배포

수동 배포 스크립트는 사용하지 않는다. `deploy.sh`는 제거했다.

이 저장소는 블로그 소스만 관리한다. 실제 배포는 `yhc509.github.io` 저장소의 GitHub Actions가 맡는다.

배포 전에 로컬에서 확인:

```bash
npm run lint
npm run build
```

배포 흐름:

1. 이 저장소에서 변경 사항을 커밋한다.
2. GitHub Pages 배포 저장소에 변경을 반영한다.
3. `main` 브랜치에 푸시하면 GitHub Actions가 `out/` 결과물을 배포한다.
