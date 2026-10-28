---
title: "Dice Hunters"
date: "2026-10-28"
kind: game
description: "A vertical 3D roguelike where the poker-like hand you roll with five dice becomes your attack."
thumbnail: "/images/projects/dice-hunters.png"
role: "Solo side project. I handled design, programming and art direction."
highlights:
  - "A web game built with TypeScript, Three.js and Vite. It plays right in the browser on itch.io with nothing to install."
  - "The first load is about 250 KB gzipped. Each act's 3D models load only when you reach that act."
  - "3D models, rigging and animation were generated with Meshy and then cleaned up. The dice are built in code."
  - "All sound is synthesized in the browser with WebAudio, so there are no audio files to download."
  - "Supports English and Korean. It picks a language from the browser setting, and you can switch any time in settings."
links:
  itch: "https://yhkk.itch.io/dice-hunters"
---

![Dice Hunters map, hero select, combat and title screens](/images/projects/dice-hunters-gameplay.png)

## The game

Each turn you roll five dice up to three times. Tap the dice you like to keep them, then reroll the rest. The hand you end up with becomes a card, and a bigger hand means a bigger multiplier on your hero's attack. Four of a Kind, Full House, Straights and the Yacht, five of a kind, are all on the table.

Each hand does something different. Some cards hit one enemy and some hit all of them. Low Pips give you a shield, and Mid Pips heal you. Tap a card to see its exact damage formula, then drag it onto an enemy to play it.

## Building a run

There are seven acts, each with its own setting, enemies and boss. Every act has a branching three-column map, so you choose your path through battles, elites, shops, rest sites, events, forges and treasure on the way to the boss.

All six heroes are unlocked from the start, and each has a unique ability. You carve effects onto your dice faces and collect equipment and consumables to grow the run. Fate shards, unlocks and hunter ranks from F to S carry over between runs. The Daily Contract adds one blessing and one curse each day, the same for everyone on that date.

## Where it stands

It went live on itch.io on October 28, 2026, free to play. It's built for a phone held upright, and it also supports landscape and desktop. Saves stay in that device's browser. There are no ads or payments, and online ranking is turned off.
