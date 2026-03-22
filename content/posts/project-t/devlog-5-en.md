---
title: "Epoch: Unseen Devlog 5 - Counter System and AP Rules"
date: "2026-02-15"
description: "Locked down counter-attack and AP rules, refactored, and set the finish line for the combat phase."
categories: []
open: true
type: "devlog"
project: "project-t"
series: "epoch-unseen-devlog"
---

Bundled frequently-touched combat rules this round. Counter attacks, AP, refactoring — setting a boundary for how far to take the combat phase.

## Counter System and Combat Cleanup

Built the SRW-style counter system: `Counter / Evade / Defend` on receiving an attack.

Also built the AI formula for choosing between them. Got heavy GPT assistance — more complex than expected.

Tunable variables exposed for later balance testing.

![Devlog - 5 image 1](./img/devlog-5-01.png)

## AP System

Added Action Points. Consumed by attacks, skills, item use.

Most units spend 1–3 AP. Boss-tier or intentionally strong units may get 4–5.

Might fully replace MP. Need more playtesting to decide.

## Refactoring

Code got messy from sustained pushing. Did a cleanup pass.

Stripped over-optimized and over-engineered code.

## Next

About two months since restarting development. Slow pace, working alongside a day job.

Unit detail popup and pause popup — once those are done, the combat phase is roughly complete.

Time to start preparing scenario and maintenance phase.
