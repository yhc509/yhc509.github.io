---
title: "Ditched Claude's Memory for Obsidian"
date: "2026-04-04"
description: "Moved AI agent memory from directory-scoped storage to a single Obsidian vault. Cross-project knowledge sharing works, and cron jobs keep the docs from rotting."
categories: ["AI/AgenticCoding"]
open: false
type: article
---

Claude Code's memory system didn't work for me. It's directory-scoped. Something you teach it in project A doesn't carry over to project B. I can't even remember which folder I saved which memory in. It works fine in A, does something stupid in B, and I have to dig through memory files one by one to figure out why. There's no concept of global memory.

If you only work on one project, it's tolerable. I run several in parallel. Knowledge about Unity editor automation that I built up while developing kinkeep-unity-cli becomes nonexistent knowledge in the game project that uses that CLI. Same person, same tools, but context is severed because the folder is different.

Documents were a problem too. Specs, design docs, and research notes were scattered across `docs/`, `plans/`, `.claude/` in every project. Hard to even find what documents exist. When outdated docs stick around, the agent references them and contaminates the work.

## One Obsidian Vault

Decided to use Obsidian as the knowledge store. One vault only. Project specs, design docs, research notes, memory — everything goes in this vault. Projects only keep code.

Claude Code accesses the vault entirely through CLI. Read, write, search. Knowledge gained during a session gets written to the vault as a document. Next session pulls from the vault when needed.

The connective tissue is tags. Every document gets YAML frontmatter tags — project name, document type. When Claude Code enters a specific project, it finds related documents by tag. Since the link is tags rather than folder structure, a single document can span multiple projects.

Obsidian's graph view is for humans to grasp the overall structure. AI can't see the graph view. It follows wikilinks and tags inside documents instead. Wire the references well and the graph view becomes meaningful for humans, while AI can navigate to related documents too.

## Cut Off Claude's Memory

I no longer use Claude's built-in memory system. Claude keeps trying to update its memory, and I stop it every time. All memory goes into the vault's `Memory/` folder. Each project's local memory file just has a redirect that says "look at Obsidian."

Whichever project you start a session in, you hit the same memory. What's learned in project A works in project B. The directory-scoped constraint is gone.

## Keeping Docs From Rotting

Documents rot when you create them and don't maintain them. A document missing tags won't show up in searches. A document with broken references becomes an orphan. When an agent treats an outdated document as current fact, work breaks.

I run a cron job. A script that checks whether Obsidian documents follow the rules. Finds documents with missing tags, broken references. If anything lingers in Claude's local memory, it gets moved to the vault.

Manually reviewing documents every day is impossible. They keep piling up. Without automation to maintain quality, the vault eventually degrades back to the same fragmented state as before.

## Knowledge Across Projects

The clearest win right now is kinkeep-unity-cli. As I develop the CLI package, knowledge about Unity editor automation, scene handling, and asset management accumulates in the vault. When I open Claude Code in a game project that uses this CLI, the vault serves up how the CLI works and what its constraints are. Debugging "why isn't this command working" without CLI development context versus approaching it with knowledge of the internals — completely different.

Especially useful when splitting features into packages and running parallel work. Each package project lives in its own directory, but shared knowledge is in one vault. Directory boundaries don't break context.

## What I Don't Know Yet

I don't know what happens when more documents pile up. Right now I'm satisfied. But whether search quality holds when the vault has hundreds or thousands of documents, whether the tag system scales, whether Claude accurately finds relevant documents — I'll only know by using it.

Andrej Karpathy seems to be trying something similar, though not with Obsidian. Giving the agent a separate external knowledge store. Different tools, same direction. Whether this is a passing trend or becomes basic infrastructure for running agents — I'll have to keep using it to find out.
