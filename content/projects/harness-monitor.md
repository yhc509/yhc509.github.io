---
title: "Harness-Monitor"
date: "2026-03-18"
description: "로컬 하네스 데이터를 읽어 토큰 추세, 세션 기록, 연동 상태를 한 화면에서 보는 모니터링 도구다."
thumbnail: "/images/projects/harness-monitor.png"
tags:
  - "Harness"
open: true
role: "데이터 계층 설계, 로컬 수집기 구현, 대시보드 UI 구현"
highlights:
  - "토큰 추세와 프로젝트별 사용량 집계"
  - "세션 기록과 연동 상태 탐색"
  - "Codex에서 시작해 다른 하네스로 확장 가능한 구조"
links:
  github: "https://github.com/yhc509/Harness-Monitor"
---

## 개요

Codex 기준으로 시작한 로컬 하네스 모니터링 도구다. 토큰 추세, 과거 세션, skill, MCP, hook 상태를 한 화면에서 본다. 이름을 `Harness-Monitor`로 잡은 것도 Codex 전용 도구로 두지 않기 위해서다.

## 문제/배경

하네스를 오래 쓰면 세션, 메모리, 설정, `token_count` 이벤트가 각자 다른 파일과 폴더에 쌓인다. 파일을 직접 뒤지는 방식으로는 사용량 추세나 설정 상태를 계속 점검하기 어렵다. 이 프로젝트는 흩어진 로컬 데이터를 한곳에 모아 하네스를 계속 관찰할 수 있게 만들었다.

## 핵심 구현

1. `~/.codex`, `~/.agents`, `token_count` 이벤트를 읽어 프로젝트, 모델, 날짜 기준의 분석 데이터로 다시 묶는다.
2. 토큰 페이지, 세션 페이지, Integrations 페이지를 나눠 사용량 추세와 대화 기록, 설정 상태를 같이 보게 했다.
3. 공급자별 데이터 계층을 따로 두어 Codex에서 시작하되 다른 하네스도 붙일 수 있게 잡았다.

## 링크

GitHub는 위 링크에서, 관련 글은 아래 허브에서 확인할 수 있다.
