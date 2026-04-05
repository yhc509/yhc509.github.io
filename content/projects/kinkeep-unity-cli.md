---
title: "kinkeep-unity-cli"
date: "2026-03-18"
description: "선언적 명령으로 Unity 에디터를 제어하는 CLI. 포트 관리 없이 직접 IPC로 연결한다."
thumbnail: "/images/projects/kinkeep-unity-cli.svg"
tags:
  - "Unity"
  - "AI/AgenticCoding"
open: true
role: "CLI 설계, Unity 브리지 패키지 구현, Codex 스킬 설계"
highlights:
  - "포트 없이 프로젝트 경로로 에디터에 바로 붙는다"
  - "~40개 선언적 명령 — scene, prefab, material, QA까지"
  - "토큰 최적화로 material 71%, scene 41% 응답 축소"
links:
  github: "https://github.com/yhc509/kinkeep-unity-cli"
  docs: "https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md"
  benchmark: "https://github.com/yhc509/kinkeep-unity-cli/wiki/Benchmark-Unity-Editor-CLI-Tool-Comparison"
---

## 개요

`kinkeep-unity-cli`는 Unity 에디터를 CLI에서 선언적으로 제어한다. 프로젝트 경로를 기준으로 실행 중인 에디터를 찾고, 로컬 IPC(Named Pipe / Unix socket)로 직접 연결한다. 중간 서버 없이 평균 265ms 응답.

## 문제/배경

Epoch: Unseen을 만들면서 Unity MCP를 썼다. 에디터를 여러 개 띄우면 어느 포트가 어느 프로젝트를 가리키는지 자주 섞였다. 서버를 따로 실행해야 했고, 프로젝트와 에디터 매칭도 안정적이지 않았다.

MCP 기반 도구는 AI → MCP 서버 → HTTP → Unity 플러그인으로 호출이 흘러가서 느리고 실패 지점이 많다. 동적 코드 실행 방식은 유연하지만 매번 정확한 C#을 생성해야 하고 결과를 읽으려면 추가 호출이 필요하다.

## 설계

**선언적 명령 + 직접 IPC** 라는 세 번째 길을 택했다.

- CLI가 에디터와 로컬 IPC로 직접 통신한다. 중간 서버가 없다.
- `scene add-object --primitive Cube --position 3,0,0` 같은 선언적 명령. LLM이 C#을 생성할 필요 없이 옵션만 고르면 된다.
- 모든 명령이 JSON을 stdout으로 즉시 반환한다. 폴링이나 로그 스크래핑이 없다.
- `--output compact`, `--omit-defaults` 옵션으로 토큰 소비를 줄인다(material 71%, scene 41% 축소).

~40개 명령이 scene, prefab, material, asset, package, play mode QA, screenshot, console 영역을 커버한다. 이름에 `kinkeep`을 넣은 이유는 Unity 에디터와의 연결을 끊지 않고 유지하겠다는 의도를 담기 위해서다.

## 벤치마크

동일 시나리오에서 MCP 도구, 동적 코드 실행 도구와 비교 측정했다.

| | kinkeep-unity-cli | MCP | Dynamic Code |
|--|--|--|--|
| 평균 응답 | **265ms** | ~1,200ms | 739ms |
| 성공률 | **100%** | ~88% | 97.6% |
| 총 시간 | **9.8초** | ~40.7초 | 31초 |

자세한 결과는 [벤치마크 위키](https://github.com/yhc509/kinkeep-unity-cli/wiki/Benchmark-Unity-Editor-CLI-Tool-Comparison)에서 볼 수 있다.

## 링크

- GitHub: [github.com/yhc509/kinkeep-unity-cli](https://github.com/yhc509/kinkeep-unity-cli)
- 아키텍처 문서: [docs/architecture.md](https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md)
- 벤치마크: [Unity Editor CLI 도구 비교](https://github.com/yhc509/kinkeep-unity-cli/wiki/Benchmark-Unity-Editor-CLI-Tool-Comparison)
