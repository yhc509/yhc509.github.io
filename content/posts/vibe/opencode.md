---
title: "OpenCode"
date: "2026-01-09"
description: "OpenCode에 정착했다."
categories: ['AI/VibeCoding']
open: true
---

## OpenCode

- [OpenCode](https://opencode.ai/)
- Antigravity -> Claude Code -> OpenCode로 정착했다.
- 업데이트나 기능 개발이 활발히 이루어지고 있는 오픈소스인 것 같다.
- 나름 팬덤도 있는 듯.

## Oh-My-OpenCode

- [Oh-My-OpenCode](https://github.com/code-yeongyu/oh-my-opencode)
- 한국인 개발자분이 만든 플러그인. 대단하다.
- Sisyphus라고 하는 Main-Agent를 통해 역할별로 특화된 Sub-Agent를 호출해 사용한다.
- 이 플러그인 덕분에 현재 Claude, Gemini, GPT-codex를 3개를 모두 사용하고 있다.
- 사용하면서 느끼는건 각 LLM의 장단점을 잘 매칭시킨 것 같다.
  - Claude는 전체적인 진두 지휘에 탁월하고, 딱 센스있는 일잘러 느낌. 대신 비싸다. -> Main-Agent로 사용한다.
  - Codex는 구조나 설계를 잘 한다. 특히 복잡한 문제를 엄청 오랫동안 고민하고 결론을 도출한다. -> 리팩토링이나 구조 설계를 할 때 Sub-Agent로 사용한다.
  - Gemini는 싸고 빠르다. 대신 환각이 심해서 코드 작성에는 약하다. -> 빠르게 문서나 코드를 탐색할 때 Sub-Agent로 사용한다.
- 단, Claude를 API가 아닌 구독 형식으로 사용하는 것에 대한 정책 위반 논란이 조금 있다.
  - OMO의 문제는 아니다. Claude 인증은 다른 플러그인을 통해 처리됨.
