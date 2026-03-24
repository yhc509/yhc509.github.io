---
title: "OnceWrite"
date: "2026-03-24"
description: "블로그 글 하나를 넣으면 5개 SNS 플랫폼에 맞는 콘텐츠가 나온다. SNS를 모르는 1인 개발자를 위한 콘텐츠 리퍼포징 도구."
thumbnail: "/images/projects/once-write.png"
tags:
  - "SaaS"
open: true
role: "제품 설계, 프롬프트 파이프라인 설계, 인프라 구축 (코드는 Codex에 위임)"
highlights:
  - "블로그 글 하나를 Twitter·Reddit·Threads·Instagram·Bluesky 맞춤 콘텐츠로 변환"
  - "플랫폼마다 톤이 내장되어 있어서 사용자가 따로 고를 필요 없다"
  - "분석→생성→검증 3단계 파이프라인으로 품질 안정화"
links:
  demo: "https://once-write.vercel.app/"
---

블로그 글 하나 쓰는 것도 에너지다. 같은 내용을 플랫폼마다 톤 바꿔서 다시 쓰는 건 안 한다. 그래서 만들었다.

글을 넣으면 Twitter 스레드, Reddit 글, Threads 포스트, Instagram 캡션, Bluesky 포스트 5가지가 나온다. 플랫폼마다 톤이 다르다. Twitter는 볼드하게, Bluesky는 조용한 자신감으로, Reddit은 솔직하고 겸손하게. 사용자가 톤을 고를 필요 없이 플랫폼이 결정한다.

하루 10크레딧, 플랫폼 1개 변환당 1크레딧. 로그인해야 충전된다.

스택은 Next.js + Clerk + LemonSqueezy + Supabase + Claude API.
