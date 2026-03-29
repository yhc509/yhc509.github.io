---
title: "kinkeep-unity-cli"
date: "2026-03-18"
description: "여러 Unity 에디터를 프로젝트 경로로 식별하고 포트 관리 없이 붙는 CLI다."
thumbnail: "/images/projects/kinkeep-unity-cli.svg"
tags:
  - "Unity"
open: true
role: "CLI 설계, Unity 브리지 패키지 구현, Codex 스킬 설계"
highlights:
  - "포트 없이 프로젝트 경로로 에디터에 바로 붙는다"
  - "Live IPC와 batchmode를 알아서 고른다"
  - "asset, prefab 명령을 CLI에서 바로 쓴다"
links:
  github: "https://github.com/yhc509/kinkeep-unity-cli"
  docs: "https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md"
---

## 개요

`kinkeep-unity-cli`는 Unity 프로젝트 경로를 기준으로 실행 중인 에디터를 찾아 붙는 CLI다. 여러 에디터를 병렬로 띄운 상태에서 Unity MCP 작업을 안정적으로 이어가기 위해 만들었다.

## 문제/배경

Epoch: Unseen을 만들면서 Unity MCP를 썼다. 에디터를 여러 개 띄우면 어느 포트가 어느 프로젝트를 가리키는지 자주 섞였다. 서버를 따로 실행해야 했고, 프로젝트와 에디터 매칭도 안정적이지 않았다.

## 핵심 구현

Unity 패키지 쪽 브리지는 에디터 시작과 함께 자동으로 올라온다. CLI는 프로젝트 경로와 레지스트리를 보고 대상 에디터를 고른다. 에디터가 켜져 있으면 Live IPC로 연결하고, 꺼져 있으면 batchmode로 처리한다. 이름에 `kinkeep`을 넣은 이유는 Unity 에디터와의 연결을 끊지 않고 유지하겠다는 의도를 담기 위해서다. `asset create`, `prefab create`, `prefab inspect`, `prefab patch` 같은 명령을 CLI에서 바로 실행할 수 있다.

## 링크

- GitHub: [github.com/yhc509/kinkeep-unity-cli](https://github.com/yhc509/kinkeep-unity-cli)
- 아키텍처 문서: [docs/architecture.md](https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md)
