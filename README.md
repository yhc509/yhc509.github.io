# yhc509 blog

## Local

```bash
npm ci
npm run dev
```

## Check

```bash
npm run lint
npm run build
npm run preview
```

## Deploy

이 저장소가 소스이자 배포 기준 저장소다.

흐름은 단순하다.

1. 이 저장소에서 수정한다.
2. `main` 브랜치에 push 한다.
3. GitHub Actions가 `out/`을 만들어 GitHub Pages에 배포한다.
