---
title: "kinkeep-unity-cli"
date: "2026-03-18"
description: "CLI that finds Unity editors by project path and keeps the connection alive without manual port management."
thumbnail: "/images/projects/kinkeep-unity-cli.svg"
tags:
  - "Unity"
open: true
role: "CLI design, Unity bridge package, Codex skill design"
highlights:
  - "Connects to editors by project path without port setup"
  - "Auto-selects between Live IPC and batchmode"
  - "Asset and prefab commands directly from the CLI"
links:
  github: "https://github.com/yhc509/kinkeep-unity-cli"
  docs: "https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md"
---

## Overview

`kinkeep-unity-cli` is a CLI that finds running Unity editors by project path. It was built to keep Unity MCP workflows stable while multiple editors stay open in parallel.

## Background

Building Epoch: Unseen, I was using Unity MCP. Running multiple editors in parallel meant constantly juggling port assignments. Servers had to be started manually, and project-to-editor matching was unreliable.

## Core Implementation

A Unity package bridge starts with the editor. The CLI checks the project path and registry to pick the target editor. If the editor is running, it connects through Live IPC. If the editor is closed, it falls back to batchmode. The name reflects its purpose: keeping the connection to Unity editors alive without manual port management. Commands like `asset create`, `prefab create`, `prefab inspect`, and `prefab patch` run directly from the CLI.

## Links

- GitHub: [github.com/yhc509/kinkeep-unity-cli](https://github.com/yhc509/kinkeep-unity-cli)
- Architecture: [docs/architecture.md](https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md)
