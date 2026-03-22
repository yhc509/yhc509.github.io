---
title: "Epoch: Unseen Devlog 8 - Save System, Scenario, and Hitting Codex Limits"
date: "2026-03-22"
description: "Pushed through save/load, UI, major refactoring, and scenario writing — then hit 100% of Codex's weekly quota."
categories: []
open: false
type: "devlog"
project: "project-t"
series: "epoch-unseen-devlog"
---

Pushed hard for several weeks. Save system, UI, refactoring, scenario — all at once. The price: 100% of Codex's weekly quota.

## Save/Load

![Save-load screen](./img/devlog-8-save.png)

Save files use EasySave3. Each file has two layers: metadata and payload. Metadata holds save version, build version, play time, current episode/stage — lightweight info. Payload holds campaign state, roster, flags, battle snapshot. The split lets the slot list render without loading full data.

Core piece: version migration pipeline. Save files record a version number. On load, if the version doesn't match current, automatic conversion runs. V1 stored campaign, roster, flags, and battle as separate keys. V2 unified them. `SaveVersionConverter1To2` reads V1 data and assembles V2 structure. When V3 arrives, one more converter is all it takes.

Writes use atomic swap — write to a temp file first, replace the original on success. A crash mid-write can't destroy the existing save.

Built this early to avoid "wipe all saves" every time the data structure changes.

## UI

![UI improvements](./img/devlog-8-ui-2.png)

UI keeps evolving. Endless work. Touch one spot and another catches your eye. Fix that and the thing next to it bothers you. For now, only fixing what's needed for feature implementation.

## Refactoring and Code Conventions

Pushed progress hard, code turned into a mess. Ran Codex without establishing conventions first — a clear mistake.

Classic vibe coding trap. AI produces working code without consistent conventions. It runs, so you don't notice the problem. Debt accumulates, then detonates.

Worst area: UI binding. Some files bound in `OnValidate()`, others in `Init()`, others used `??=` lazy binding. Codex had generated a different pattern per file.

New conventions: all UI reference binding in `SerializeData()` only. Event connections in `Init()` only. One script owns one prefab shape. `Resources.Load` calls unified through `ResourceLoader`. Applied across 39+ files. Largest commit: 80 files, 2,800 lines changed.

Could have saved this time by setting conventions upfront. Lesson: write the convention doc before handing code work to AI. Created code convention and codebase review documents in Epoch-Docs.

## Scenario

Wrote the Alpha 1 scenario in detail. Locked main allies, enemies, combat concepts. Designed a few systems but left them out of this spec — combat may feel dry. No balance testing this round. Just confirming the cycle works.

## Codex Weekly Quota Exceeded

![Codex weekly usage at 100%](./img/devlog-8-codex-limit.jpg)

Side projects keep spawning from Epoch work. Codex couldn't handle the load alone. Hit 100% of the Codex Pro ($200/month) weekly quota.

## Claude Returns

Codex bottomed out. Brought Claude ($100/month) in as relief. Dropped OpenCode due to policy violation concerns. Claude Code only.

Role split: Claude Code handles communication and directing. All code work goes to Codex. This keeps Claude usage tight while Codex gets headroom. Could work with GPT Plus ($20/month) too.

Kakao GPT Pro subscription has about three months left. After that, AI monthly subscriptions hit $130 — roughly ₩200,000 at current rates. Starting to feel the need for dollar-denominated cash flow.
