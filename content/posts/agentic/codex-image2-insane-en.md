---
title: "Codex + GPT-5.5 + Image 2 Is Insane — I Killed My Own Tool in a Month"
date: "2026-04-26"
description: "Generating Epoch: Unseen character art and pixel battle maps with a single line in Codex CLI. Character Forge is retired."
categories: ['AI/AgenticCoding']
open: true
type: article
project: "project-t"
---

Two months ago I built [Character Forge](/posts/agentic/character-forge-en), a ComfyUI-based character illustration generator. A tag-based input layer wrapped around a local SDXL pipeline so I could iterate fast on character portraits. Roughly 1–2 minutes per image, 5–6 attempts before I got something I liked.

I don't use it anymore. I killed my own tool in a month. Its replacement is the imagegen skill running through Codex CLI with GPT-5.5 xhigh — that is, GPT Image 2.

## A One-Line Workflow

The old flow looked like this:

1. Open Character Forge UI
2. Pick tag combinations
3. Generate 4 images, wait 1–2 minutes
4. If unsatisfied, repeat 5–6 times
5. Star favorites, save selected candidates

The new flow looks like this:

```bash
codex exec "Generate late-game Erich illustration. Black hair, red eyes, crimson cape with silver armor, ruined city at sunset background, slightly melancholic but resolved expression"
```

That's it. Codex picks up the imagegen skill on its own, sets up the prompt, calls GPT Image 2, and drops the file into the project folder. My contribution: one line of natural language.

Here's what came out:

![Erich late-game illustration](./img/erich-late.png)

Throw character setup and mood at it and you usually get something usable on the first try. When I want to adjust a specific detail — "the cape looks too heavy, lighten it", "make the expression colder" — natural language feedback gets it sorted in 2–3 attempts. What used to take 5–6 iterations on Character Forge now takes 1–3.

## "Understanding Style" Is Not a Marketing Line

GPT Image 2's killer feature is that **it actually understands the style I want**. It doesn't just take keywords and draw — it absorbs feedback and applies it to the next attempt.

- "Keep this character's tone but swap the outfit" → maintains face consistency, swaps the outfit
- "This part feels too cartoonish, push it more toward illustration" → adjusts detail accordingly
- "Remove the background, keep only the character" → handles it automatically. For tricky alpha regions like hair tips or cape edges, **it tries multiple removal algorithms**, and when something gets accidentally cut off, **it re-applies its own masking** to land on the best result

That last part was the real shock. On Character Forge, even with "force white background" enabled, backgrounds occasionally bled in and I'd re-roll or post-process. Now "remove background" as a single instruction does it.

## The Future That a License Refused

I tried the same flow on pixel battle maps. Originally I was about to spend $120 on a popular pixel tilemap asset pack. Right before checkout I re-read the license:

> Use in works that incorporate generative AI is prohibited.

My game has AI-generated character art. So I can't legally use this asset even if I buy it. I closed the checkout tab and handed the job to GPT Image 2.

Quality is "decent" — it doesn't match a commercial pixel asset pack in detail or consistency. But **for a solo indie developer, decent is enough to ship.** And the license is clean. It doesn't conflict with the rest of my game.

A license clause designed to keep generative AI works out ended up forcing that very work to depend more heavily on generative AI assets. Ironic, but that's the current reality of the indie scene.

## About Cost

Here's another insane part: **it's included in the GPT subscription.** No separate API bill.

Character Forge ran SDXL on a Mac Mini 64GB. Setting aside electricity and heat — model downloads, ComfyUI workflow management, occasionally broken dependencies — all of that was on me. With GPT Image 2, all that infrastructure lives at OpenAI and I just throw a single line of natural language at it.

If this had been a metered API, I'd be watching cents-per-image add up. It isn't. It runs inside the subscription. As a solo indie dev I've never had a cost structure this clean for asset generation.

## Why Character Forge Died

When I built Character Forge, the core insight was: "the problem is the input system, not the prompt." Replace freeform prompts with tag-based inputs to gain repeatability.

Looking back, that insight wasn't wrong — **the model just absorbed the insight on its own**. GPT-5.5 xhigh already understands my natural-language intent, maintains consistency on its own, and folds feedback into the next attempt. The consistency and repeatability I was forcing through a tag system, the model now solves inside plain language.

No UI needed. No tag catalog. No workflow JSON. All I need is a single natural-language command and Codex CLI.

## What This Means for Indie Devs

Game asset commissions are expensive. $50–300 per character illustration, $100–300 for a pixel tilemap pack. A solo developer can't realistically buy or commission everything.

Until now the alternatives were (a) draw it yourself, (b) detour through Stable Diffusion-style local models, or (c) generate directly in the ChatGPT/Gemini chat UI or pay metered image-API costs. (a) doesn't work if you can't draw. (b) takes a month just to build the tooling (I know — Character Forge was that month). (c) struggles with character consistency and context across a chat, and the API route stacks up per-image cost over time.

There's a fourth path now. **Generate game assets with one line of natural language inside Codex CLI.** Characters, backgrounds, tilemaps, UI icons, cutscene art — all from the same interface. The flow of writing code and the flow of generating assets now live in the exact same shell.

This is genuinely insane. I didn't expect to kill a tool I built two months ago within a month, and I really didn't expect it to die to a one-line command.
