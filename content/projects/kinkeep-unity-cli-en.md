---
title: "kinkeep-unity-cli"
date: "2026-03-18"
description: "Declarative CLI that controls Unity Editor over direct IPC — no port management, no intermediate server."
thumbnail: "/images/projects/kinkeep-unity-cli.svg"
tags:
  - "Unity"
  - "AI/AgenticCoding"
open: true
role: "CLI design, Unity bridge package, Codex skill design"
highlights:
  - "Connects to editors by project path without port setup"
  - "~40 declarative commands — scene, prefab, material, QA"
  - "Token optimization cuts material responses 71%, scene 41%"
links:
  github: "https://github.com/yhc509/kinkeep-unity-cli"
  docs: "https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md"
  benchmark: "https://github.com/yhc509/kinkeep-unity-cli/wiki/Benchmark-Unity-Editor-CLI-Tool-Comparison"
---

## Overview

`kinkeep-unity-cli` controls the Unity Editor declaratively from the command line. It finds running editors by project path and connects over local IPC (Named Pipe / Unix socket). No intermediate server — average response time 265ms.

## Background

Building Epoch: Unseen, I was using Unity MCP. Running multiple editors in parallel meant constantly juggling port assignments. Servers had to be started manually, and project-to-editor matching was unreliable.

MCP-based tools route every call through AI → MCP server → HTTP → Unity plugin — slow and fragile. Dynamic code execution is flexible but requires the LLM to generate correct C# every time, with a second call needed to read results.

## Design

Took a third path: **declarative commands over direct IPC.**

- CLI talks directly to the Editor over local IPC. No intermediate server.
- Declarative commands like `scene add-object --primitive Cube --position 3,0,0`. The LLM picks options, not APIs.
- Every command returns JSON to stdout immediately. No polling, no log scraping.
- `--output compact` and `--omit-defaults` cut token consumption (material 71%, scene 41% smaller).

~40 commands cover scene, prefab, material, asset, package, play mode QA, screenshot, and console operations. The name reflects its purpose: keeping the connection to Unity editors alive without manual port management.

## Benchmark

Compared against an MCP tool and a dynamic code execution tool on the same scenario.

| | kinkeep-unity-cli | MCP | Dynamic Code |
|--|--|--|--|
| Avg response | **265ms** | ~1,200ms | 739ms |
| Success rate | **100%** | ~88% | 97.6% |
| Total time | **9.8s** | ~40.7s | 31s |

Full results on the [benchmark wiki](https://github.com/yhc509/kinkeep-unity-cli/wiki/Benchmark-Unity-Editor-CLI-Tool-Comparison).

## Links

- GitHub: [github.com/yhc509/kinkeep-unity-cli](https://github.com/yhc509/kinkeep-unity-cli)
- Architecture: [docs/architecture.md](https://github.com/yhc509/kinkeep-unity-cli/blob/main/docs/architecture.md)
- Benchmark: [Unity Editor CLI Tool Comparison](https://github.com/yhc509/kinkeep-unity-cli/wiki/Benchmark-Unity-Editor-CLI-Tool-Comparison)
