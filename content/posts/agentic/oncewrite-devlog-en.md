---
title: "OnceWrite — A Content Repurposing Tool I Built for Myself"
date: "2026-03-23"
description: "Solo devs need to share their process. But I don't know social media. So I built this for myself."
categories: ["AI/AgenticCoding"]
open: true
type: devlog
project: once-write
---

I know solo devs are supposed to share their process. Build in public, devlogs, social media presence. All good advice, except I don't know social media. I have a Twitter account I barely use. No Instagram. Writing one blog post already costs energy. Rewriting the same thing in a different tone for each platform? No.

So I built one. Paste a blog post, get five versions: Twitter thread, Reddit post, Threads post, Instagram caption, and Bluesky post. Called it OnceWrite. Write once, post five places. Built it for myself from the start.

## Stack

Next.js + Clerk (auth) + LemonSqueezy (payments) + Supabase (DB) + Claude API (conversion).

Stripe doesn't work in South Korea, so LemonSqueezy. It's a Merchant of Record — handles global sales tax and VAT automatically. More realistic for a solo dev based in Korea selling globally.

## Delegated the code, set up the infra myself

Handed the code to Codex and focused on account setup. Clerk, Supabase, LemonSqueezy, Anthropic API — created accounts, grabbed keys, passed them over. Not writing code myself meant I could focus on the human work like prompt design.

Not smooth sailing. CAPTCHA error on Clerk signup (turning off Bot Protection fixed it), ran out of API credits ($5 top-up), typo in the repo name (OnceWrtie). Build passed.

## First test

Fed it my own blog post. $0.02 per conversion. English was fine. Korean broke JSON parsing. Haiku couldn't maintain JSON format when outputting Korean. Added explicit schema to the prompt and retry logic on parse failure. Fixed.

## Pre-deployment review

A working MVP doesn't mean it's ready to deploy. Ran a three-phase review — security, logic, legal — and found six critical issues. Exposed API keys, missing DB access controls, incomplete terms of service. The faster you build with vibe coding, the easier it is to miss these things.

First time deploying a SaaS, so I learned security and legal on the fly. Took longer than writing the code.

## Credit system

Went with daily credits. Ten per day, one credit per platform conversion. Credits refill on login only.

Initially, selecting all five platforms counted as one use. Five times the cost, one credit deducted — doesn't work. Switched to per-platform billing. The point is "a reason to come back every day." Credits refill on login, so if the habit sticks, that's the signal for demand.

## Model cost optimization

Set Gemini Flash Lite as primary, Claude Haiku as fallback. Gemini's free tier allows 1,500 requests per day. Enough for early traffic.

Quality was the problem. Korean-to-Japanese conversion broke when profile settings were enabled. Profile data in the system prompt made Gemini ignore the output language instruction. Small models start dropping fine-grained instructions as the prompt gets longer. The tug-of-war between free and quality will keep going.

## Rewrote the architecture three times

### Pipeline separation

Originally fed the entire source text to the AI and pulled all results at once. Analysis and generation tangled in one prompt made output unstable. Split into analyze → generate → validate. Stabilized, and input tokens dropped by half.

### Per-platform calls

Initially generated all five platforms in a single AI call. Fast, but the tone flattened across platforms. Switched to individual calls per platform, run in parallel. Output changed from JSON to plain text. Parsing issues disappeared, and tone differences between platforms became pronounced.

### Platform swap

Dropped LinkedIn and Facebook, added Bluesky. Target audience is solo/indie/anonymous developers — LinkedIn's professional tone and Facebook's community tone didn't fit. Tried Hacker News too, then dropped it. HN is just a title line — no repurposing value.

Removed the tone selection dropdown too. Instead of letting users pick professional, casual, or humorous, baked the tone into each platform's guide. Twitter gets bold energy, Bluesky gets quiet confidence, Reddit gets honest and humble. Letting the platform decide the tone is more natural.

## 22 hours

First commit to Vercel deploy: twenty-two hours. Without AI coding tools, easily one to two weeks.

## My workflow

OnceWrite is the last step in my content pipeline.

1. **Development** — Build with Claude and Codex.
2. **Session analysis → draft** — After development, have Claude analyze the conversation session and turn it into a blog post draft.
3. **Polish** — Read the draft, set the tone, fill in missing context. This step is human.
4. **OnceWrite** — Feed the finished post in. Out come the social media versions.

Development to social media posting in one flow. OnceWrite removes the last hurdle.

## So now

Deployed. Zero users. Built for myself to begin with.

I'm the first user. I use it daily and fix what's missing as I go. No marketing connections. Chronic lurker by temperament. Community engagement doesn't come naturally. That's why I needed this tool. Just lowering the hurdle of distributing one post across multiple platforms — for someone like me, that's enough.
