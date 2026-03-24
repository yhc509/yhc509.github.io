---
title: "OnceWrite"
date: "2026-03-24"
description: "Paste one blog post, get content for five social platforms. A content repurposing tool for solo devs who don't know social media."
thumbnail: "/images/projects/once-write.png"
tags:
  - "SaaS"
open: true
role: "Product design, prompt pipeline design, infra setup (code delegated to Codex)"
highlights:
  - "Converts a blog post into Twitter, Reddit, Threads, Instagram, and Bluesky content"
  - "Each platform has a built-in tone, no manual selection needed"
  - "Three-stage pipeline (analyze → generate → verify) for consistent quality"
links:
  demo: "https://once-write.vercel.app/"
---

Writing one blog post already costs energy. Rewriting the same thing in a different tone for each platform? Not happening. So I built this.

Paste a post and get five versions: Twitter thread, Reddit post, Threads post, Instagram caption, Bluesky post. Each platform has its own tone. Twitter gets bold, Bluesky gets quiet confidence, Reddit gets honest and humble. No manual tone selection needed.

Ten credits per day, one credit per platform conversion. Credits refill on login.

Stack is Next.js + Clerk + LemonSqueezy + Supabase + Claude API.
