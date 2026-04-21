---
title: "github.io에서 커스텀 도메인으로 갈아탄 이유"
date: "2026-04-21"
description: "블로그를 만들고 한 달, 구글에 포스트가 하나도 안 잡혔다. 원인을 추적하다 보니 github.io 도메인 자체가 문제였다. kinkeep.dev를 사서 연결했더니 sitemap 처리부터 달라졌다."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

블로그를 만들고 한 달이 지났는데 구글에 아무것도 안 나온다.

홈페이지는 색인이 됐다. 근데 포스트가 30개 넘게 있는데 단 하나도 구글이 모른다. URL Inspection을 돌려보면 전부 "URL is unknown to Google"이다. 발견조차 안 된 거다.

## 뭐가 문제였나

처음엔 기술적인 문제를 의심했다. sitemap이 잘못됐나, robots.txt가 막고 있나, 구조화 데이터가 빠졌나. 전부 확인해봤는데 다 정상이었다. sitemap은 접근 가능하고 XML도 유효하고, robots.txt는 Allow: /로 열려있고, JSON-LD도 BlogPosting 스키마까지 다 들어가 있었다.

문제는 sitemap이었다. 정확히는, 구글이 sitemap을 처리하지 않고 있었다. Search Console에서 sitemap 상태를 보면 제출한 지 5일이 지났는데도 `isPending: true`였다. 구글이 sitemap을 받아놓고 열어보지도 않은 거다.

홈페이지가 색인된 건 sitemap 덕이 아니라 GitHub 레포 페이지에서 링크가 걸려있어서 우연히 발견된 거였다.

## github.io가 불리한 이유

`yhc509.github.io`는 GitHub Pages의 공유 도메인이다. github.io 밑에 수백만 개의 서브도메인이 있고, 대부분이 방치된 프로젝트 페이지나 README 미러다. 구글 입장에서 이런 도메인에 크롤 예산을 많이 배정할 이유가 없다.

커스텀 도메인이 유리한 점은 세 가지다.

1. **독립적인 도메인 권한** — github.io에 세 들어 사는 게 아니라 내 도메인으로 신뢰도를 쌓을 수 있다
2. **크롤 우선순위** — 공유 도메인보다 독립 도메인에 크롤러가 더 적극적으로 온다
3. **장기적 유연성** — 나중에 GitHub Pages를 안 써도 도메인은 유지된다

## 도메인 선택과 구매

도메인 등록은 **Cloudflare Registrar**로 했다. 이유는 단순하다. 원가 판매라 갱신 시 가격이 안 오른다. 다른 업체들은 첫 해만 싸게 하고 갱신할 때 올리는 경우가 많은데, Cloudflare는 그게 없다. DNS 설정도 같은 대시보드에서 끝난다.

도메인은 `kinkeep.dev`로 했다. `.dev` TLD는 HTTPS가 강제되고 개발 블로그 느낌에 잘 맞는다. 연간 $12.20, 한화로 약 1.7만 원이다.

## 연결 과정

GitHub Pages에 커스텀 도메인을 연결하는 건 생각보다 간단하다.

**DNS 설정** — Cloudflare에서 A 레코드 4개를 추가한다. GitHub Pages 서버 IP로, 로드밸런싱을 위해 4개다. Proxy는 끄고 DNS only로 설정해야 한다. GitHub Pages가 자체 TLS를 쓰기 때문에 Cloudflare 프록시를 켜면 인증서가 충돌한다.

**코드 변경** — 사이트 URL이 하드코딩된 곳을 전부 바꿔야 한다. 내 경우는 세 군데였다.
- 사이트 기본 URL 설정
- RSS 피드 생성 스크립트
- GitHub Actions 빌드 환경변수

그리고 `public/CNAME` 파일을 만들어서 도메인을 적어둔다. GitHub Pages가 이 파일을 보고 커스텀 도메인을 인식한다.

**GitHub 설정** — 레포 Settings → Pages → Custom domain에 도메인을 넣으면 끝이다. HTTPS 인증서는 Let's Encrypt로 자동 발급된다.

## 결과

도메인 연결 후 Google Search Console에 새 속성을 등록하고 sitemap을 제출했다. 여기서 차이가 바로 나타났다.

github.io에서는 sitemap 제출 후 5일이 지나도 `isPending`이었다. kinkeep.dev에서는 **즉시 처리됐다**. 같은 콘텐츠, 같은 sitemap 구조인데 도메인만 바꿨을 뿐이다.

Indexing API로 37개 URL을 색인 요청한 것도 전부 성공했다. 며칠 뒤 실제 색인 결과를 확인해봐야 하지만, 출발부터 다르다.

## 비용 대비 효과

연간 1.7만 원으로 할 수 있는 가장 확실한 SEO 투자다. 블로그를 GitHub Pages로 운영하면서 구글 색인이 안 되는 사람이 있다면, 코드를 건드리기 전에 커스텀 도메인부터 연결해보는 걸 추천한다.

이전 도메인 `yhc509.github.io`로 접속하면 자동으로 `kinkeep.dev`로 리다이렉트된다. 기존에 공유된 링크가 깨질 걱정은 없다.
