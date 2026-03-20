---
title: "FlyingCat"
date: "2025-12-20"
description: "AI 기반 개발이 어디까지 되는지 확인하려고 만든 브라우저 캐주얼 게임이다."
thumbnail: "/posts-images/flyingcat/img/flyingcat-01-title.png"
tags:
  - "GameDev"
open: true
role: "게임 플레이 구현, UI 구성, 배포, AI 기반 개발 실험"
highlights:
  - "각도와 힘을 조절해 멀리 날리는 캐주얼 플레이"
  - "Antigravity + Gemini 3.0 Pro로 끝까지 밀어본 실험"
  - "WebGL 빌드로 itch.io에 배포"
links:
  demo: "https://yhkk.itch.io/flyingcat"
  docs: "/posts/flyingcat/vibe-coding"
---

막 만들고 싶은 주제가 있었던 건 아니다. 지인이 추천해 준 게 계기였고, 열정 프로젝트라기보다 AI 기반 개발 실험이 목적이었다. 게임 자체가 목적이었으면 완성도를 더 올리고 컨텐츠를 추가했을 텐데, 여기서는 끝까지 만들어보기 자체에 더 집중했다.

고양이가 햄스터를 날려 보내는 구조다. 예전 플래시 게임 `NANACA CRASH`에서 모티브를 가져왔다. 발사 각도와 힘을 잡고 날린 뒤, 공중에서 방향을 바꾸고 장애물 효과를 받아 최대한 멀리 보낸다. 겉으로는 단순해 보여도 물리와 상태 전환이 계속 맞물리는 구조라 손이 갈 곳이 꽤 많았다.

도구는 Antigravity와 Gemini 3.0 Pro 하나로만 밀었다. 제일 힘들었던 부분은 스프라이트 뽑기였다. ComfyUI로 뽑으면 투명 배경을 잘 못 만들었고, 흰 배경에서 배경 제거 AI를 돌려도 깔끔하게 안 지워지는 경우가 많았다. 이미지는 마음에 들어도 실제로 게임에 쓰기 힘든 경우도 있어서, 이 과정이 제일 시간을 많이 먹었다.

결과물은 WebGL로 빌드해서 itch.io에 올렸다. AWS Cognito와 Lambda를 붙여 랭킹 기능도 넣었다.

## 링크

데모는 위 링크에서, 제작 기록은 아래 허브에서 볼 수 있다.
