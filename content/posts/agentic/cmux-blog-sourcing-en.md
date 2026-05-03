---
title: "Turning Other Sessions' Conversations into Blog Material"
date: "2026-03-29"
description: "Used cmux to read conversations from other Claude Code sessions and judge whether they'd make blog posts. Out of 4 sessions, one became a post."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

Run multiple Claude Code sessions at once and each one accumulates decent conversations. Judgments made while analyzing a repo — "this is useful, that's hype." Things hit while setting up a tool — "this approach doesn't work." These observations sit as text on the session screen.

The problem is sessions are isolated. What happened in session A, session B doesn't know. Humans tab between windows and connect context in their heads. AI can't see outside its own session.

cmux removes that wall.

## cmux and read-screen

cmux is a terminal multiplexer similar to tmux but with Claude Code-specific features and CLI support. The CLI is what matters. It lets Claude read other sessions' screens and send messages via commands.

Two commands were enough for this:

```bash
cmux tree --all                        # view full workspace/session structure
cmux read-screen --surface surface:24 --scrollback --lines 200  # read another session's screen
```

`tree` shows what sessions are running. `read-screen` pulls text from a specific session's screen. What a human does by switching tabs and connecting dots in their head — the AI does via CLI.

cmux supports plenty more — workspace management, message sending (`send`), browser control, screenshots, notifications. I've bundled these into a Claude Code skill called `cmux-collab`. The skill also defines protocols for swarm dispatch (parallel research) and adversarial debugging (multi-session bug debates), but what I used this time was the simplest pattern: reading other sessions.

Two constraints. `read-screen` only reads what's in the terminal scrollback buffer. Collapsed output and anything past the buffer limit can't be read — older conversations lose their beginning. And every screen you read dumps that text into the current session's context. The more sessions you read, the less context headroom you have. You can't read everything — pick the sessions that matter.

## Scanning 4 Sessions

From the blog session, I told the AI to read the other sessions' screens. "Check if there's anything worth writing about."

Four sessions:

**surface 24** — Analysis of Claude Code Game Studios, a GitHub repo with 6,500 stars. Dissected the 48-agent hierarchy and extracted the practical parts.

**surface 25** — Analysis of garrytan/gstack. Classified useful patterns from the Hook and Skill system into A/B/C tiers.

**surface 26** — Building the cmux-collab skill. Derived conditions for an AI coordinator and added a preflight interview concept to the skill.

**surface 40** — Merging 3 Obsidian vaults into one. Community research, symlink structure design, hook configuration still in progress.

## 1 Out of 4 Became a Post

Read everything and filtered. There were criteria.

Surfaces 24 and 25 were the same thread. Combining the comparative repo analysis with my own failed experience splitting agents into roles — it wasn't just critiquing someone else's repo but landing on the same problem from my own angle. That became "I Tore Open a 48-Agent AI Game Studio."

Surface 26 was about an AI coordinator experiment, but still at test level — too thin on experience. I wrote a draft and it turned into "trashing AI companies" rather than a real account. Deleted it. Writing it after actually running the coordinator properly.

Surface 40 was mid-setup for Obsidian. Need to finish the setup and actually use it for a while before there's anything to write about. Writing it now would produce a setup guide, and that's not the kind of post I do here.

Three filters: **Is the experience complete?** **Does my own observation go in?** **Would it become a setup guide?**

## Conversations Become Scripts

The core of this process: conversations with Claude become the raw script for blog posts. What was tried, what failed, what was chosen — it's already in the conversation. Read it, pick the material, supplement with an interview, and you get a post without separate research.

When I wrote [the Codex blog posting workflow](/posts/agentic/codex-blog-posting) before, it was about extracting experience through interviews within a single session and polishing drafts. This time, a material discovery step was added up front. Read conversations across sessions, judge "this could be a post," then run the same interview process. Sourcing and writing connected in one loop.

Working in a single session, you only see that session's context. Reading other sessions through cmux shows what I did today across the board. The same pattern could work for retrospectives, documentation, and handoffs — not just blog material.

And the biggest advantage of this approach: writing becomes less of a burden. Conversations are the script, so there's nothing to prepare separately. Conversations from regular work pile up, and later you scan through them to pick material. Posts come from work already done, not from carving out time to write.
