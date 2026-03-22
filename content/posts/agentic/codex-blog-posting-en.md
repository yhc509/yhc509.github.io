---
title: "How I Run Blog Operations with Codex"
date: "2026-03-20"
description: "Not just drafting posts — sorting, interviewing, editing, wiring images, adding mermaid support. A blog maintenance workflow run alongside Codex."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

Not about asking Codex to write a post. This session touched the blog repo together — deleting old posts, re-splitting devlogs, cleaning project pages, writing new ones. Felt closer to "editing partner" than ghostwriter.

One precondition: parts needing my opinions and experience come from me. Codex structures, polishes, edits files, attaches images, adds mermaid rendering — but can't fabricate experience. The session worked because that line stayed clear.

The actual flow went roughly like this. Set the role of each content type first — devlog, article, project page. Then sweep old posts: delete, keep, or rewrite. For posts needing real experience, interview first. Once a draft took shape, refine title, description, images, and links together. When writing hit a UI or rendering problem, fix it in the repo on the spot. Commit at the end of each batch, move to the next.

## Standards before editing

Didn't start editing right away. First defined what each post type should do. Devlogs stay tied to projects as progress records. Articles explain specific topics. Project pages stay short and dry like READMEs, with locked frontmatter and section order.

Setting standards early made later decisions fast. Rebundling Epoch: Unseen devlogs into per-project series, pulling Character Forge into a standalone article, deleting weak posts — all straightforward. Bulk-cleaning old Vulkan, AWS, LangChain, and DeepLearning posts happened because the criteria existed.

## Interview before drafting

The most-used technique was interviewing. When refining posts about OpenCode, FlyingCat, OpenClaw, Character Forge, or Harness-Monitor, Codex gathered material with a few short questions first. Why did you pick that tool, where did you hit limits, what tasks did you assign, how did it go.

Simple reason: sharply reduces fabrication risk. Posts grow from my short answers instead. FlyingCat came alive because the interview pulled out why I picked NANACA CRASH and how far I delegated to Antigravity + Gemini 3.0 Pro.

Using Codex for writing, the key isn't good sentences from it. It's extracting what I actually experienced.

## Writing and repo work in one loop

Blog writing isn't just prose. You move images, swap thumbnails, reconnect links, sometimes fix renderer code. This session was no different.

The Character Forge post needed a mermaid diagram. It rendered as a plain code block, so we added mermaid support to the MDX renderer. FlyingCat, Epoch: Unseen, and Harness-Monitor project pages got new thumbnails and copy. The home page got separated project and topic filters. When editing exposed a UI or rendering gap, we fixed it in the same repo, same session.

That mattered more than expected. Copy and site structure staying in sync in one repo meant "text is right but the page looks wrong" didn't linger.

## Skills that helped

A few clicked clearly:

- **technical-blog-writing** — Most helpful for structuring. Deciding if a post is a comparison, experiment record, or operations log, then keeping intro and conclusion aligned.
- **humanizer** — Polished text tends to stiffen into something that reads like a manual. This skill loosened it. Especially effective on short posts like project pages or old Unity/Unreal entries.
- **grammar-checker** — Final pass for typos, spacing, awkward phrasing. For technical writing, this last-mile polish matters more than you'd think.

Beyond skills, the recurring flow was: plan → read files → edit copy → move images → fix code if needed → review until the batch looks right. For a major blog overhaul, this loop fit well.

## Why it worked

Biggest win: momentum on a large cleanup. Dozens of mixed posts, deciding what to keep and what to cut — that first step is paralyzing. Working alongside Codex made it easy to start.

Editing content and structure together was also valuable. Devlog numbers, project links, tags, thumbnails, related-post hubs — touching elements beyond the text itself. That felt distinctly different from a sentence-generation tool. And Codex kept re-asking about criteria I'd forgotten — should this post be deleted, absorbed into a devlog, how much technical detail belongs on the project page. Short check-ins that locked direction.

## Delegation isn't autopilot

Left alone, Codex doesn't produce good posts. The biggest risk is experience-dependent sections. Judgment and intuition that come from doing the work — skip confirming those and the writing goes flat and AI-flavored fast.

Over-polishing is easy too. Structure holds but sentence rhythm flattens, every section opener reads like a model answer. I asked "make it sound human again" multiple times. Keeping project pages, articles, and devlogs in their lanes also mattered. Blur those boundaries and project pages get needlessly detailed while devlogs turn into grab bags.

## Editing partner, not ghostwriter

Codex is an editing partner that moves with you inside the repo, not a ghostwriter. Standards first, interview for experience, text edits and file work in one loop — strong combination.

Especially for blogs with backlogs. Clearest takeaway: a sustainable maintenance flow matters more than one great post.
