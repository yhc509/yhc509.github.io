---
title: "Harness-Monitor"
date: "2026-03-18"
description: "로컬 Codex 활동 데이터를 모아 세션, 메모리, 연동 도구, 토큰 사용량을 한 화면에서 보는 모니터링 UI입니다."
thumbnail: "/images/projects/harness-monitor.png"
tags:
  - "Harness"
open: true
role: "데이터 수집 구조 설계, Fastify API, React/Vite 대시보드 구현"
highlights:
  - "세션 로그와 token_count 이벤트 재가공"
  - "프로젝트/시간대 기준 대시보드"
  - "공급자별 데이터 계층 분리"
links:
  github: "https://github.com/yhc509/Harness-Monitor"
---

## 개요

로컬 Codex 활동을 보는 모니터링 UI입니다. 세션, 메모리, MCP, 토큰 사용량을 한 화면에서 확인할 수 있습니다.

## 문제/배경

로그, 메모리, 설정, 토큰 이벤트가 여러 위치에 흩어져 있어 흐름을 보기 어렵습니다. 프로젝트별 사용량이나 세션 흐름도 바로 파악하기 힘듭니다.

## 핵심 구현

1. `~/.codex`, `~/.agents`, `token_count` 이벤트를 읽어 분석 데이터를 만듭니다.
2. Fastify API와 React/Vite UI를 분리했습니다.
3. 프로젝트별 세션 탐색, 시간대별 사용량, 토큰 분포 화면을 제공합니다.
4. 공급자별 데이터 계층을 분리해 Codex 외 다른 도구도 붙일 수 있게 했습니다.

## 링크

- GitHub: [github.com/yhc509/Harness-Monitor](https://github.com/yhc509/Harness-Monitor)
