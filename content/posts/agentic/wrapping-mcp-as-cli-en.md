---
title: "Don't Connect MCP Directly"
date: "2026-05-30"
description: "Why someone who compulsively avoids MCP had no choice but to wrap Rider's debugger in code. On-demand connection instead of registration, token filtering at the CLI layer, and the Anthropic conclusion I only found out about later."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

I recently built a small tool called [rider-debug](https://github.com/yhc509/rider-debug). It's a Claude Code skill plus CLI that lets an agent drive Rider's debugger, attached to a running Unity Editor, without starting a new session. Set breakpoints, inspect variables, step through execution.

But this post isn't about the features. It's about why I wrapped it in code instead of registering it as an MCP server.

## I don't turn on MCP much

I avoid it almost compulsively. The reason is simple. Run several MCP servers and their tool definitions eat that much context, and re-enabling one you'd turned off mid-session means restarting the session entirely. Running Claude Code and Codex for long stretches, both of these kept bothering me.

So I build a CLI instead of an MCP whenever I can. I built `unity-cli-bridge` to drive Unity from an agent for the same reason. A CLI gets called only when needed, and I get to decide how much output flows back. That's a different kind of burden than an MCP that's always up and occupying context.

## I wanted a CLI, but Rider didn't have one

I wanted an agent to use Rider's debugger features (breakpoints, variable reads, execution control), but there was no way to hit those from a CLI directly. The only thing available was a plugin called [Debugger MCP Server](https://plugins.jetbrains.com/plugin/29233-debugger-mcp-server). That plugin had the whole debugger engine.

So the choice was one of two. Register the MCP and use it as-is, or wrap that MCP in the shape I wanted. For the reasons above, registering didn't appeal to me. So I wrapped it.

## Connect on demand, not on registration

What "wrap" means concretely: a small CLI that connects to the debugger over SSE + JSON-RPC only when needed. Because it isn't registered as an MCP, tool definitions don't load into context from the start of the session. They attach right at the moment debugging is needed, inside the session already running.

This mattered especially for debugging. Debugging usually becomes necessary suddenly, "in this exact context." The moment you're staring at code and think, "I need to check what value actually comes in here." If each of those moments required a fresh session, that whole context would be gone. On-demand connection was a choice to preserve it.

## Wrapping gives you control

It's a thin wrapper, but the wrapping itself was the point. Wrap it and three things become yours to shape:

- Keep the session alive and connect only when you want to.
- Don't preload tool definitions into context.
- Filter output down to the level you want.

The third one I felt while running function tests after building it. It wasn't even a real bug hunt, just checking behavior, yet inspecting a single instance value dumped a flood of values I didn't need. Pass that straight to the model and a single loop through the debugger drains context fast. So I filter the variable dump at the CLI layer (`get_vars --simple --names=...`) and cache the tool catalog for 24 hours so it isn't re-read every time. Filtering finishes before the model ever sees it.

## Turns out it was already a recommended pattern

I built this structure first. A few days later, while cleaning it up to push to the repo, it suddenly occurred to me: "does this structure even mean anything?" I asked Claude, and it came back with an article saying Anthropic already recommends this approach: [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp).

Its point was twofold. Load all MCP tool definitions upfront and the context fills with hundreds of thousands of tokens before a request is even handled; on top of that, the intermediate results tools pass around go through the model every time, burning tokens twice over. So expose the MCP as a code API, let the agent write code to call it, load definitions only when needed (progressive disclosure), and filter data inside the execution environment before it reaches the model. In the article's example, the same task dropped from 150,000 tokens to 2,000, a 98.7% reduction.

What felt uncanny reading it: my on-demand connection and CLI-layer filtering mapped exactly onto its "don't preload definitions" and "filter intermediate results before the model." I built it without knowing that article existed. I just pushed my own way to dodge an annoyance, and the conclusion I arrived at landed on the same spot others call best practice. Honestly, that was the most satisfying part of the whole thing.

## Closing

So rider-debug is a thin wrapper on top of Debugger MCP Server, but to me that "wrapping" was everything. Because it let me decide how context gets used, how the session stays alive, and how far the output gets shown.

One more thing: this is still personal R&D. I haven't leaned on it in production. The bugs worth attaching a debugger to are the hard-to-reproduce ones, and the reproducible ones usually get sorted out from the code or logs alone.

I expect to actually use it in a side project when the chance comes. And if I do, it probably won't mean handing all the debugging to the AI. More likely it's the other way around: I'm tracking down an issue, I've set a breakpoint, and Claude or Codex joins me there to make sense of what's going on. The original motivation was a question: can an agent, instead of reading code and only guessing, prove a hypothesis by stepping through a live process itself? That question is still open. And further out, if the per-session cost drops and I'm working on something an AI can actually test against (in games, that leans toward turn-based genres more than real-time ones), I sometimes daydream about wiring this together with unity-cli-bridge into a debugging automation system.
