---
title: "From Zero Ideas to a Deployed SaaS in 22 Hours"
date: "2026-03-24"
description: "I decided to build and sell a SaaS with vibe coding. From idea exploration to deploying OnceWrite — everything that happened in 22 hours."
categories: ["AI/AgenticCoding"]
open: false
type: devlog
---

I wanted to build something with vibe coding and sell it. No idea what. Drew up an elaborate plan, then burned a full session finding ideas, killing them, finding more. A content repurposing tool called OnceWrite eventually made it to production. Twenty-two hours, first commit to deploy.

## Started with the workflow, not the product

Didn't start with "let's build this." Designed the full pipeline first — vibe-coding a web service and selling it. Tech stack comparisons, idea generation, marketing automation, revenue models. Made templates too — CLAUDE.md, PRD, .env — copy into any new project and go.

Smooth so far. Then the hard part. Build what?

## Took plenty of detours

"Could freelancing be automated?" I researched the Upwork API and picked an actual gig to practice with — an Instagram DM automation SaaS. Except I don't use Instagram. Don't even have an account. Switching to Twitter meant $200/month for the API. When I suggested mock data, the AI was blunt.

> Building a practice project is "coding practice," not "business practice."

Dropped it.

Researched Product Hunt. AI tools made up 40–50% of listings. Game dev tools were niche. The only game-related hit, Meshy, had positioned itself as "AI 3D model generator," not "game dev tool." My Character Forge had a similar shape, but the market was saturated.

Game ideas came next. A balance simulator tempted me — drew up a full plan. But I hadn't done real balance tuning myself. The AI seemed to wing it too. And who pays for a CLI?

> If you keep researching, you'll never start.

Fair point. Just pick one and ship it within two weeks.

## OnceWrite

I picked "content repurposing tool." Paste a blog post, get six versions: Twitter thread, LinkedIn post, Reddit post, newsletter, summary, and tips list. Named it OnceWrite. Write once, post six times.

Stack: Next.js + Clerk (auth) + LemonSqueezy (payments) + Supabase (DB) + Claude API (conversion). Stripe doesn't work in South Korea, so LemonSqueezy was the replacement. It's a Merchant of Record, handling global sales tax and VAT automatically. More realistic for a solo dev based in Korea.

## MVP in a day

I delegated development to Codex and focused on setting up accounts. Clerk, Supabase, LemonSqueezy, Anthropic API — made accounts, copied keys, handed them over.

Not smooth. CAPTCHA error on Clerk signup (turning off Bot Protection fixed it), insufficient API credits ($5 top-up), typo in the repo name (OnceWrtie). Build passed anyway. Tested with my own blog post — $0.02 per conversion. English worked. Korean broke JSON parsing. Haiku was mangling JSON format on Korean output. Fixed.

## Six critical issues before deployment

Working MVP doesn't mean deploy-ready. Three-phase review — security, logic, legal — turned up six critical issues.

Highlights: Google AI API key exposed as a URL query parameter — plaintext in every proxy log. Moved to header. Governing law was Korean, but Terms of Service existed only in English — E-Commerce Act violation risk. Korea's data privacy law required fields that were missing entirely.

First SaaS deployment. Learned security and legal on the go. The most common Supabase incident turned out to be forgetting RLS. In 2025, over 170 Lovable-built apps exposed their entire databases that way.

## Overhauled the pricing model

The original plan was $9/month Pro + 3 free uses.

> It'll be tough. "I can do this for free with ChatGPT" — the classic AI wrapper trap.

Blunt and correct. Restructured. Locked paid plans behind "Coming Soon," switched to daily credits — ten per day, one per platform conversion. Credits refill on login only, so there's a reason to come back.

The old model counted one generation as one use no matter how many platforms you picked. Six at once cost the same as one. Per-platform charging fixed the imbalance.

## Put Gemini first, ran into limits

To cut costs, I set Gemini Flash Lite as the primary model with Claude Haiku as fallback. Gemini's free tier allows 1,500 requests per day, enough for early-stage traffic.

Quality broke first. Korean-to-Japanese conversion with a profile (name, role, tone) enabled — translation fell apart. Profile data in the system prompt made Gemini ignore the output language and follow the input language instead. Removing the name field fixed it.

Small models lose fine-grained instructions as prompts grow. Free and quality will keep pulling in opposite directions.

## 22 hours

First commit to Vercel production: twenty-two hours.

Idea exploration → freelancing, Product Hunt, game tools eliminated → OnceWrite confirmed → full-stack build → security review → credit system overhaul → bilingual legal docs → model fallback → UI polish → deploy. Without AI coding tools, easily one to two weeks.

## What's next?

Deployed. Zero users. No marketing connections. Chronic lurker by temperament.

What's left is building in public. Reddit first, Twitter to document the process, Product Hunt to launch. An anonymous alt account is fine. In indie hacker circles, nobody cares about your handle. Visibly building something is all that matters.

One metric to watch: does anyone come back? If someone burns through their daily credits every day, regardless of DAU, that's paid demand.

Twenty-two hours. Started with nothing, reached production. From here it stops being about building and starts being about validation. Planning to keep documenting.
