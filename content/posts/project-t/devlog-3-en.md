---
title: "Epoch: Unseen Devlog 3 - Filling the Combat Prototype"
date: "2026-01-17"
description: "SPUM sprites, protagonist design, combat animations, and battle formulas — filling in the combat prototype materials all at once."
categories: []
open: true
type: "devlog"
project: "project-t"
series: "epoch-unseen-devlog"
---

Touched a lot of visible combat pieces this round. Unit sprites, protagonist setup and visuals, combat animations, battle formulas — all in one pass. The combat prototype finally has a shape.

## Unit Sprites

Went with SPUM. Not entirely my taste — I prefer retro pixel art — but convenience and productivity make it a reasonable pick. Popular among indie devs for good reason.

Used to require separate sheet work for optimization. Now it's a built-in feature. One click and it's done. That matters.

![Devlog - 3 image 1](./img/devlog-3-01.png)

Tweaked the white-haired hero character slightly. Everything else is mostly default presets. Speed over polish at this stage.

## Protagonist Setup

Revisited protagonist lore this round. Had an old setting from a mod called "Cheonha" that I'd shelved years ago. Instead of restoring it wholesale, I pulled only the surviving core.

Original flavor leaned Three Kingdoms. This time, fully pivoted to medieval fantasy. Almost no reference material survived — rebuilt mostly from memory fragments.

![Erich](./img/devlog-3-05.png)

![Lise](./img/devlog-3-06.png)

Drafted Erich and Lise visuals here. Illustrations generated with SDXL, picked usable results after a few rounds.

## Combat Animations

Ate a lot of time. But after this pass, almost no legacy code remains. Chose to restructure rather than force-fit old code.

![Devlog - 3 image 2](./img/devlog-3-02.png)

The animation editor is so convenient now. Between AI and asset tools, hard to imagine how I used to do everything manually.

## Stat Types

Current base stats:

- HP
- MP
- ATK — physical attack
- DEF — physical defense
- MAG — magic attack
- RES — magic resistance
- SPD — hit rate, evasion, follow-up attacks
- LCK — critical rate

Roughly this direction. Names not fully locked.

Some SRPGs use two-tier stats — e.g., "Prowess → Attack Power." This project started that way but I scrapped it. Current form is more intuitive and simplifies growth formulas.

A "Command" stat might appear later if a commander system gets added. Still conceptual.

## Battle Formulas

![Devlog - 3 image 3](./img/devlog-3-03.png)

Battle formulas turned into data assets via GraphToolkit. Screenshot shows the magic hit-rate formula.

Physical damage, magic damage, physical hit rate, magic hit rate, crit chance — common formulas used across combat. Plus per-skill special formulas.

Formula count will grow fast.

![Devlog - 3 image 4](./img/devlog-3-04.png)

Managing all of this in code alone becomes unmaintainable. Separating formulas into data assets was necessary. GraphToolkit won because formulas need to be human-readable and editable.
