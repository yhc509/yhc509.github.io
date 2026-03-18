# yhc509 blog

정적 내보내기 기반 Next.js 블로그 소스 저장소다.

## Local

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 확인한다.

## Check Before Deploy

```bash
npm run lint
npm run build
```

정적 결과물은 `out/`에 생성된다.

## Deploy

이 저장소에서는 `deploy.sh` 같은 수동 배포 스크립트를 쓰지 않는다.

실제 배포는 `yhc509.github.io` 저장소의 GitHub Actions가 담당한다.

기본 흐름:

1. 이 저장소에서 수정한다.
2. 변경을 커밋한다.
3. 배포 저장소의 `main`에 반영하면 GitHub Actions가 Pages를 배포한다.
