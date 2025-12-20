# 콘텐츠 작성 가이드

## 포스트 생성

### 파일 위치

```
content/posts/your-post-slug.mdx
```

파일명이 URL slug가 됩니다:
- `hello-world.mdx` → `/posts/hello-world`
- `react-hooks.mdx` → `/posts/react-hooks`

### 기본 구조

```mdx
---
title: "포스트 제목"
date: "2025-12-17"
description: "포스트에 대한 짧은 설명 (SEO 메타 설명으로 사용)"
tags:
  - "태그1"
  - "태그2"
---

# 본문 시작

여기에 마크다운으로 내용을 작성합니다.
```

### Frontmatter 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | ✅ | 포스트 제목 |
| `date` | ✅ | 작성일 (YYYY-MM-DD) |
| `description` | ✅ | 짧은 설명 (SEO용) |
| `tags` | ❌ | 태그 배열 |

## 프로젝트 생성

### 파일 위치

```
content/projects/your-project-slug.mdx
```

파일명이 URL slug가 됩니다:
- `blog-platform.mdx` → `/projects/blog-platform`
- `mobile-app.mdx` → `/projects/mobile-app`

### 기본 구조

```mdx
---
title: "프로젝트 제목"
date: "2025-12-17"
description: "프로젝트에 대한 짧은 설명"
thumbnail: "/images/projects/my-project.png"
tags:
  - "web/frontend"
  - "react"
---

## 프로젝트 소개

프로젝트 설명을 작성합니다.

### 주요 기능

- 기능 1
- 기능 2

### 기술 스택

- React
- TypeScript
```

### Frontmatter 필드

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | ✅ | 프로젝트 제목 |
| `date` | ✅ | 작성일 (YYYY-MM-DD) |
| `description` | ✅ | 짧은 설명 (SEO용) |
| `thumbnail` | ❌ | 썸네일 이미지 경로 (기본: `/images/default-project.svg`) |
| `tags` | ❌ | 태그 배열 (포스트 태그와 별개) |

### 썸네일 이미지

- 권장 크기: 800x450px (16:9 비율)
- 위치: `public/images/projects/`
- 형식: PNG, JPG, SVG, WebP

## 태그 시스템

포스트와 프로젝트는 각각 **독립적인 태그 시스템**을 가지고 있습니다.

### 기본 태그

```yaml
tags:
  - "개발"
  - "일상"
```

### 계층형 태그

`/`로 구분하여 최대 3단계까지:

```yaml
tags:
  - "개발/웹/React"        # 개발 > 웹 > React
  - "개발/웹/Next.js"      # 개발 > 웹 > Next.js
  - "개발/언어/TypeScript" # 개발 > 언어 > TypeScript
```

### 태그 필터링 동작

- **단일 태그**: 해당 태그가 있는 모든 콘텐츠
- **복수 태그**: OR 조건 (하나라도 있으면 표시)
- **상위 태그 선택**: 하위 태그 콘텐츠도 모두 포함
  - `개발` 선택 시 → `개발/웹/React` 콘텐츠도 표시

### 포스트 vs 프로젝트 태그

- 포스트 태그: `/` 페이지에서 필터링
- 프로젝트 태그: `/projects` 페이지에서 필터링
- 두 태그 시스템은 서로 연동되지 않음

## 마크다운 문법

### 기본 문법

```markdown
# 제목 1
## 제목 2
### 제목 3

**굵게** *기울임* ~~취소선~~

- 목록 1
- 목록 2

1. 순서 목록
2. 순서 목록

[링크](https://example.com)

![이미지 설명](/images/example.png)

> 인용문

`인라인 코드`
```

### 코드 블록

````markdown
```typescript
const greeting: string = "Hello, World!";
console.log(greeting);
```
````

지원 언어: `javascript`, `typescript`, `jsx`, `tsx`, `css`, `html`, `json`, `bash`, `python` 등

### 테이블

```markdown
| 헤더 1 | 헤더 2 | 헤더 3 |
|--------|--------|--------|
| 셀 1   | 셀 2   | 셀 3   |
| 셀 4   | 셀 5   | 셀 6   |
```

## MDX 기능

### React 컴포넌트 사용

MDX에서는 React 컴포넌트를 직접 사용할 수 있습니다:

```mdx
---
title: "MDX 예제"
---

import { MyComponent } from '@/components/MyComponent'

# 제목

일반 마크다운 텍스트

<MyComponent prop="value" />

더 많은 텍스트
```

### 커스텀 컴포넌트 예시

`mdx-components.tsx`에 정의 후 사용:

```mdx
<Callout type="warning">
  주의사항 내용
</Callout>

<Callout type="info">
  정보 내용
</Callout>
```

## 이미지

### 로컬 이미지

`public/images/` 폴더에 이미지 저장:

```markdown
![설명](/images/my-image.png)
```

### 외부 이미지

```markdown
![설명](https://example.com/image.png)
```

### Next.js Image 컴포넌트

```mdx
import Image from 'next/image'

<Image
  src="/images/my-image.png"
  alt="설명"
  width={800}
  height={400}
/>
```

## 작성 팁

### SEO를 위한 작성법

1. **제목**: 핵심 키워드 포함, 60자 이내
2. **설명**: 내용 요약, 150-160자
3. **태그**: 관련 키워드 3-5개
4. **본문**:
   - 첫 문단에 핵심 내용
   - 적절한 제목 구조 (h2, h3)
   - 이미지에 alt 텍스트

### 읽기 시간

자동으로 계산됩니다 (약 200 단어/분 기준)

### 날짜 형식

ISO 8601 형식 사용:
- ✅ `2025-12-17`
- ❌ `2025/12/17`
- ❌ `December 17, 2025`
