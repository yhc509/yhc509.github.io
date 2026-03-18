# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 blog with MDX support, TypeScript, and Tailwind CSS v4.

## Common Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (lists all posts)
│   ├── globals.css             # Tailwind CSS with typography plugin
│   └── posts/[slug]/page.tsx   # Dynamic post pages
└── lib/
    └── posts.ts                # Post fetching utilities
content/
└── posts/                      # MDX blog posts with frontmatter
mdx-components.tsx              # MDX component customization
next.config.ts                  # Next.js + MDX configuration
```

## Key Patterns

- Blog posts are MDX files in `content/posts/` with YAML frontmatter (title, date, description)
- `src/lib/posts.ts` exports `getAllPosts()` and `getPostBySlug()` for content fetching
- Posts use `gray-matter` for frontmatter parsing and `next-mdx-remote/rsc` for rendering
- Static generation via `generateStaticParams` and `generateMetadata` in post pages
