---
title: "What I Actually Look for After Switching AI Coding Tools"
date: "2026-03-19"
description: "After cycling through Antigravity, OpenCode/OMO, Codex, and Claude Code, I stopped comparing intelligence and started comparing hallucination tolerance, usage headroom, autonomy fit, and model composability."
categories: ['AI/AgenticCoding']
open: true
type: article
---

I used to pick AI coding tools by asking which is smartest. Months of switching changed the criteria. Now I check how long I can leave a task running, how much hallucination I'll tolerate, whether the tool's autonomy fits my workflow, and whether it composes with other models. Less about raw capability, more about work rhythm.

Experience scope for this post:

- Antigravity: Gemini 3.0 Pro
- Claude Code: Claude Opus 4.5, 4.6
- Codex: GPT 5.1, 5.2, 5.3, 5.4

## Why I kept switching

Not because I couldn't settle. As the work changed, the criteria sharpened, and the main tool shifted with them.

First I wanted to know how far vibe coding could be trusted. Then I tested whether splitting roles across multiple models beat relying on one. Now the question is whether "throw a task, come back later" actually works — and whether I can control what comes back.

## Antigravity and Gemini 3.0 Pro: vibe coding starts here

Antigravity was my first real vibe coding tool. Overhauled this blog with it, built a Unity mini-game called FlyingCat over a week. First time I felt AI could handle real implementation.

Early speed was real — results moved forward without me writing every line. But limits appeared fast. Repeated compile errors hurt most — partly inexperience, partly Gemini 3.0 Pro hallucinating the same failures over and over. Antigravity proved vibe coding works. It didn't last as a daily driver.

## OpenCode/OMO: model composition clicks

What stuck from this phase wasn't OpenCode itself but the workflow OMO demonstrated. I was already using Claude and Gemini; adding GPT let me try splitting roles across models for real.

Biggest takeaway: how you divide roles between models matters more than any single model's capability. One handles the big picture, one takes deep structural work, one skims code and docs fast. Their weaknesses cancel out.

OMO pulled me into harness internals. Read the project's source, tried adding features. My PR duplicated work already merged, but the process shaped how I evaluate harnesses. Extracted OMO's subagent layout and referenced it when building agent orchestration at work.

Stopped using OpenCode daily, but my selection framework locked in here. A good tool doesn't solve everything alone — it lets you compose models your way.

## Codex and GPT 5.4: trust to delegate

Watched Codex for personal work since early February 2026. Through 5.3 it was rough — too robotic, bad at natural instructions. Trust came with 5.4.

I slice work small, define scope, throw it over, control what comes back. From 5.4, Codex matched that rhythm. Throw a task, it runs alone for thirty to forty minutes, returns with results. Some say Codex doesn't finish things. For me it stops about right.

Claude Code feels like finding direction together. Codex feels like it picks direction on its own. Long refactors, structural cleanup, anything I can hand off and walk away from — Codex handles well.

One quirk: it codes defensively to a fault. Guard logic piles up thicker than needed, and results get heavier than they should. The perfectionism sometimes makes the code messier.

## Why I'm running Claude Code alongside

Codex alone isn't enough. I use Claude Code at work and plan to keep running both at home.

Claude Code's harness is stronger. It sees the full shape of a problem better. Output feels more human-touched. When deciding how to split a problem, which direction to go, where to stop — Claude as mediator improves results.

For sustained execution, Codex fits better. So the current setup: Claude sets direction, Codex pushes through. Most stable combination I've found.

## Current selection criteria

What I look at now:

- **Hallucination tolerance.** Repeated compile errors or obvious factual mistakes make a tool unusable as a daily driver.
- **Usage headroom.** Long tasks need room to run. Without it, real productivity doesn't happen.
- **Autonomy match.** Do I want tight ping-pong collaboration, or scoped delegation? The tool's personality has to fit.
- **Composability.** Models that look similar play different roles in practice. Trying combinations and finding the split matters.

Not "find the best model." Use each long enough to learn where it breaks, then assign roles. Claude Code and Codex look alike on paper. A week of use makes the gap obvious. Hands-on beats reviews.
