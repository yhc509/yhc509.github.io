---
title: "Does Claude Code's LSP Actually Save Tokens?"
date: "2026-03-16"
description: "I expected LSP to reduce token usage by improving code navigation accuracy. On large projects and Unity codebases, the answer was more nuanced."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

Simple assumption: LSP means fewer grep runs, more accurate navigation, fewer tokens. That's what I expected watching Claude Code discussions.

Docs and changelogs make the case obvious. Jump to definition, follow references, inspect types, fast diagnostics — better than text search. Should be cheaper too.

Direct comparison said otherwise. On the large projects and Unity codebases I tested, "LSP = faster and cheaper" didn't hold.

## Starting hypothesis

My hypothesis:

- LSP enables semantic navigation.
- That reduces grep iterations and raw file reads.
- Time drops, tokens drop, report accuracy rises.

The first two still hold. The third didn't. In practice, accuracy, time, and tokens didn't move in the same direction.

## How I tested

Simple setup. Trace a function's logic, map its callers into a report. Run multiple times with parallel subagents. Compare accuracy, time, and token cost.

The variable that split results: caller count. How many places call this function determined everything.

## Few callers: grep wins easily

Under 10 callers, grep won by a wide margin. Almost no errors. LSP felt like the long way around.

Few references and text search closes context fast. The overhead of preparing an LSP query, waiting, having the model interpret results — more expensive than grep finishing outright.

Hypothesis wrong here. Better tool didn't mean cheaper tool.

## Many callers: grep falls apart suddenly

Past 10 callers, grep accuracy dropped visibly. It grabbed same-named functions from other classes, mixed textually similar results. Reports came back fast but unreliable. At ~90 callers, variance was extreme — some runs looked plausible, others were near-random. Reports that appeared valid contained wrong caller sets.

Speed stopped being an advantage. Fast but untrustworthy.

## LSP: slower, more expensive, but stable

LSP was consistently slower. Used more tokens too — clearly so in my experiments.

But accuracy held. For caller identification, LSP runs showed no errors in my tasks. Rising caller count didn't break results. Same-name confusion didn't happen.

Odd experience. Expected "LSP = more efficient." Got "LSP = less reason to doubt the result." Not token-saving. Accuracy-preserving.

## Why this happens

My interpretation:

- Low-reference tasks are simple enough that grep suffices.
- As references grow, text search gets vulnerable to name collisions and context misreads.
- LSP is slower and costs more per query, but locks symbol-reference relationships reliably.

LSP's advantage isn't "always cheaper." It's "less wrong as complexity rises."

That difference matters. Agent coding isn't always about speed. If fast-but-wrong reports keep appearing, verification and rollback costs at the next step grow. Factor those in and LSP's slowness isn't pure loss.

## How I use it now

My conclusion is straightforward:

- Few callers, simple context — grep wins.
- Many callers, large reference graph — LSP earns its cost.
- As of March 2026, I don't expect LSP to save time or tokens.

I don't use LSP as a default. I don't treat it as a universal token optimizer. I use it where grep's accuracy collapses — to preserve accuracy. That framing matched reality far better.
