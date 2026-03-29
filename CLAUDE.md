# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Korean-language personal dev blog (yhc509) built with Next.js 16, MDX, TypeScript, and Tailwind CSS v4. Statically exported to GitHub Pages.

## Common Commands

```bash
npm run dev      # Start dev server (runs sync-post-assets first)
npm run build    # Production build → static export to out/
npm run lint     # ESLint
npm run preview  # Serve the out/ directory locally
```

No test framework is configured.

## Architecture

**Static export site** (`output: "export"` in next.config.ts) — all pages are statically generated at build time.

### Content System

Two content types live in `content/`:
- **Posts** (`content/posts/<category>/<slug>.md`) — blog posts with YAML frontmatter. Supports nested directory structure; the directory path becomes part of the slug (e.g., `agentic/harness-monitor`).
- **Projects** (`content/projects/<slug>.md`) — project showcase pages. Public projects require `role`, exactly 3 `highlights`, and at least one `links` entry.

Both use `open: true/false` frontmatter to control visibility (default true for posts, must be explicit for projects).

Posts support `type: article | devlog | archive_candidate` and optional `project` / `series` fields to link posts to projects.

### Post Asset Pipeline

Images/videos placed alongside markdown files in `content/posts/` are copied to `public/posts-images/` by `scripts/sync-post-assets.mjs` (runs automatically as `predev`/`prebuild` hook). A custom remark plugin (`src/lib/postAssets.ts`) rewrites relative asset paths in MDX to point to `/posts-images/`.

### Key Libraries

- `next-mdx-remote/rsc` for server-side MDX rendering (not `@next/mdx` compile-time)
- `gray-matter` for frontmatter parsing
- `remark-gfm` for GitHub Flavored Markdown
- Mermaid diagrams via client-side `MermaidDiagram` component
- `reading-time` for estimated read time

### Routing

| Route | Source |
|---|---|
| `/` | Home with tag/project filters (`BlogHome` client component) |
| `/posts/[...slug]` | Catch-all for nested post slugs |
| `/projects` | Project listing |
| `/projects/[slug]` | Individual project page with related posts |
| `/about` | About page |

### Styling

CSS custom properties (not Tailwind theme tokens) for theming — light/dark mode toggled via `data-theme` attribute on `<html>`. Font: Hahmlet (serif). Colors defined in `src/app/globals.css`.

### Tags

Tags support hierarchical paths with `/` separator (e.g., `AI/AgenticCoding`). `buildTagTree()` constructs a tree structure for the filter UI. Tag filtering matches both exact and prefix (parent tags include child posts).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`): lint → build → deploy to GitHub Pages. Deploys only on push to `main`. PRs run build check only.
