---
title: "Harness Engineering (공유용)"
date: 2026-06
description: "에이전트 하네스를 터미널에서 다루는 발표 자료."
marp: true
theme: presentation
size: "16:9"
paginate: true
html: true
lang: ko
tags: [발표자료]
type: article
created: 2026-06
source: harness-engineering.slides_out.pdf (Google Drive) 에서 복원
style: |
  blockquote { border: 0; border-left: 4px solid #dfe2e5; background: none; padding: 0 0 0 14px; font-size: .62em; color: #55677d; }
  pre.term { width: fit-content; max-width: 1140px; margin: 12px auto 0; padding: 0 16px 12px; border-radius: 10px; overflow: hidden; background: #272b33; color: #abb2bf; font: 13px/1.38 Menlo, 'DejaVu Sans Mono', Consolas, monospace; white-space: pre-wrap; box-shadow: 0 6px 18px rgba(0,0,0,.18); }
  pre.term::before { content: attr(data-title); display: block; margin: 0 -16px 10px; padding: 7px 0; text-align: center; font: 12px sans-serif; color: #8b92a0; background: radial-gradient(circle, #ff5f57 5px, transparent 5.5px) 8px 50% / 22px 22px no-repeat, radial-gradient(circle, #febc2e 5px, transparent 5.5px) 26px 50% / 22px 22px no-repeat, radial-gradient(circle, #28c840 5px, transparent 5.5px) 44px 50% / 22px 22px no-repeat, #1d2026; }
  .term b { color: #e6e8eb; }
  .term i { font-style: normal; color: #7f8692; }
  .term .r { color: #f06a7a; }
  .term .l { color: #a9a8f0; }
  .term .o { color: #d97757; }
  .term .hl { display: block; margin: 0 -16px; padding: 0 16px; background: #3a3e46; color: #e6e8eb; }
  .term .c1 { color: #8a8f98; } .term .c2 { color: #b5b9c0; } .term .c3 { color: #b4b8f8; }
  .term .c4 { color: #e07d5c; } .term .c5 { color: #f1c232; } .term .c6 { color: #8e88d8; }
  section { padding: 52px 64px 44px; }
  section h1 { margin-block: 0.28em 0.35em; }
---

<!-- _class: title -->
<!-- _paginate: false -->

# Harness Engineering (공유용)

KineticKeeper, 2026.06

---

# 발표 전 참고사항

- Claude Code, Codex와 같은 에이전트 하네스에 대한 내용 (웹 채팅 X)
- Claude Code CLI (터미널) 기준
  - Desktop과 기능 차이는 거의 없으나 방법이 약간 다를 수 있음
- Claude Max x5 ($100) + GPT Pro ($200) 사용
- 이 발표에서 다루는 내용을 다 알 필요는 없으며 참고만 해도 충분.

---

# 목차

- What is Harness Engineering ?
- AI Agent Principles
- Context Management Strategy
- Deterministic Control
- My Workflow
- Make It AI-Friendly
- Conclusion

---

# What is Harness Engineering ?

- 하네스(Harness) = 목줄 = 에이전트가 의도대로 행동하게 유도하는 도구
  - Claude Code, Codex, Antigravity = CLI, TUI, IDE, APP ... 그냥 하네스임.
  - 확률적 유도(prompt, context, skills ...) + 결정적 제어(sandbox, hook, permission , tool, structured output ...)
  - 확률적 유도 : 가끔 어기거나 결과가 달라진다 / 결정적 제어 : 강제한다
- 하네스 엔지니어링 = 에이전트를 어떻게 의도대로 끌고갈지에 대한 방법론
  - System Prompt, MCP, Hook, Skill ... = 이거 건들면 그냥 하네스 엔지니어링임.
- 새로운 개념이 아니고 이미 다 알고 있는 것에 용어를 붙인 것임.
- 같은 모델이라도 어떤 하네스, 어떤 버전에서 구동되는지에 따라 다르다. (시스템 프롬프트가 다르니까)
  - Claude Code Opus != Antigravity Opus != JetBrains Rider Opus
  - [System Prompts Leaks](https://github.com/asgeirtj/system_prompts_leaks)
- [Steering Claude Code: CLAUDE.md files, skills, hooks, rules, subagents and more](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)

---

<!-- _class: title -->

# AI Agent Principles

---

# ReAct Loop (Reasoning and Acting)

**Thinking → Action → Observation → 반복**

- **Thinking**: 지금 뭘 해야 하지? (생각)
  - 더 이상 해야할 것이 없으면 답변
- **Action**: 도구 호출 (행동)
- **Observation**: 결과 확인 (관찰)

![w:250](img/06-react-agent-architecture.png)

> 루프가 돌면서 관찰 결과가 **컨텍스트에 쌓인다**

---

# Context Window

- LLM은 **상태가 없다 (stateless)** = 기억력 없다. 마치 기억력이 있는 것처럼 묘사한 것 뿐.
- 매 질의마다 **지금까지의 대화를 통째로 재조립**해서 보낸다
  - 시스템 프롬프트 + 도구 정의 + 파일 + 전체 대화 이력
  - 내가 메시지를 보낼 때마다, 세션 처음 ~ 마지막 내용들을 다시 읽는다
- 컨텍스트 윈도우 = 단기기억 용량 = 크면 클 수록 오래 대화, 작업할 수 있다.
  - Sonnet (200k) vs Sonnet (1M Context)
  - Opus 4.8 (1M Context)
- 컨텍스트 윈도우 최적화 -> 메모리 최적화와 비슷한 느낌

---

# Prompt Caching

- 쌓인 만큼 **매 질의마다 재전송 = 매번 과금**
  - 대화가 길어지면 토큰을 많이 쓴다.
- **프롬프트 캐싱** -> 최근에 사용된 내용은 캐싱하여 비용을 줄인다.
- 앞부분(**prefix**)이 동일하면 재사용 → **싸고 빠르다**
  - 시스템 프롬프트 · 도구 정의 = 잘 안 바뀌는 부분
- 캐시 히트율 ↑ = 비용 ↓ · 속도 ↑

---

![w:882](img/09-pricing-table.png)

---

# Cache Miss

- **prefix가 바뀌면 그 지점부터 전부 깨진다**
  - 시스템 · 도구 정의 변경
  - 과거 대화 수정 · /rewind
  - 시간 경과(TTL): 기본 1h / 옵션에 따라 5m
- 다음 날 이어서 처리할 일은 요약 문서 작성 후 새로운 세션에서 하는 것이 유리
  - 예: 오늘 컨텍스트 40% 채우고 그냥 퇴근 -> 다음 날 대화 이어가면 대참사 (40% cache miss)

---

# Smart Zone & Dumb Zone

- 스마트 존 (Smart Zone) : AI 세션 초반, 컨텍스트 윈도우 사용량이 적절한 최적의 상태.
- 덤 존 (Dumb Zone) : 대화가 길어지고, 컨텍스트가 너무 많이 쌓여 주의력 메커니즘이 한계에 도달.
- 모델, 하네스에 따라 Smart <-> Dumb의 경계는 체감은 다를 수 있다. 직접 쓰면서 체감 필요

![h:360](img/11-smart-dumb-zone.png)

---

<!-- _class: title -->

# Context Management Strategy

---

# 왜 컨텍스트를 관리해야 하는가?

- 토큰 많이 사용 -> 좋은 결과 **(X)** : 정보를 많이 넣는다고 똑똑해지지 않는다

- 좋은 결과 -> 토큰 많이 사용 **(O)** : 충분한 정보가 있어야 좋은 결과

- 컨텍스트 = 정보이며, 컨텍스트 사용 => 토큰 사용량에 직결된다

- 더 많은 토큰을 쓰려면, 더 많은 돈을 내야 함

- 컨텍스트를 효율적으로 관리하는 것이 토큰 낭비를 줄이는 길

> 토큰 낭비를 줄여서 **의미있게 쓰자**

---

# /compact

- 컨텍스트 윈도우는 무한이 아니다 : 컨텍스트가 일정 수준이상 차면 -> 내용을 압축한다
  - **유지**: 큰 흐름 · 결정사항 · 진행 맥락
  - **유실**: 정확한 코드 · 구체 수치 · 세부 뉘앙스 · 파일 원문
  - 일반적으로 80% ~ 구간에서 auto compact가 발생한다. (옵션에 따라 다름)
- 대화가 길어지면 더 많은 컨텍스트 사용 -> 더 많은 토큰을 사용
- `/compact [요약 지침]` 으로 원하는 타이밍에 컨텍스트를 압축할 수 있다.
  - 컨텍스트 사용량 40% 부근 (Smart Zone vs Dumb Zone)
  - 작업 맥락은 유지하고 싶은데 Cache Miss가 발생할 것 같은 타이밍 (회의, 퇴근)

---

![h:539](img/15-compact-before-after.png)

---

# CLAUDE.md

- `CLAUDE.md` = 세션 시작시 기본 로드된다.
- Claude가 따라야 하는 지침, 성향 유도, 권장사항이나 참고할 만한 정보를 기재한다.
  - `~/.claude/CLAUDE.md` : 글로벌용
  - `{프로젝트경로}/CLAUDE.md` : 프로젝트용
  - `{프로젝트경로}/CLAUDE.local.md` : 프로젝트 사용자용
- `/init` 을 통해 초기 CLAUDE.md를 작성할 수 있지만, 직접 작성하는 것이 더 효율적, 유의미함
- CLAUDE.md를 최대한 간결하게 유지할 것.
  - 매 질의마다 **지금까지의 대화를 통째로 재조립**해서 보낸다
    = `CLAUDE.md` 는 헌법이라서 기본적으로 적재된다
    = 매 질의마다 `CLAUDE.md` 를 다시 보낸다
- **항상 적용되는 것 + 중요한 것만 CLAUDE.md** → 일부 or 도메인 규칙은 `.claude/rules/` 로 조건에 맞게 분리

---

# MEMORY.md

- `~/.claude/projects/{프로젝트경로}/memory/MEMORY.md`
- `MEMORY.md` = **세션 간 지속되는 장기기억**
  - 컨텍스트는 세션이 끝나면 증발 -> 새로운 세션에서는 바보가 된다 -> 이번 세션에서 배운 걸 파일로 남겨 다음 세션에 전달
  - 클로드의 `실수, 해결법, 교훈, 처음 알게 된 사실` 등을 기록해서 다음 세션에서는 더 똑똑하게 수행할 수 있다
  - **인덱스**(한 줄 요약)만 상시 로드 -> 관련 있을 때만 개별 파일 로드 -> 토큰 절약 - 필요한 것만 꺼내 본다
- 작업하면서 계속 쌓이는 메모리들은 주기적으로 정리하기
  - 필요 없어진 내용은 제거.
  - 더 간결하게 압축할 수 있는 내용은 요약.
  - `CLAUDE.md` 나 `.claude/rules/` 로 승격 가능한 내용은 올리기.

---

# Subagent

- 서브 에이전트는 메인 에이전트와 격리된 컨텍스트를 지닌다.
  - 메인 에이전트 : 지시문 작성 -> 서브 에이전트 전달
  - 서브에이전트 : 업무 수행 결과 요약 -> 메인 에이전트 전달
- 무분별하게 서브 에이전트를 쓰려고 하면 오히려 정확도가 떨어지고 오버헤드 발생 가능.

---

![h:540](img/19-subagent-context-window.png)

---

# MCP

- 하네스 종속 없이 공용 프로토콜로 활용할 수 있다는 장점
  - 쉘이 없는 환경에서는 MCP가 거의 유일한 수단
  - MCP 서버 1개 -> 여러 클라이언트에서 한번에 연결 가능 (배포, 이식성 관점에서 유리)
- MCP 사용량이 증가함에 따라 토큰 비용을 증가시킬 수 있는 두 가지 일반적인 패턴을 주의해야 함
  - 도구 정의가 컨텍스트 창을 과부하 상태로 만들 수 있음. (lazy load로 완화)
  - 도구 사용시 결과를 주고 받는 과정에서 토큰이 소모됨.

![h:300](img/20-mcp-tools-context.png)

---

# CLI + Skill

- 쉘을 활용할 수 있는 환경에서는 MCP를 바로 연결하는 것 보다는 CLI + Skill을 사용하는 것이 비용면에서 효율적일 수 있음
  - output을 압축, 필터링 -> 필요한 정보만 받음 -> 토큰 절약
  - OAuth 같은 인증 플로우가 있다면 직접 처리해야 하는 불편함 감수
- [Code execution with MCP: Building more efficient agents](https://www.anthropic.com/engineering/code-execution-with-mcp)

![h:320](img/21-code-execution-with-mcp.png)

---

# 대화 도중 Context 관리하기

- `/btw` : 컨텍스트를 **오염시키지 않고** 곁가지 질문
  - 질문, 답변이 히스토리에 안 쌓임 -> 불필요한 맥락 방해 방지
- **분기 / 전환** — 메인 컨텍스트를 무겁게 안 만들고 갈라치기
  - `/fork` : 현재 대화 상속한 **백그라운드 서브에이전트**에 위임, 나는 메인 유지 -> 결과만 회수
  - `/branch` : **내가** 복사본 세션으로 이동 (원본 보존)
  - `/resume` : 저장된 세션으로 전환 / 원본 복귀
- `/rewind` (= Esc Esc) : 특정 지점으로 되돌리기 / 구간 요약
  - 코드+대화 / 대화만 / 코드만 복원, 또는 **선택 구간만** 요약 압축 ( `/compact` =전체)
  - 주의 : 복원은 Claude가 편집한 파일만 (bash 변경 파일은 체크포인트 밖)

---

# /context

- `/context all` 을 치면 상세 내용 볼 수 있음.

<pre class="term" data-title="claude — ~/DEV"><i class=o> ▐▛███▜▌ </i>  <b>Claude Code</b> <i>v2.1.152</i>
<i class=o>▝▜█████▛▘</i>  <i>Opus 4.7 (1M context) with max effort · Claude Max</i>
<i class=o>  ▘▘ ▝▝  </i>  <i>~/DEV</i>

<b>❯ /context</b>
  ⎿  <b>Context Usage</b>
     <i class=c1>●</i> <i class=c2>●</i> <i class=c3>●</i> <i class=c4>●</i> <i class=c5>●</i> <i class=c6>●</i> □ □ □ □ □ □ □ □ □ □ □ □ □ □    <b>Opus 4.7 (1M context)</b>
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i>claude-opus-4-7[1m]</i>
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i>17.3k/1m tokens (2%)</i>
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <em>Estimated usage by category</em>
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i class=c1>●</i> <b>System prompt:</b> 2.3k tokens (0.2%)
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i class=c2>●</i> <b>System tools:</b> 6.6k tokens (0.7%)
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i class=c3>●</i> <b>Custom agents:</b> 494 tokens (0.0%)
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i class=c4>●</i> <b>Memory files:</b> 5k tokens (0.5%)
     □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □ □    <i class=c5>●</i> <b>Skills:</b> 2.8k tokens (0.3%)
                                                <i class=c6>●</i> <b>Messages:</b> 41 tokens (0.0%)
                                                □ <b>Free space:</b> 982.7k (98.3%)
     <b>Custom agents</b> <i>· /agents</i>      <b>Memory files</b> <i>· /memory</i>      <b>Skills</b> <i>· /skills</i>
     <i>└ 5 agents · 494 tokens</i>   <i>└ 3 files · 5k tokens</i>      <i>└ 40 skills · 2.8k tokens</i>

     <i>/context all to expand</i></pre>

---

<!-- _class: title -->

# Deterministic Control

---

# permission / sandbox

- 확률적 유도는 **가끔 어길 수 있다** -> 절대 어기면 안 되는 건 **결정적으로 강제**
- **permission**: 도구 호출을 `allow / ask / deny` 로 통제
  - '파일 지우지 마' = 부탁
  - `rm -rf` deny = 강제
- **sandbox**: 실행된 명령이 **뭘 건드릴지**를 OS 레벨로 격리
  - 쓰기는 작업 폴더로 제한, 네트워크는 허용 도메인만 -> 사고 쳐도 피해 범위 차단
- **bypass와 sandbox는 별개 레이어** — bypass로 프롬프트를 다 꺼도 sandbox는 OS가 경계를 강제
  - 항상 `--dangerously-skip-permissions` 로 쓴다면 -> **sandbox가 유일한 안전망**

---

# hooks

- 특정 시점(도구 호출 전후·세션 시작·커밋 전 등)에 **내 스크립트를 결정적으로 실행**
- [Claude Code Docs - Hook lifecycle](https://code.claude.com/docs/en/hooks#hook-lifecycle)
- 예 : Unity .meta edit 시도시 실패 값 반환
  - '.meta 수정하지 마' = 부탁
  - `PreToolUse` 를 이용한 `.meta` edit 실패값 반환 = 강제

<pre class="term" data-title="claude — ~/dev/my-game"><i class=hl>❯ ~/dev/my-game/Assets/Game/Common/Resources/dummy.txt.meta

  GUID 0으로 변경</i>
<i>Read <b>1</b> file</i>

<i class=r>●</i> <b>Update</b>(my-game/Assets/Game/Common/Resources/dummy.txt.meta)
  ⎿  <i class=r>Error: PreToolUse:Edit hook error: ["$HOME/.claude/hooks/block-meta-edit.sh"]: No stderr output</i>

● <i class=l>.meta</i> 편집이 차단됐습니다 — <i class=l>~/.claude/hooks/block-meta-edit.sh</i> 차단형 훅이 막았습니다 (CLAUDE.md의 ".meta 수동 조작 금지" 정책 강제).</pre>

---

# hooks

![w:965](img/27-hooks-list.png)

---

<!-- _class: title -->

# My Workflow

---

# CLAUDE.md로 AI 행동 교정하기

- 모델을 사용하며 반복되는 약점을 내 스타일에 따라 길들이기
  - **환각 억제** : 추측 금지(코드 증거 없이 단정 X), 확신 % 표기
  - **아부 억제** : 입장 번복 금지(아부 금지), 실수 변명 금지 -> 해결책 제시
  - **과설계 억제** : 코드는 단순하게 - 절반으로 가능?, 과하지 않은지?
  - **출력 규칙** : 역피라미드(결론 -> 근거)
- 프로젝트에서 코드로 알기 힘든 규칙을 적고 지침을 정하기
  - **기본 정보** : 유니티 프로젝트 2021.3.57f2, IL2CPP, 디파인 정의
  - **설계 원칙** : GC 주의, 코드 철학
  - **작업 체크리스트** : `.meta` 수동조작 금지, 요청 범위만 작업
  - **검증 방법** : 컴파일 체크 `dotnet build | grep "error CS"` -> **코드 작성 후 컴파일을 돌려 스스로 에러 탐지**

---

# 소크라테스식 문답법

- LLM은 언어 모델 = 내 요구사항을 언어로 표현해서 전달해야 한다
  - 나는 당연한 것이라고 생각해서 생략하면, AI는 추측한다 = 커뮤니케이션 Miss
  - 내가 원하는게 무엇인지 나도 잘 모를 때가 있다
- 소크라테스식 문답법 = AI가 먼저 묻도록 만들기 = `왜 그렇게 생각하는가?`
  - 모순되거나 불명확한 요청은 확인 받는다 = 커뮤니케이션 Miss 방지
  - 머릿 속 막연했던 부분을 명확한 문장으로 표현 = 스펙 명확화
  - **필수 조건을 만족할 때까지 계속 인터뷰로 파고들면서 스펙을 결정한다**
- 이미 유명한 오픈소스들에서 많이 사용중인 방법
  - 절대 원본 그대로 설치하지 않고, 분석 후 필요한 개념만 채택 -> 하네스는 최대한 가볍게 유지
  - `superpowers` / `grill-me` / `ouroboros` ... 좋아 보인다고 막 설치하면 충돌나고 토큰 폭발
  - 필요한 개념들만 잘 훔쳐와서 나에게 맞게 커스터마이징

---

# Spec -> Design -> Plan

- Claude Code에서 제공하는 기본 Plan Mode 대신 - 스펙 주도 개발 (SDD = Spec Driven Development)
  - 어느 정도 규모 있는 작업에서 유리 (간단한 버그 수정에서는 과함)
- 대화와 탐색을 통해 충분한 컨텍스트를 확보 -> 결정 사항 인터뷰 -> 조건 충족하면 명세서 작업 -> 검토 후 수정 / 진행
  - spec : 기능 설명? 디테일? 제약 조건? 완료 기준? -> `SPEC-xxx.md` (생략 가능)
  - design : 구현 가능성? 어떻게? 기술적 결정사항? -> `DESIGN-xxx.md` (생략 가능)
  - plan : 몇 단계 task? 수정 파일? 예상 결과? 검증 방법? -> `PLAN-xxx.md`
- plan 실행은 새로운 세션에서 시작하거나 다른 에이전트에게 위임. (Smart Zone & Dumb Zone)

---

# Code Review

- `/simplify` , `/code-review` : Claude Code의 기본 코드 수정/검토 명령어
  - 코드 리뷰는 작업한 세션이 아닌 새로운 세션이나, 서브 에이전트를 통해 진행한다. (깨끗한 컨텍스트에서 진행하여 편향 회피)
  - 서브 에이전트의 코드리뷰 -> 지적받은 사항에 대해 메인 에이전트가 **재검토** -> 보고
  - Unity, InGame 코드의 특징에 따라 리뷰 에이전트를 정의하고, 엣지 케이스를 탐색할 수 있도록 skill과 조합
- `ultracode` + `dynamic workflows`
  - 복잡한 단계의 파이프라인을 **직접 정의**하여, 작업 구역을 나누고, 다수 에이전트를 병렬로 소환하여 진행한다.
  - 용도 : 한 컨텍스트에 들어가지 않는 대규모 작업, 크리티컬한 이슈에 대한 교차 리뷰, 심도 깊은 자료 조사( `/deep-research` )
- AI 코드 리뷰는 보조 수단. 지적받은 내용은 직접 확인하여 수동 검증 필요

---

# Context Gathering Skills

- AI에게 설명하는 것 자체가 병목인 때가 있다
  - `atlassian-page-cli` : Confluence 혹은 Jira URL -> 원문 + 첨부 스샷, 영상을 그대로 제공하여 이슈 설명 간소화
  - `backtrace-tracker` : 크래시 정보 -> Backtrace 자동 조회 -> 유사 이슈 확보 -> AI의 컨텍스트에 적재
  - `reading-bytes-tables` : 기획 테이블 값 조회 (코드에서 알 수 없음) -> AI가 직접 읽고 로직 판단
- `LLM Wiki` : LLM이 참고할 수 있는 정보들을 스스로 관리. 문서간의 상관 관계, MOC 태그 명확화

---

<!-- _class: title -->

# Make It AI-Friendly

---

# 충분한 컨텍스트를 주기

- 클로드에게 충분한 정보를 주었는지?
  - 무작정 시키지 말고 먼저 적절한 컨텍스트를 줘야 함
  - 프롬프트를 잘 쓰기 = 컨텍스트를 잘 제공하려고 하는 것
  - 프롬프트 쓰기 귀찮으면 컨텍스트를 스스로 확보할 수 있는 지침, 방법, 도구를 주기
- AI는 우리 프로젝트를 모르는 천재 신규 입사자
  - 거대파일, 함정 변수명, 스파게티 코드 -> 헷갈림.
  - 코드에 답이 없는 도메인 규칙, 암묵지 -> 모름.

---

# 읽기 쉬운 코드 주기

- 코드는 클로드가 접근할 수 있는 가장 큰 규모의 컨텍스트 후보들
  - 우리의 코드 컨벤션 = 클로드가 보고 따라 적는 교본
- 클래스, 함수명으로 역할 유추 가능하도록 -> Grep, Read 혼란 방지.
- 불필요한 주석 제거 -> Grep, Read 혼란 방지.
- 몇만 줄 거대 파일을 최대한 역할별로 쪼개기 -> 토큰 사용량 최적화.
- 그냥 사람이 보기에 깔끔한 코드 = 보통 AI에게도 유리함.

---

# 도메인 지식을 알 수 있게 하기

- 코드로 바로 알기 힘든 암묵지가 추측 실패의 주범 (프로토콜, 규약, 협의)
  - 이 프로토콜/리소스는 서버팀/아트팀과 어떻게 처리하기로 약속했는지?
  - 어떤 상황에서는 어떤 클래스, 함수를 쓰기로 약속했는지?
  - 메신저나 컨플루언스 등 외부 경로를 통해 공유되는 팀 내부 규칙, 참고사항이 있는지?
- `.claude/rules/*.md` 에 주의점을 명문화
  - `paths` : 해당 파일에 접근할 때 rules 문서가 컨텍스트에 적재된다. (조건부 로드)
  - Git에 올리면 모든 팀원의 AI가 공유 가능

---

<!-- 원본 PDF에는 이 슬라이드 앞의 한 장(원래 38쪽)이 빠져 있다. 원본 쪽번호는 37 다음이 39. -->

# 검증 방법을 주기

- 검증 수단이 없으면 AI가 멋대로 판단한다.
- 검증 수단이 있으면 스스로 감지 -> 수정 -> 재검증 루프의 완성이다
  - `ReAct Loop` 구조의 Observation (관측) 정보를 준다
- 검증 방법 예시
  - 컴파일 (dotnet build), 정적 분석 : 제일 비용 적고 간단한 방법
  - 단위 테스트 코드 : 도입하기 힘든 코드베이스도 존재함
  - 런타임 테스트 자동화 : 토큰, 시간 비용 / 효율적인 단계까지 가기 위한 R&D 비용
  - 사람의 개입 + 피드백 : 현실적, 신뢰도 높음. 개입 병목

---

<!-- _class: title -->

# Conclusion

---

# 하네스 엔지니어링 -> 검증 -> 개선 -> 반복

- **검증**: 하네스가 의도대로 도는지 확인. 확률적이라 믿는 게 아니라 검증한다.
- **개선 · 반복**: 완성시켜도 새 모델 나오면 다시 달라진다 -> 끝나지 않는 루프
  - [Opus 4.7 best practices](https://claude.com/blog/best-practices-for-using-claude-opus-4-7-with-claude-code)
  - [Opus 4.8 prompting](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)

> AI가 좋은 결과를 뱉을 수 있는 환경을 설계하고, 계속 관리해야 한다

---

<!-- _class: title -->

# END
