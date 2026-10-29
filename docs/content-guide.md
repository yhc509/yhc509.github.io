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
categories:
  - "AI/AgenticCoding"
  - "Game Engine/Unity"
open: true
type: "article"
project: "project-slug"
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
| `categories` or `tags` | ❌ | 주제 탐색용 태그 배열 |
| `open` | ❌ | `false`면 공개 목록과 정적 생성에서 제외 |
| `type` | ❌ | `article`, `devlog`, `archive_candidate` |
| `project` | 프로젝트 글에서 권장 | 연결할 프로젝트 slug |
| `series` | ❌ | 연재 식별자 |

### 포스트 타입 규칙

- `article`: 학습 기록, 도구 후기, 개념 정리
- `devlog`: 실제 프로젝트에 연결되는 진행 기록
- `archive_candidate`: 보관 또는 재작성 후보

`type: devlog`인 글은 `project`를 함께 적고, 제목은 `Project Name Devlog N` 형식으로 맞춥니다.

### 태그 기준

- `categories`는 **주제만** 담습니다.
- 프로젝트명은 `categories`에 넣지 않고 `project` 필드로만 연결합니다.
- `Archive`는 사용자에게 보이는 태그가 아니라 `open: false` 또는 `type: archive_candidate` 같은 상태로 처리합니다.
- 권장 주제 축은 아래 정도입니다.
  - `AI/AgenticCoding`
  - `Game Engine/Unity`
  - `Game Engine/Unreal`
  - `Graphics/OpenGL`

예시:

- `Epoch: Unseen Devlog 3`
  - `type: devlog`
  - `project: project-t`
  - `categories: []`
- `Character Forge`
  - `type: article`
  - `project: project-t`
  - `categories: ['AI/AgenticCoding']`
- `UE5 애니메이션을 처음 공부하며 먼저 구분한 5가지`
  - `type: article`
  - `categories: ['Game Engine/Unreal']`

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

## 뉴스

한국어 호는 `content/news/YYYY-MM-DD.md`, 영어 호는 `content/news/YYYY-MM-DD-en.md`입니다. 파일명의 날짜가 주소입니다. 영어 파일의 꼭지 소제목은 영어입니다.

frontmatter에는 호 메타만 둡니다. 꼭지 글은 본문에 적습니다.

| 필드 | 필수 | 설명 |
|------|------|------|
| `issue` | ✅ | 호 번호. 1 이상의 정수 |
| `date` | ✅ | `YYYY-MM-DD`. 파일명과 같습니다 |
| `title` | ✅ | 호 제목 |
| `description` | ✅ | 짧은 설명. SEO 설명으로 씁니다 |
| `open` | ❌ | `false`면 공개 목록에서 빠집니다 |
| `thumbnail` | ❌ | `./img/<file>` 원본 이미지 |
| `thumbnailLabel` | ❌ | 썸네일 문구. `**굵게**`를 쓸 수 있습니다 |

꼭지는 2개에서 5개입니다. 각 꼭지는 `##` 제목으로 시작합니다.

1. 그림이 있으면 `chart`, `cards`, `matrix` 펜스 또는 `![설명](img/파일.png)` 한 줄을 둡니다.
2. 요약은 한 문단입니다. 문단 안에 빈 줄을 넣지 않습니다. 불릿은 `- `로 적습니다. 문단과 불릿 중 하나는 있어야 하고, 둘 다 있어도 됩니다.
3. X 글은 불릿 뒤에 주소만 있는 한 줄로 둡니다. 주소 줄 앞뒤에는 빈 줄을 둡니다. 카드는 바로 앞 불릿 아래에 그려지고, 카드 뒤에 불릿을 이어 쓸 수 있습니다. 불릿 없이 요약 문단 바로 뒤에는 둘 수 없습니다.
4. 출처는 `### 출처` 다음에 `[표시 이름](https://...)` 한 줄입니다. 영어 파일은 `### Source`입니다.
5. 코멘트가 있으면 `### 내 생각` 다음에 한 문단입니다. 영어 파일은 `### My take`입니다.

꼭지 뒤에 긴 글을 이어 쓸 수 있습니다. 그 글의 `##` 제목은 꼭지로 세지 않습니다. 긴 글의 소제목이 `### 출처`, `### Source`, `### 내 생각`, `### My take`이면 그 위치부터 꼭지로 읽힙니다. X 글은 주소만 있는 한 줄로 둡니다.

````markdown
## 꼭지 제목

```cards
logo: anthropic
cards:
  - icon: timer
    label: 한 줄 라벨
```

요약 한 문단.

- 불릿이 필요하면 이렇게 적습니다.
- X 글을 소개하는 불릿.

https://x.com/handle/status/1234567890

- 카드 뒤에 이어지는 불릿.

### 출처

[출처 표시 이름](https://example.com/story)

### 내 생각

코멘트 한 문단.
````

## 발표자료

덱은 `content/slides/<slug>/`에 둡니다. 한국어 원본은 `<slug>.md`, 영어 원본은 `<slug>-en.md`입니다. 뉴스와 같이 영어 파일이 없으면 영어 주소에는 한국어 본문과 안내가 나옵니다. 그림과 영상은 같은 폴더의 `img/`에 두고 두 파일이 같이 씁니다. `<slug>`는 소문자, 숫자, 하이픈만 씁니다.

Marp로 적습니다. 슬라이드는 `---`로 나눕니다. 인라인 HTML을 쓸 수 있습니다. 덱 안에 `<style>` 블록을 넣지 않습니다.

| 필드 | 필수 | 설명 |
|------|------|------|
| `marp` | ✅ | `true` |
| `theme` | ✅ | `presentation`. 테마 파일은 `content/slides/theme/presentation.css` 하나입니다 |
| `size` | ✅ | `16:9` |
| `paginate` | ❌ | `true`면 슬라이드 안에 쪽수를 그립니다 |
| `title` | ✅ | 목록 제목 |
| `date` | ✅ | `YYYY-MM` 또는 `YYYY-MM-DD` |
| `description` | ✅ | 짧은 설명. SEO 설명으로 씁니다 |
| `lang` | ✅ | `ko` 또는 `en`. 영어 목록은 `en`만 보여 줍니다 |
| `draft` | ❌ | `true`면 프로덕션 빌드, 사이트맵, 목록에서 빠집니다 |

이미지는 덱 파일 기준 상대 경로입니다.

```markdown
![h:220](img/diagram.svg)
```

빌드가 `img/`를 `public/slides-assets/<slug>/`로 복사합니다. PNG와 JPEG는 WebP로 바꿉니다. SVG와 영상은 그대로 둡니다. 마크다운 경로는 고치지 않습니다. `draft: true` 덱의 파일은 프로덕션에 복사하지 않습니다.

로컬에서 초안을 보려면 `SHOW_DRAFTS=1 npm run build`처럼 환경 변수를 켭니다.

목록은 1번 슬라이드를 16:9 썸네일로 만든 갤러리입니다. 카드에는 썸네일, 제목, 날짜, 장수, 설명이 있고 날짜가 최근인 덱이 앞에 옵니다. 썸네일은 빌드가 `public/slides-assets/<slug>/thumb-ko.webp`, `thumb-en.webp`로 만듭니다.

한국어 덱은 `/ko/slides/<slug>`에서 봅니다. 영어 주소로 열면 한국어만 있다는 안내가 붙습니다.

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

### 카드와 비교표

포스트와 뉴스 본문에서 `cards`, `matrix` 펜스로 그립니다. 보이는 문구는 그 언어 파일에 그대로 적습니다. 빌드 때 HTML과 SVG가 되고, 라이트와 다크는 사이트 `data-theme`를 따릅니다. 브라우저 스크립트는 없습니다.

브랜드 아이콘은 `grok`, `cursor`, `x`, `gemini`, `openai`, `anthropic`입니다. 그 외 이름은 [Lucide](https://lucide.dev/icons/) 아이콘 이름입니다. 로고 줄에 Lucide 아이콘을 쓰면 `label`이 필요합니다.

````markdown
```cards
logos:
  - grok
  - icon: bot
    label: Grok Bot
  - cursor
  - x
caption: 요금제 하나로
```
````

````markdown
```cards
logo: cursor
cards:
  - icon: circle-check
    label: 선택
  - icon: thumbs-down
    label: 단독 구매 끝
    accent: rose
```
````

`logos`는 위쪽 로고 줄, `logo`는 카드 위 로고 하나, `caption`은 아래 화살표와 한 줄입니다. 셋을 한꺼번에 쓰지 않아도 됩니다. `logos`와 `logo`는 같이 쓰지 않습니다. `accent`는 `rose` 또는 `#hex`입니다.

````markdown
```matrix
columns: [Free, Plus, Premium, Super, Ultra]
rows:
  - icon: grok
    label: Grok
    cells:
      - limited: 제한
      - check
      - none
      - check
      - 체크마크
legend:
  check: 포함
  none: 미포함
notes:
  제한: 일부 사용량
  체크마크: X Premium 대신 체크마크와 크리에이터 도구
```
````

셀은 `check`, `none`, `{ limited: 짧은말 }`, 또는 그대로 보일 문장입니다. 범례는 쓰인 기호와 `notes`로 만들어집니다. `check`나 `none`을 쓰면 `legend`에 그 언어의 말을 적습니다.

뉴스 꼭지의 그림도 본문에 같은 펜스를 그대로 넣습니다.

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
