---
title: "Why I Switched from github.io to a Custom Domain"
date: "2026-04-21"
description: "A month after launching my blog, not a single post was indexed by Google. Tracing the root cause led me to the github.io domain itself. After buying kinkeep.dev and connecting it, even sitemap processing changed immediately."
categories: ["AI/AgenticCoding"]
open: true
type: article
---

A month after launching my blog, nothing showed up on Google.

The homepage was indexed. But with over 30 posts live, Google didn't know about a single one. Running URL Inspection on each returned "URL is unknown to Google" across the board. They weren't even discovered.

## What Was Wrong

I first suspected technical issues. Bad sitemap? Blocking robots.txt? Missing structured data? I checked everything — all clean. The sitemap was accessible with valid XML, robots.txt was wide open with `Allow: /`, and JSON-LD had full BlogPosting schema.

The problem was the sitemap — specifically, Google wasn't processing it. In Search Console, the sitemap status showed `isPending: true` five days after submission. Google received it and never opened it.

The homepage got indexed not through the sitemap, but because a link from the GitHub repository page led Google to discover it by accident.

## Why github.io Is Disadvantaged

`yhc509.github.io` is a shared GitHub Pages domain. Millions of subdomains exist under github.io, most of them abandoned project pages or README mirrors. From Google's perspective, there's little reason to allocate significant crawl budget to these domains.

A custom domain wins in three ways:

1. **Independent domain authority** — you build trust on your own domain instead of renting space under GitHub's
2. **Crawl priority** — crawlers are more aggressive with independent domains than shared ones
3. **Long-term flexibility** — the domain stays yours even if you leave GitHub Pages

## Choosing and Buying

I went with **Cloudflare Registrar**. The reason is simple: they sell at cost, so renewal prices don't inflate. Other registrars often offer cheap first-year pricing then jack up renewals. Cloudflare doesn't play that game, and DNS config lives in the same dashboard.

I picked `kinkeep.dev`. The `.dev` TLD enforces HTTPS and fits a dev blog well. It costs $12.20/year.

## The Setup

Connecting a custom domain to GitHub Pages is straightforward.

**DNS** — Add four A records in Cloudflare pointing to GitHub Pages server IPs for load balancing. Proxy must be off (DNS only) because GitHub Pages handles its own TLS — Cloudflare's proxy would cause certificate conflicts.

**Code changes** — Every hardcoded site URL needs updating. In my case, three places:
- The site base URL config
- The RSS feed generation script
- The GitHub Actions build environment variable

Plus a `public/CNAME` file containing the domain name. GitHub Pages reads this to recognize the custom domain.

**GitHub settings** — Repository Settings → Pages → Custom domain. Enter the domain, done. HTTPS certificates are auto-provisioned via Let's Encrypt.

## Results

After connecting the domain, I registered a new property in Google Search Console and submitted the sitemap. The difference was immediate.

On github.io, the sitemap stayed `isPending` for five days. On kinkeep.dev, it was **processed instantly**. Same content, same sitemap structure — only the domain changed.

All 37 URLs submitted via the Indexing API succeeded as well. I'll need to check actual indexing results in a few days, but the starting point is already different.

## Cost vs. Impact

This is the most reliable SEO investment you can make for ~$12/year. If you're running a blog on GitHub Pages and struggling with Google indexing, try connecting a custom domain before touching any code.

The old domain `yhc509.github.io` automatically redirects to `kinkeep.dev`, so previously shared links won't break.
