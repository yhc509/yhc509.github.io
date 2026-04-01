---
title: "I Presented Claude Code to Our Division's Developers"
date: "2026-04-01"
description: "Retrospective on presenting Claude Code to division developers. Development, issue tracking, spec-to-checklist conversion — what I thought about while preparing to show how I actually use it."
categories: ["AI/AgenticCoding"]
open: true
type: devlog
---

Yesterday I gave a Claude Code presentation to the developers in our division. Three of us split it up — the others covered why we picked Claude Code, the current state of agentic coding, and what harness engineering is. My section was real use cases.

What I thought about most while preparing wasn't the cases themselves. It was the tone. I had no idea how these people felt about delegating code to AI. Some might be into it. Some might think it's reckless. That shaped how I framed everything.

## Development

At home I delegate 100% of code to AI. Solo work, no stakes. I only look at the code when I'm studying or publishing something.

Work is different. Bad code ships under my name. So I deliberately emphasized this gap in the presentation.

I delegate to AI but I don't walk away. I review diffs before every commit. If variable names or function names don't match the style, I step in immediately. If the code structure feels wrong, I redirect without hesitation.

I didn't start big. About six weeks ago, small dev tasks first. If things went fine, I expanded scope. Now I'm running large-scale content development through it.

Looking back at this progression while preparing the talk, it came down to feel. Delegating code to AI isn't "not coding." It's coding in a different shape. Instead of typing, you set direction, judge output, and pick when to intervene. That's what agentic coding feels like to me right now.

## Issue tracking

When an issue lands in Jira, I usually go to a crash collection service like Backtrace and manually search for related logs. Set filters, search, compare similar cases. Takes a while.

I built a skill for this. Paste the Jira info and Claude reads the content, decides on filters, and queries the collection service via CLI. Reports similar cases too. Paste and wait — that's it.

I included this because the work runs in parallel. While I'm doing something else, Claude is digging through the issue. I don't have to stop what I'm working on to investigate.

If I only showed cases about delegating code, the impression stays at "a tool that codes for you." I wanted to show that the agent saves time outside of coding too.

## Spec to task checklist

When I develop, I normally read the spec and build my own checklist. What to implement, in what order, crossing items off as I go.

I handed this to Claude.

The first version (v1) just fed the spec and extracted a checklist. Results weren't bad. Actually produced about 3x more items than I'd make by hand. Thorough, but had gaps.

v2 didn't go straight from spec to checklist. It decomposed and grouped the source text first. About 2x more granular than v1. But a new problem appeared. Claude couldn't judge gray areas — things the spec didn't explicitly define. "Should this be included?" items piled up and the list got unnecessarily long.

This wasn't in the presentation, but today I built v3. Before analyzing the spec, it interviews me first. Asks "include this or skip it?" for each gray area, then builds the checklist from those answers.

The checklist comes out as a markdown file. During development, Claude and I look at this file together — "let's build this one today."

There are limits. A spec is not the codebase. Features that look cleanly separated in the spec can be tangled in code. Technical constraints not in the spec can exist. You can't just trust the checklist and code blindly.

## LSP

I also included a case where I tested LSP efficiency on a real project. I already wrote about this separately.

Details here: [Does Claude Code's LSP Actually Save Tokens?](/posts/agentic/claude-code-lsp-token-efficiency-en)

I wanted to show the attitude of verifying things yourself instead of using something because everyone says it's good. You don't know what difference a tool actually makes until you run the test.

## insights

Claude Code has a `/insights` command. It analyzes your conversation history and summarizes your usage patterns with an evaluation.

It was useful for showing my own use cases in a condensed form, and I hoped the division members would try running it themselves. Once you start using Claude Code, you develop your own patterns. Running insights shows you what those patterns look like at a glance. Pretty useful for reflecting on how you work.

## After preparing the presentation

Preparing the talk organized things for me too. Pulling out stuff I'd been using without much thought, trying to explain it to others — that's when it became clear why I use things the way I do.

Delegating to an agent isn't something I started with high trust. I started with small tasks and built a feel for it. Even now, the loop of delegating then checking never drops out. Without that loop, you can't use this at work.

After the talk, a few people messaged me asking how to set up Claude Code. They want to install it and try it themselves. So the message got through, at least.
