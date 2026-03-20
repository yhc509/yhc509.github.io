---
title: "PUC"
date: "2026-03-18"
description: "Unity Editor를 프로젝트 경로 기준으로 자동 연결해 수동 서버 실행과 포트 관리를 없앤 Portless Unity CLI입니다."
thumbnail: "/images/projects/puc.svg"
tags:
  - "Unity"
open: true
role: "CLI 설계, Unity 브리지 패키지 구현, Codex 스킬 설계"
highlights:
  - "Editor 시작 시 브리지 자동 연결"
  - "Live IPC / batchmode 이중 경로"
  - "asset/prefab 관련 명령 지원"
links:
  github: "https://github.com/yhc509/PUC"
  docs: "https://github.com/yhc509/PUC/blob/main/docs/architecture.md"
---

## 개요

Unity 프로젝트에 붙는 CLI입니다. 프로젝트 경로를 기준으로 실행 중인 Editor를 찾고, 가능하면 Live IPC로 붙고 아니면 batchmode로 처리합니다.

## 문제/배경

Unity 자동화는 수동 서버 실행과 포트 관리가 먼저 필요합니다. 프로젝트를 여러 개 열어두면 어느 Editor에 붙는지도 불안정합니다.

## 핵심 구현

1. Unity 패키지에서 브리지를 자동으로 시작합니다.
2. 프로젝트 경로와 레지스트리를 기준으로 대상 Editor를 고릅니다.
3. 실행 중이면 Live IPC로, 아니면 batchmode로 처리합니다.
4. `asset create`, `prefab create`, `prefab inspect`, `prefab patch`를 지원합니다.

## 링크

- GitHub: [github.com/yhc509/PUC](https://github.com/yhc509/PUC)
- 아키텍처 문서: [docs/architecture.md](https://github.com/yhc509/PUC/blob/main/docs/architecture.md)
