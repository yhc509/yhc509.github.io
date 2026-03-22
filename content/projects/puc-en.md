---
title: "PUC"
date: "2026-03-18"
description: "Got tired of managing ports across multiple Unity editors. Built a CLI that connects by project path instead."
thumbnail: "/images/projects/puc.svg"
tags:
  - "Unity"
open: true
role: "CLI design, Unity bridge package, Codex skill design"
highlights:
  - "Connects to editors by project path — no ports"
  - "Auto-selects between Live IPC and batchmode"
  - "Asset and prefab commands directly from the CLI"
links:
  github: "https://github.com/yhc509/PUC"
  docs: "https://github.com/yhc509/PUC/blob/main/docs/architecture.md"
---

Building Epoch: Unseen, I was using Unity MCP. Running multiple editors in parallel meant constantly juggling port assignments. Had to start servers manually, and which editor a project connected to was unreliable.

So I built PUC — Portless Unity CLI. The name says it: no ports. Give it a project path and it finds the running editor automatically.

A Unity package bridge starts with the editor. The CLI checks the project path and registry to pick the target editor. Editor running — Live IPC. Editor closed — batchmode. Commands like `asset create`, `prefab create`, `prefab inspect`, `prefab patch` work directly from the CLI.

Developing this alongside Epoch was mentally taxing — context-switching between the two. Still using and extending it daily.

## Links

- GitHub: [github.com/yhc509/PUC](https://github.com/yhc509/PUC)
- Architecture: [docs/architecture.md](https://github.com/yhc509/PUC/blob/main/docs/architecture.md)
