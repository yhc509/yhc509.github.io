# 의존성 공급망

패키지를 추가하거나 버전을 올릴 때 아래를 지킵니다.

- 레지스트리에 올라온 지 3일이 지난 버전만 사용합니다.
- 설치 스크립트는 기본으로 막습니다. 예외는 이 문서의 허용 목록에만 둡니다.
- 설치는 락파일만 사용합니다. 로컬과 CI 모두 `npm ci`를 씁니다.
- 새 의존성을 넣으면 PR 본문에 이유를 적습니다.
- 토큰, 키, 비밀번호를 평문으로 커밋하지 않습니다.

루트 `.npmrc`의 `ignore-scripts=true`가 `npm ci`에 적용됩니다. CI는 설치 전에 이 값이 `true`인지 확인합니다.

`ignore-scripts`는 `predev`, `prebuild`, `postbuild` 같은 lifecycle hook도 건너뜁니다. 콘텐츠 동기화와 이미지 생성은 `sync-generated`로 두고, `dev`와 `build`가 그 스크립트를 직접 호출합니다.

## 허용 목록

현재 허용 목록은 비어 있습니다.

락파일에서 install script가 있는 패키지는 `sharp`와 `unrs-resolver`뿐입니다. 둘 다 `optionalDependencies`로 플랫폼별 사전 빌드 바이너리를 받습니다. 설치 스크립트 없이 로드됩니다.

스크립트가 꼭 필요한 패키지가 생기면 CI에서 그 패키지만 실행합니다.

```bash
npm rebuild <pkg> --ignore-scripts=false
```

`.npmrc`만으로는 `npm rebuild`도 스크립트를 건너뛰므로 `--ignore-scripts=false`가 필요합니다. 패키지 이름과 이유를 이 허용 목록과 PR 본문에 적습니다.
