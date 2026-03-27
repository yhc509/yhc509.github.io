---
title: "I Tore Open a 48-Agent AI Game Studio"
date: "2026-03-28"
description: "Dissected a GitHub repo with 6,500 stars that runs a 'game studio' with 48 AI agents. The agent hierarchy was org chart cosplay. The real value was a single Hook script."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

I've tried splitting agents into an org structure myself. Review agent, coding agent, bug analysis agent. It didn't work. Passing work between agents wasted tokens and dropped context. I wasn't sure if I was doing it wrong or if the approach itself was broken.

Then I found Claude Code Game Studios on GitHub. 6,500 stars, 900 forks. "A studio where 48 AI agents build games." Does this actually work? I tore it open.

## The 48-Person Structure

Open the repo and there's no game code. Just agent definitions, skills, hooks, and rules inside `.claude/`. It's a template.

Three-tier agent hierarchy:

- **Director** x3 — Creative Director, Technical Director, Production Director. Opus model.
- **Lead** x8 — Game Designer, Engine Lead, AI Lead, etc. Sonnet model.
- **Specialist** x37 — Gameplay Programmer, Shader Artist, QA Tester, etc. Sonnet or Haiku model.

A real company org chart, copy-pasted.

## Org Chart Cosplay

The exact problems I ran into were right there. Just at a bigger scale.

Agents can't share state. Claude Code subagents start fresh every time. In a chain where Creative Director decides, Game Designer plans, and Gameplay Programmer codes — each agent has no idea what the previous one did. I already hit token waste and context loss with 2–3 agents. With 48, you can guess.

Org structure is overhead for a solo developer. Studios need Director-Lead-Specialist hierarchies to manage communication bottlenecks between people. When you're working alone, why do you need an escalation path?

And drawing artificial boundaries slows things down. They split Gameplay Programmer, Engine Programmer, and AI Programmer into separate agents, but in actual game code these three areas are tightly coupled. Switching between agents just piles on context-switching costs.

## Prompts Don't Differentiate Agent Roles

From my own experience: what actually separates agent roles isn't prompt instructions — it's activated skills and tool permissions.

Write "focus on bug analysis" in a prompt and there's no noticeable difference from a general-purpose agent. The agents I actually use well are the ones with a single narrow job. An agent that only resolves git merge conflicts. An agent that analyzes documents, breaks them apart, and reassembles them. Separation only means something when there's a clear role backed by matching tool permissions.

Game Studios differentiates all 48 agents with markdown prompts alone. No skill or permission differences. So what's actually different between "Creative Director" and "Technical Director"?

## The Model Assignments Are Backwards

This is where it really starts smelling like paint-by-numbers.

Directors get Opus. Specialists get Haiku. They copied the company hierarchy into model tiers instead of thinking about what each role actually needs.

Directors are supposed to "guard the vision" — in practice that's high-level judgment. A few lines of prompt cover it. Opus is overkill. Meanwhile the Specialists who actually write code get Haiku. Game programming needs complex logic, optimization, and engine API knowledge. Can Haiku produce solid game code?

Flip it. Judgment gets the lighter model. Coding gets the strongest.

## Is It All Useless Then?

No. Strip the 48 agents and the skeleton is decent.

Of the 37 skills, `/reverse-document` (backfill missing docs from existing code) and `/scope-check` (quantify how much scope has bloated) are genuinely useful for vibe coding cleanup.

Of the 8 hooks, `pre-compact.sh` (dump state before context compression) and `validate-commit.sh` (catch hardcoded values, validate JSON, enforce TODO format) work for any Claude Code project.

The 11 rules encode real game dev domain knowledge. No hot-path allocations, server authoritative, 2ms AI budget — rules that come from actual experience.

## gstack Was Different

Around the same time I looked at garrytan/gstack. Instead of agent hierarchies, it focuses on Hook and Skill systems.

`/careful` stood out. A PreToolUse Hook that blocks `rm -rf`, `DROP TABLE`, `force-push`, `reset --hard` at the system level. Writing "don't do this" in CLAUDE.md is a prompt-level constraint that can be bypassed. Hooks are airtight.

Ready to use out of the box.

The `/review` skill's Scope Drift Detection was also good. It compares diff changes against the original request to catch gaps between "what was asked" and "what was built." A structural mechanism for catching AI scope creep.

## Stars Are the Power of a Concept

Claude Code Game Studios got 6,500 stars because "48 AI agents building games" is a compelling concept. Not because 48 agents actually work together.

Adding agents is easy. One more markdown file. Making those agents actually share context and collaborate is structurally impossible in the current Claude Code architecture.

The star count reflects people's expectations. The direction — AI agents collaborating like an organization — is right. But right now there's no evidence it works.

The real value in the repo isn't the agents. It's the skills, hooks, and rules system. If you're taking notes, benchmark the `.claude/skills/`, `.claude/hooks/`, `.claude/rules/` structure — but consolidate agents down to 5–10 with clear roles and distinct tool permissions.
