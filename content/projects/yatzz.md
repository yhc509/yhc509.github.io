---
title: "Yatzz - AI와 함께 만든 주사위 게임"
date: "2025-12-18"
description: "Gemini와 Claude를 활용하여 만든 2인용 야쯔(Yahtzee) 주사위 게임입니다. AI 페어 프로그래밍의 가능성을 실험한 프로젝트입니다."
thumbnail: "/images/projects/yatzz.svg"
tags:
  - "web/frontend"
  - "react"
  - "game"
  - "ai-assisted"
open: false
---

## 프로젝트 소개

**Yatzz**는 AI와의 협업으로 만든 2인용 야쯔(Yahtzee) 주사위 게임입니다.

**라이브 데모**: [yatzz.vercel.app](https://yatzz.vercel.app)

---

## AI 협업 개발

이 프로젝트는 **Gemini**와 **Claude** 두 AI를 활용하여 개발했습니다.

### 사용한 AI

| AI | 역할 |
|------|------|
| **Gemini** | 초기 코드 생성, 게임 로직 구현 |
| **Claude** | 코드 리뷰, 버그 수정, 리팩토링 |

### 개발 과정

1. Gemini에게 야쯔 게임의 기본 구조와 규칙을 설명
2. 생성된 코드를 기반으로 Claude와 함께 디버깅
3. 두 AI를 번갈아가며 기능 추가 및 개선
4. 최종 검토 후 Vercel 배포

### 느낀 점

- AI가 게임 로직 같은 명확한 규칙 기반 코드를 잘 생성함
- 두 AI의 스타일이 달라서 상호 보완이 됨
- 프롬프트를 잘 작성하는 것이 중요함
- 코드를 이해하고 검증하는 과정은 여전히 사람의 몫

---

## 야쯔(Yahtzee) 게임이란?

5개의 주사위를 굴려 다양한 조합을 만들어 점수를 얻는 전략적 주사위 게임입니다.

### 기본 규칙

- 각 턴마다 주사위를 최대 3번 굴릴 수 있음
- 원하는 주사위를 선택하여 고정(Hold)할 수 있음
- 13개의 점수 카테고리 중 하나를 선택하여 기록
- 모든 카테고리가 채워지면 게임 종료

### 점수 카테고리

| 카테고리 | 조건 | 점수 |
|----------|------|------|
| Ones ~ Sixes | 해당 숫자 | 숫자 합계 |
| Three of a Kind | 같은 숫자 3개 | 주사위 합계 |
| Four of a Kind | 같은 숫자 4개 | 주사위 합계 |
| Full House | 3개 + 2개 | 25점 |
| Small Straight | 연속 4개 | 30점 |
| Large Straight | 연속 5개 | 40점 |
| Yahtzee | 5개 동일 | 50점 |
| Chance | 조건 없음 | 주사위 합계 |

---

## 기술 스택

| 기술 | 버전 |
|------|------|
| React | 19.x |
| Lucide React | 아이콘 |
| ESM CDN | 모듈 로딩 |

빌드 도구 없이 브라우저에서 직접 실행되는 구조입니다.

---

## 링크

- **라이브 데모**: [yatzz.vercel.app](https://yatzz.vercel.app)
