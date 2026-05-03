---
title: "에이전트 48개짜리 AI 게임 스튜디오를 까봤다"
date: "2026-03-28"
description: "GitHub Stars 6,500짜리 'AI 게임 스튜디오' 레포를 해부했다. 에이전트 48개 계층은 조직도 코스프레였고, 진짜 쓸 만한 건 Hook 스크립트 하나였다."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

나도 에이전트를 조직 구조로 나눠보려고 시도한 적이 있다. 리뷰 에이전트, 코딩 에이전트, 버그 분석 에이전트. 잘 되지 않았다. 에이전트 간에 업무를 전달하는 과정에서 불필요한 토큰 소모와 컨텍스트 누락이 발생했다. 내 실력이 부족한 건지, 구조 자체가 아직 안 되는 건지 궁금했다.

그러다 GitHub에서 Claude Code Game Studios라는 레포를 봤다. Stars 6,500에 Forks 900. "48명의 AI 에이전트가 게임을 만드는 스튜디오"라는 컨셉이다. 이게 정말 잘 작동하나? 까봤다.

## 48명이 일하는 구조

레포를 열어보면 게임 코드는 없다. `.claude/` 폴더에 에이전트 정의, 스킬, 훅, 룰만 들어있다. 템플릿이다.

에이전트 계층이 3단계로 나뉜다.

- **Director** 3명 — Creative Director, Technical Director, Production Director. Opus 모델.
- **Lead** 8명 — Game Designer, Engine Lead, AI Lead 등. Sonnet 모델.
- **Specialist** 37명 — Gameplay Programmer, Shader Artist, QA Tester 등. Sonnet 또는 Haiku 모델.

실제 회사 조직도를 그대로 옮겨 놨다.

## 조직도 코스프레

내가 겪은 문제가 그대로 있었다. 규모만 더 컸다.

에이전트 간 상태 공유가 안 된다. Claude Code 서브에이전트는 매번 새 컨텍스트로 시작한다. Creative Director가 판단하고 Game Designer에게 넘기고 Gameplay Programmer가 코드를 짜는 체인에서, 각 에이전트는 이전 에이전트가 뭘 했는지 모른다. 내가 2~3개로 시도했을 때 이미 토큰 낭비와 컨텍스트 누락이 발생했는데, 48개면 어떨지 뻔하다.

1인 개발에 조직 구조는 오버헤드다. 실제 스튜디오에서 Director-Lead-Specialist 계층이 필요한 이유는 사람들 사이의 소통과 의사결정 병목을 관리하기 위해서다. 혼자 개발하는데 에스컬레이션 경로가 왜 필요한가.

그리고 경계를 인위적으로 나누면 오히려 느려진다. Gameplay Programmer, Engine Programmer, AI Programmer를 분리해뒀는데, 실제 게임 코드에서 이 세 영역은 긴밀하게 결합되어 있다. 에이전트를 바꿔가며 작업하면 컨텍스트 전환 비용만 늘어난다.

## 에이전트 역할은 프롬프트로 안 갈린다

내가 직접 써보면서 느낀 건데, 에이전트의 역할을 구분하는 건 프롬프트 지침이 아니라 활성화된 스킬과 명령어 권한이다.

"버그 분석에 집중해라"고 프롬프트에 적어봤자, 범용 에이전트와 체감 차이가 없다. 실제로 잘 쓰고 있는 에이전트는 지엽적으로 한 역할만 하는 것들이다. git merge conflict만 해결하는 에이전트, 문서를 분석하고 해체해서 재조립하는 에이전트. 명확한 역할과 그에 맞는 도구 권한이 있을 때 비로소 분리의 의미가 생긴다.

Game Studios 레포는 48개 에이전트를 전부 마크다운 프롬프트로만 구분했다. 스킬이나 권한 차이가 없다. 그러면 "Creative Director"와 "Technical Director"가 뭐가 다른가.

## 모델 배정이 거꾸로다

여기에 더해서 "색칠놀이" 냄새가 결정적으로 나는 부분이 있다.

Director에 Opus, Specialist에 Haiku를 배치했다. 회사 직급 체계를 흉내 낸 거지 AI 역량 기반 판단이 아니다.

Director는 "비전을 지킨다"고 하는데, 실제로 하는 일은 고수준 판단이다. 프롬프트 몇 줄이면 충분하고 Opus까지 필요 없다. 정작 코드를 짜는 Specialist에는 Haiku를 쓴다. 게임 프로그래밍은 복잡한 로직, 최적화, 엔진 API 이해가 필요한 작업이다. Haiku로 제대로 된 게임 코드가 나올까.

거꾸로 해야 맞다. 판단은 가벼운 모델로, 코딩은 가장 강한 모델로.

## 그럼 다 쓸모없나?

아니다. 에이전트 48개를 빼면 뼈대는 괜찮다.

37개 스킬 중에 `/reverse-document`(코드는 있는데 문서가 없는 상황을 역방향으로 채우기)와 `/scope-check`(스코프가 얼마나 불어났는지 정량 측정)은 바이브코딩 뒤처리에 진짜 쓸 만하다.

8개 훅 중에 `pre-compact.sh`(컨텍스트 압축 전 상태 덤프)와 `validate-commit.sh`(하드코딩 수치 탐지, JSON 검증, TODO 포맷 강제)는 모든 Claude Code 프로젝트에 범용 적용 가능하다.

11개 룰에는 게임 개발 도메인 지식이 녹아있다. 핫 패스 할당 금지, 서버 authoritative, AI 2ms 예산 같은 규칙은 진짜 경험에서 나온 것들이다.

## gstack은 좀 달랐다

같은 시기에 garrytan/gstack이라는 레포도 봤다. 에이전트 계층 대신 Hook과 Skill 시스템에 집중한 구조다.

여기서 발견한 `/careful`이 인상적이었다. PreToolUse Hook으로 `rm -rf`, `DROP TABLE`, `force-push`, `reset --hard` 같은 파괴적 명령을 시스템 레벨에서 차단한다. CLAUDE.md에 "하지 마라"고 쓰는 건 프롬프트 수준 제한이라 뚫릴 수 있다. Hook은 확실하다.

당장 가져다 쓸 수 있는 수준이다.

`/review` 스킬의 Scope Drift Detection도 좋았다. diff의 변경사항을 원래 요청과 비교해서 "요청한 것 vs 실제 구현된 것"의 괴리를 잡는다. AI가 scope creep 하는 걸 구조적으로 잡는 메커니즘이다.

## Stars는 컨셉의 힘이다

Claude Code Game Studios가 Stars 6,500을 받은 건 "AI 48명이 게임을 만든다"는 컨셉이 매력적이기 때문이다. 에이전트 48개가 실제로 잘 돌아가서가 아니다.

에이전트를 늘리는 건 쉽다. 마크다운 파일 하나 추가하면 된다. 그 에이전트가 실제로 맥락을 공유하고 협업하게 만드는 건 현재 Claude Code 아키텍처에서 구조적으로 안 된다.

스타 수는 사람들의 기대를 반영한 것이라고 본다. AI 에이전트가 조직처럼 협업하는 미래를 향한 방향은 맞다. 다만 지금은 그게 작동한다는 증거가 없다.

레포에서 진짜 가치 있는 건 에이전트가 아니라 스킬, 훅, 룰 시스템이다. 여기서 참고할 거라면 `.claude/skills/`, `.claude/hooks/`, `.claude/rules/` 구조를 벤치마킹하되, 에이전트는 역할이 명확하고 도구 권한이 구분되는 5~10개로 통합하는 게 현실적이다.
