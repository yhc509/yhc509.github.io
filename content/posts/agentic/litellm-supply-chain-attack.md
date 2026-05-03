---
title: "오늘 내 맥에서 악성코드가 돌았다 — LiteLLM 공급망 공격 사후 기록"
date: "2026-03-24"
description: "Claude Code 플러그인 하나 깔았을 뿐인데, 하위 의존성에 심어진 백도어가 API 키와 자격증명을 털어갔다. 감지부터 대응까지의 기록."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

오늘 저녁, 개발 의욕이 없어서 평소 관심 있던 Claude Code 플러그인 하나를 깔아봤다. Ouroboros라는 건데 AI 코딩 에이전트에 자율 루프를 붙여주는 도구다. 유명한 AI 교수님도 써보라고 추천했던 플러그인이라 의심 같은 건 없었다. 설치하고 1분쯤 지나서 맥이 버벅이기 시작했다.

## python3.12가 1,000개

재부팅을 3~4번 했다. 그때마다 Claude Code를 켜면 또 멈췄다. 방금 전에 Ouroboros를 설치했던 게 떠올랐다. Claude를 아예 실행하지 않기로 했다. 대신 Codex CLI를 열어서 프로세스를 점검시켰다. 이게 신의 한수였다.

`python3.12`가 천 개 넘게 떠 있었다. 새 셸조차 `fork failed: resource temporarily unavailable`. CPU가 아니라 프로세스 수가 시스템을 질식시킨 상태였다.

대부분이 `PPID=1`. 부모가 죽어 고아로 남은 프로세스였다. 정상 워커가 아니라 짧은 시간에 폭발적으로 spawn된 runaway.

## 악성코드였다

단순 폭주가 아니었다. `uv` 캐시 아래 파이썬 인터프리터의 커맨드라인에 `base64`로 숨긴 페이로드가 있었다. 디코딩하니 자격증명 파일을 모아 `https://models.litellm.cloud/`로 보내는 스크립트였다.

감염 경로는 이렇다.

```
Ouroboros 설치
  → litellm>=1.80.0 의존성
    → litellm 1.82.8 (오염 버전)
      → litellm_init.pth (악성 .pth 훅)
        → 파이썬 시작 시마다 자동 실행
          → 자격증명 수집 + 외부 전송
```

`.pth`는 파이썬이 시작될 때 자동 실행되는 사이트 초기화 파일이다. `litellm_init.pth` 첫 줄이 `subprocess.Popen([sys.executable, "-c", "import base64; exec(...)"])`였다. 정상 초기화 코드가 아니다.

프로세스 폭주는 이 악성코드의 구현 버그였다. `.pth` 자동실행이 재귀적으로 돌면서 프로세스를 무한 생성한 것. 아이러니하게도 이 버그 덕분에 감염을 빨리 알아챘다. 조용히 잘 돌았으면 모르고 넘어갔을 것이다.

## 공급망 공격

Ouroboros 자체가 악성은 아니었다. 범인은 `litellm 1.82.8`. Ouroboros가 의존성으로 끌고 오는 패키지에 누군가 백도어를 심었다.

같은 날 공개된 분석에 따르면

- `litellm 1.82.7`과 `1.82.8` 두 버전이 오염
- GitHub에 정상 릴리스/태그 없이 PyPI에 직접 업로드된 정황
- PyPI는 같은 날 `litellm` 프로젝트를 quarantine 처리
- LiteLLM maintainer 계정 탈취로 추정

Ouroboros 개발자가 범인이라는 근거는 없다. LiteLLM maintainer 개인도 마찬가지. 특정 가능한 건 "LiteLLM PyPI 배포 권한을 탈취한 미상 공격자"까지다.

## 뭘 노렸나

악성코드가 긁어가려 한 것들이다.

- `.env` 파일 (API 키, DB 비밀번호, 서비스 시크릿)
- SSH 키, AWS/GCP/Azure 자격증명
- Docker 설정, Git 설정
- 셸 히스토리, `printenv` 출력
- Slack/Discord 웹훅 URL (재귀 grep으로 파일 내용까지 탐색)

지속성도 심으려 했다. `~/.config/sysmon/sysmon.py`와 `~/.config/systemd/user`가 감염 시각에 생성돼 있었다. `sysmon.py`는 0바이트. persistence 단계까지 갔다가 프로세스 폭주로 비정상 종료된 것으로 보인다.

## 대응

### 즉시 조치

1. 폭주 프로세스 전부 kill
2. Ouroboros 제거, Claude 설정에서 삭제
3. 감염된 `uv` 캐시 환경 삭제
4. 지속성 흔적(`sysmon`, `systemd`) 삭제
5. Ouroboros 저장소에 [원인 분석 댓글](https://github.com/Q00/ouroboros/issues/195#issuecomment-4117989406) 작성

### 토큰/키 교체

파일에 있던 모든 비밀값을 유출 가정하고 교체했다. Anthropic, Google AI, Clerk, Supabase, Twitter/X, LemonSqueezy, CouchDB, Linear API Key, 각 프로젝트 DATABASE_URL의 DB 계정까지.

### 확인

재부팅 후 `python3.12`, `litellm`, `sysmon` 프로세스 재등장 없음. Claude 재실행해도 폭주 재현 없음. 잔여 악성 파일 없음.

## 실제로 유출됐는가

확정은 못 한다.

- **악성코드 실행**: 확실
- **유출 시도**: 가능성 높음. persistence 흔적이 생겼으면 그 전 단계인 수집과 업로드도 실행됐을 가능성이 높다
- **유출 성공**: 네트워크 로그 부재로 확정 불가

악성코드는 `curl -s -o /dev/null` 식으로 조용히 보내도록 설계돼 있다. 패킷 캡처나 DNS 로그 없이는 성공 여부를 증명할 수 없다. Little Snitch나 LuLu 같은 네트워크 모니터를 안 쓰고 있었다.

유출된 것으로 가정하고 대응하는 수밖에 없다.

## 타이밍

Ouroboros를 며칠 동안 안 깔고 있었다. 오늘 "개발 의욕 없는데 한번 깔아서 구경이나 할까" 하고 설치한 타이밍이, 백도어가 PyPI에 올라온 지 1시간 된 타이밍이었다. `litellm 1.82.8`은 3월 24일에 업로드됐고, `models.litellm.cloud` 도메인도 공격 직전에 등록됐다.

수상한 걸 깔아서 당한 게 아니다. 평범한 오픈소스 설치 타이밍이 최악으로 겹쳤다.

## 교훈

이번 사건이 보여준 건 명확하다. 내가 아무리 잘해도 의존성 어딘가에서 털릴 수 있다. 이상한 코드를 짠 것도 아니고, 겉보기엔 정상 프로젝트였고, 원인은 하위 의존성 공급망이었다.

**"안 털리게"보다 "털려도 작게 끝나게."** 완벽 차단은 불가능하다. 메인 환경과 실험 환경을 분리하고, 장기 토큰 대신 짧은 만료 주기를 쓰고 비밀값이 많은 프로젝트와 새 툴 실행 환경을 격리해야 한다.

**새 플러그인은 격리 환경에서 먼저.** `.env` 파일이 수십 개 있는 메인 머신에서 바로 설치했다. VM이나 별도 사용자 세션에서 먼저 돌려봤으면 피해 범위가 훨씬 작았을 것이다.

**네트워크 모니터는 있어야 한다.** Little Snitch나 LuLu가 있었으면 `models.litellm.cloud`로 나가는 트래픽을 잡았을 것이고 유출 여부를 확정할 수 있었다. 개발자 머신에 네트워크 모니터 하나 없는 건 사각지대다.

**프로세스 폭주가 나를 살렸다.** 악성코드의 `.pth` 재귀 실행 버그가 없었으면 시스템은 조용했을 것이고, 나는 한참 뒤에야 알아챘을 것이다. 조용한 악성코드가 더 무섭다.

## 참고

- [LiteLLM 이슈 #24512 — Malicious litellm_init.pth](https://github.com/BerriAI/litellm/issues/24512)
- [FutureSearch — LiteLLM PyPI Supply Chain Attack](https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/)
- [Ouroboros 이슈 #195](https://github.com/Q00/ouroboros/issues/195)
- [PyPI litellm (quarantined)](https://pypi.org/project/litellm/)
