import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { endOfSeoulDay } from "../src/lib/contentDates.mjs";
import { readNewsIssues } from "../src/lib/newsIssues.mjs";
import { readSlideDecks } from "../src/lib/slides.mjs";

const SITE_URL = "https://kinkeep.dev";
const POSTS_DIR = path.join(process.cwd(), "content/posts");
const LLMS_PATH = path.join(process.cwd(), "public/llms.txt");
const FULL_PATH = path.join(process.cwd(), "public/llms-full.txt");

function dateString(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 10);
  }

  return "";
}

function isPublishable(date) {
  return Boolean(date) && new Date(date) <= endOfSeoulDay();
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function readMarkdown(filePath) {
  const source = matter(await fs.readFile(filePath, "utf8"));
  return {
    data: source.data,
    content: source.content.trim(),
  };
}

async function posts() {
  const files = (await walk(POSTS_DIR)).filter((filePath) => /\.mdx?$/.test(filePath));
  const slugs = [
    ...new Set(
      files.map((filePath) =>
        path.relative(POSTS_DIR, filePath).replace(/\.mdx?$/, "").replace(/-en$/, ""),
      ),
    ),
  ];

  const parsed = [];
  for (const slug of slugs) {
      const koreanPath = files.find((filePath) => filePath.endsWith(`${path.sep}${slug}.md`) || filePath.endsWith(`${path.sep}${slug}.mdx`));
      const englishPath = files.find(
        (filePath) =>
          filePath.endsWith(`${path.sep}${slug}-en.md`) || filePath.endsWith(`${path.sep}${slug}-en.mdx`),
      );
      if (!koreanPath && !englishPath) {
        continue;
      }

      if (!koreanPath) {
        const english = await readMarkdown(englishPath);
        if (english.data.open === false || !isPublishable(dateString(english.data.date))) {
          continue;
        }

        parsed.push({
          slug,
          title: String(english.data.title || slug),
          date: dateString(english.data.date),
          description: String(english.data.description || "").replace(/\s+/g, " ").trim(),
          body: english.content,
          koreanOnly: false,
          englishOnly: true,
        });
        continue;
      }

      const korean = await readMarkdown(koreanPath);
      if (korean.data.open === false || !isPublishable(dateString(korean.data.date))) {
        continue;
      }

      const english = englishPath ? await readMarkdown(englishPath) : null;
      const source = english ?? korean;
      parsed.push({
        slug,
        title: String(source.data.title || slug),
        date: dateString(source.data.date || korean.data.date),
        description: String(source.data.description || "").replace(/\s+/g, " ").trim(),
        body: source.content,
        koreanOnly: !english,
        englishOnly: false,
      });
    }

  return parsed.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function slideDecks() {
  /** @type {Map<string, { slug: string, ko: object | null, en: object | null }>} */
  const groups = new Map();
  for (const deck of readSlideDecks()) {
    const group = groups.get(deck.slug) ?? { slug: deck.slug, ko: null, en: null };
    group[deck.lang] = deck;
    groups.set(deck.slug, group);
  }
  return [...groups.values()].map((group) => {
    const primary = group.en ?? group.ko;
    return {
      slug: group.slug,
      title: primary.title,
      date: primary.date,
      description: primary.description.replace(/\s+/g, " ").trim(),
      slideCount: primary.slideCount,
      koreanOnly: group.en == null,
    };
  });
}

function newsIssues() {
  return readNewsIssues("en").map((issue) => ({
    id: issue.id,
    title: issue.title,
    date: issue.date,
    description: issue.description.replace(/\s+/g, " ").trim(),
    body: issue.content.trim(),
    koreanOnly: issue.missingEnglish,
  }));
}

function section(title, lines) {
  return [`## ${title}`, "", ...lines, ""].join("\n");
}

function entry(title, url, lines) {
  return [`### ${title}`, "", url, "", ...lines, ""].join("\n");
}

async function assertLlmsLinks(publishedPosts) {
  const llms = await fs.readFile(LLMS_PATH, "utf8");
  const slugs = new Set(publishedPosts.map((post) => post.slug));
  const urls = [...llms.matchAll(/https:\/\/kinkeep\.dev(\/[^)\s]*)/g)].map((match) => match[1]);
  const missing = urls.filter((urlPath) => {
    const postMatch = urlPath.match(/^\/(?:ko\/)?posts\/(.+)$/);
    if (!postMatch) {
      return false;
    }
    return !slugs.has(postMatch[1]);
  });

  if (missing.length > 0) {
    throw new Error(`llms.txt links missing content: ${missing.join(", ")}`);
  }
}

const publishedPosts = await posts();
const issues = await newsIssues();
const decks = slideDecks();
await assertLlmsLinks(publishedPosts);

const full = [
  "# kinkeep.dev",
  "",
  "> Notes on game engines, graphics, agentic coding, and harness engineering from a Unity client programmer.",
  "",
  "English URLs are primary. Korean pages live under /ko.",
  "",
  "News is published on Tuesday and Thursday.",
  "",
  section("Key pages", [
    `- About: ${SITE_URL}/about (Korean: ${SITE_URL}/ko/about)`,
    `- AI News: ${SITE_URL}/news (Korean: ${SITE_URL}/ko/news)`,
    `- Slides: ${SITE_URL}/slides (Korean: ${SITE_URL}/ko/slides)`,
  ]),
  ...decks.map((deck) =>
    entry(deck.title, deck.koreanOnly ? `${SITE_URL}/ko/slides/${deck.slug}` : `${SITE_URL}/slides/${deck.slug}`, [
      `Date: ${deck.date}`,
      `Slides: ${deck.slideCount}`,
      deck.koreanOnly
        ? `English list omits this deck. Korean: ${SITE_URL}/ko/slides/${deck.slug}`
        : `Korean: ${SITE_URL}/ko/slides/${deck.slug}`,
      deck.koreanOnly ? "Language: Korean only" : "Language: English and Korean",
      "",
      deck.description,
    ]),
  ),
  ...issues.map((issue) =>
    entry(issue.title, `${SITE_URL}/news/${issue.id}`, [
      `Date: ${issue.date}`,
      `Korean: ${SITE_URL}/ko/news/${issue.id}`,
      issue.koreanOnly ? "Language: Korean only" : "Language: English",
      "",
      issue.description,
      "",
      issue.body,
    ]),
  ),
  ...publishedPosts.map((post) =>
    entry(post.title, `${SITE_URL}/posts/${post.slug}`, [
      `Date: ${post.date}`,
      ...(post.englishOnly
        ? ["Language: English only"]
        : [
            `Korean: ${SITE_URL}/ko/posts/${post.slug}`,
            post.koreanOnly ? "Language: Korean only" : "Language: English",
          ]),
      "",
      post.description,
      "",
      post.body,
    ]),
  ),
].join("\n");

await fs.writeFile(FULL_PATH, `${full.trim()}\n`, "utf8");
console.log(
  `Generated llms-full.txt with ${publishedPosts.length} posts, ${issues.length} news issues, and ${decks.length} slide decks`,
);
