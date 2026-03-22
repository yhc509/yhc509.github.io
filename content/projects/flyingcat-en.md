---
title: "FlyingCat"
date: "2025-12-20"
description: "A browser casual game built to test how far AI-assisted development could go."
thumbnail: "/posts-images/flyingcat/img/flyingcat-01-title.png"
tags:
  - "GameDev"
open: true
role: "Gameplay implementation, UI layout, deployment, AI-assisted development experiment"
highlights:
  - "Casual launch-and-fly gameplay with angle and power control"
  - "Built end-to-end with Antigravity + Gemini 3.0 Pro"
  - "Deployed to itch.io as a WebGL build"
links:
  demo: "https://yhkk.itch.io/flyingcat"
  docs: "/posts/flyingcat/vibe-coding"
---

No burning idea drove this. A friend suggested the genre, and the real purpose was testing AI-assisted development, not making a polished game. If the game had been the goal, I'd have added more content and polish. Here the focus was on finishing something end-to-end.

A cat launches a hamster. Inspired by the flash game NANACA CRASH. Set launch angle and power, change direction mid-flight, collect obstacle effects, send it as far as possible. Looks simple, but physics and state transitions mesh constantly — plenty of surface area.

Built entirely with Antigravity and Gemini 3.0 Pro. Hardest part was sprite generation. ComfyUI couldn't produce clean transparent backgrounds, and background-removal AI left artifacts. Images that looked good were often unusable in-game. That process ate the most time.

Deployed as WebGL to itch.io. Added a leaderboard with AWS Cognito and Lambda.

## Links

Demo at the link above. Development notes in the hub below.
