---
title: "FlyingCat"
date: "2025-12-20"
kind: game
description: "A browser physics game about launching a cat as far as it will fly. Set the angle and power, then use skills mid-air to stretch the distance."
thumbnail: "/images/projects/flyingcat.png"
role: "Solo side project from concept to release. AI wrote the implementation, and I set the direction and reviewed the work."
highlights:
  - "Built in Unity and exported to WebGL, so it plays right in the browser on itch.io with nothing to install."
  - "Antigravity with Gemini 3.0 Pro handled the implementation. I reviewed its plans and steered it through comments."
  - "The UI was built with UIToolkit, and the art was made with NanoBanana."
  - "A distance leaderboard runs on AWS Cognito and Lambda."
  - "Physics and state changes kept drifting a frame apart, so I dropped Unity's built-in physics and rewrote the flight logic myself."
links:
  itch: "https://yhkk.itch.io/flyingcat"
---

![FlyingCat gameplay](/images/projects/flyingcat-gameplay.png)

## The game

It started from the old Flash game NANACA CRASH. You pick an angle and a power level, launch the cat, and steer it up or down mid-air so it hits the right obstacles and helpers along the way. When it comes to a full stop, the run is over.

Each thing you hit does something different. Some knock you back up at an angle, some push you forward, some slow you down, and some make you briefly untouchable. It looks simple, but physics and state changes are tangled together the whole way.

## How it was made

I built it to see how far vibe coding could carry a small game, so I kept my hands off the code on purpose. The AI wrote a plan, I read it, and I only stepped in by leaving comments and approving changes.

It went further than I expected: the game loop, the UI, a WebGL release and even a leaderboard. It also edited the wrong code or gave wrong instructions now and then, so a person still had to do the final check. The full story is in the related post below.

## Where it stands

It's up on itch.io as a prototype and works with both mouse and touch.
