# yhc509.github.io

Next.js 16 + MDX 기반 정적 블로그입니다. 이 저장소 하나가 이제 소스 저장소이자 GitHub Pages 배포의 기준 저장소입니다.

## 작업 흐름

1. 이 저장소에서 글과 UI를 수정합니다.
2. 로컬에서 `npm run dev` 또는 `npm run build`로 확인합니다.
3. `main` 브랜치에 push 하면 GitHub Actions가 정적 사이트를 빌드해서 GitHub Pages에 배포합니다.

더 이상 별도의 `blog` 소스 저장소나 `../yhc509.github.io` 같은 짝 디렉토리를 전제로 하지 않습니다.

## 자주 쓰는 명령어

```bash
npm ci
npm run dev
npm run build
npm run lint
```

## 콘텐츠 구조

```text
content/
├── posts/      # 블로그 포스트와 글별 이미지 원본
├── projects/   # 프로젝트 소개
└── about.md    # 소개 페이지
```

포스트에 포함된 이미지 자산은 `npm run dev`와 `npm run build` 전에 자동으로 `public/posts-images`로 동기화됩니다. 그래서 GitHub Actions의 깨끗한 빌드에서도 이미지 경로가 안정적으로 유지됩니다.

## 배포

- 공개 주소: `https://yhc509.github.io`
- 배포 방식: GitHub Pages + GitHub Actions
- 워크플로우 파일: `.github/workflows/deploy.yml`

`main` 브랜치에는 소스코드만 유지하고, 정적 산출물은 GitHub Actions가 생성해서 Pages로 배포합니다.
