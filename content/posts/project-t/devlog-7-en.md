---
title: "Epoch: Unseen Devlog 7 - Lua Migration and Class Tree"
date: "2026-03-07"
description: "Dropped Graph assets, reverted to Lua/code-based data structures, finalized the class tree, and cleaned up UI."
categories: []
open: true
type: "devlog"
project: "project-t"
series: "epoch-unseen-devlog"
---

Major direction change: dropped Graph asset structure, reverted to text-based data. Also finalized the class tree, title screen, and maintenance UI in one push.

## Data Structure Change

Devlog 3 chose Graph format for battle formulas. Devlog 4 chose Graph for scenario scripts. Turns out Graph Assets aren't AI-friendly. AI can't edit them directly — humans have to do it by hand.

In hindsight, a wrong call. Trial and error.

Battle formulas went back to code. Scenario scripts switched to Lua.

![Devlog - 7 image 1](./img/devlog-7-01.png)

Story script (R scene) written in Lua.

What I wanted was text-based: easy for both AI and humans to manage, easy to patch. Lua fits that purpose best right now.

## Class Tree

| Swordsman<br />├─ Duelist<br />│ ├─ Blade Dancer<br />│ └─ Executioner<br />└─ Saber<br />├─ Sword Saint<br />└─ Gale Blade | Lancer<br />├─ Crusher<br />│ ├─ Destroyer<br />│ ├─ Armor Breaker<br />└─ Spearmaster<br />├─ Dragoon<br />└─ Spear Saint | Shieldbearer<br />├─ Bulwark<br />│ ├─ Fortress<br />│ └─ Guardian<br />└─ Ironclad<br />├─ Pavise<br />└─ Phalanx |
| --- | --- | --- |
| Archer<br />├─ Sniper<br />│ ├─ Tracker<br />│ └─ Hawk Eye<br />└─ Bowman<br />├─ Marksman<br />└─ Bow Saint | Mage<br />├─ Elementalist<br />│ ├─ Witch<br />│ └─ Sage<br />└─ Hexer<br />├─ Necromancer<br />├─ Inscriber<br />└─ Arcanist | Cleric<br />├─ Inquisitor<br />│ ├─ Enforcer<br />│ └─ Penitent<br />└─ Savior<br />├─ Saint<br />└─ Martyr |

<video src="./img/devlog-7-02.mp4" controls loop muted playsInline />

Six base class trees, excluding special classes.

Swapped unit sprites within SPUM to something closer to my taste. Only placeholder mob animations for now — faction colors need more work. Using this as-is for a while.

Problem: mounted cavalry is hard to represent. Dropped the independent cavalry branch from this tree. Might attempt it later if time allows.

## Title and Maintenance Phase

Starting to look like a game. Haven't reached a full combat playthrough cycle yet.

UI is genuinely hard. Picked a color palette and applied it, but it still looks rough.

![Devlog - 7 image 3](./img/devlog-7-03.png)

Gemini artifacts are too visible. Need to clean those up with a watermark removal tool later.

![Devlog - 7 image 4](./img/devlog-7-04.png)

Placeholder story scene. The square grid shouldn't be visible.

![Devlog - 7 image 5](./img/devlog-7-05.png)

Pre-sortie maintenance scene. Still deciding between field exploration and menu-driven approach.

![Devlog - 7 image 6](./img/devlog-7-06.png)

This UI was the biggest headache. Got it cleaned up enough to feel satisfied.

![Devlog - 7 image 7](./img/devlog-7-07.png)

![Devlog - 7 image 8](./img/devlog-7-08.png)

## Alpha 1 Build Scope

Chapter 1 story is in rough draft. Rough means it'll keep changing through development. Incremental progress and revision beats trying to get it right in one shot.

Alpha 1 covers through mid-Chapter 1.

What happens when Alpha 1 ships?

Nothing. It's a self-imposed deadline and a goal.
