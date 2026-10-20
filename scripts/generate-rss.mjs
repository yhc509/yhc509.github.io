import { promises as fs } from "fs";
import path from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createPostAssetRemarkPlugin, resolvePostAssetSrc } from "../src/lib/postAssets.mjs";

const SITE_URL = "https://kinkeep.dev";
const SITE_TITLE = "kinkeep.dev";
const SITE_DESCRIPTION =
  "Notes on game engines, graphics, agentic coding, and harness engineering from a Unity client programmer.";
const SITE_LANGUAGE = "en";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUTPUT_PATH = path.join(process.cwd(), "public/feed.xml");
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapCdata(value) {
  return `<![CDATA[${String(value).replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

function readOptionalString(value) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function readStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function toAbsoluteUrl(value) {
  if (!value) {
    return undefined;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  return new URL(value, SITE_URL).toString();
}

async function getMarkdownFiles(dir) {
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getMarkdownFiles(fullPath)));
      continue;
    }

    if (MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

async function renderPostContent(content, postDir) {
  const components = {
    a: (props) =>
      createElement("a", { ...props, href: toAbsoluteUrl(props.href) }, props.children),
    img: (props) =>
      createElement("img", {
        ...props,
        src: toAbsoluteUrl(
          resolvePostAssetSrc(
            typeof props.src === "string" ? props.src : undefined,
            postDir
          )
        ),
        alt: props.alt || "",
      }),
    video: (props) =>
      createElement(
        "video",
        {
          ...props,
          src: toAbsoluteUrl(
            resolvePostAssetSrc(
              typeof props.src === "string" ? props.src : undefined,
              postDir
            )
          ),
          poster: toAbsoluteUrl(
            resolvePostAssetSrc(
              typeof props.poster === "string" ? props.poster : undefined,
              postDir
            )
          ),
        },
        props.children
      ),
    source: (props) =>
      createElement("source", {
        ...props,
        src: toAbsoluteUrl(
          resolvePostAssetSrc(
            typeof props.src === "string" ? props.src : undefined,
            postDir
          )
        ),
      }),
  };

  const { content: compiledContent } = await compileMDX({
    source: content,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, createPostAssetRemarkPlugin(postDir)],
      },
    },
  });

  return renderToStaticMarkup(compiledContent);
}

function isEnglishVariant(filePath) {
  return /-en\.(md|mdx)$/i.test(filePath);
}

function canonicalSlug(filePath) {
  const relativePath = path.relative(POSTS_DIR, filePath);
  return relativePath.replace(/\.(md|mdx)$/i, "").replace(/-en$/, "");
}

async function readPostItem(filePath, slug = canonicalSlug(filePath)) {
  const source = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(source);

  if (data.open === false) {
    return null;
  }

  const postDir = path.dirname(slug) === "." ? "" : path.dirname(slug);
  const date = normalizeDate(data.date);
  const link = new URL(`/posts/${slug}`, SITE_URL).toString();
  const html = await renderPostContent(content, postDir);

  return {
    title: readOptionalString(data.title) || slug,
    description: readOptionalString(data.description) || "",
    date,
    link,
    guid: link,
    tags: readStringArray(data.tags ?? data.categories),
    html,
  };
}

function buildItemXml(item) {
  const categoriesXml = item.tags
    .map((tag) => `    <category>${escapeXml(tag)}</category>`)
    .join("\n");

  return [
    "  <item>",
    `    <title>${escapeXml(item.title)}</title>`,
    `    <link>${escapeXml(item.link)}</link>`,
    `    <guid isPermaLink="true">${escapeXml(item.guid)}</guid>`,
    `    <pubDate>${escapeXml(item.date.toUTCString())}</pubDate>`,
    `    <description>${escapeXml(item.description)}</description>`,
    categoriesXml,
    `    <content:encoded>${wrapCdata(item.html)}</content:encoded>`,
    "  </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const files = await getMarkdownFiles(POSTS_DIR);
  const groups = new Map();

  for (const filePath of files) {
    const slug = canonicalSlug(filePath);
    const group = groups.get(slug) ?? {};
    if (isEnglishVariant(filePath)) {
      group.en = filePath;
    } else {
      group.ko = filePath;
    }
    groups.set(slug, group);
  }

  const posts = (
    await Promise.all(
      Array.from(groups.entries()).map(async ([slug, group]) => {
        const source = group.en ?? group.ko;
        if (!source) {
          return null;
        }

        return readPostItem(source, slug);
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => {
      const timeDiff = b.date.getTime() - a.date.getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }

      return a.title.localeCompare(b.title, "en");
    });

  const latestDate = posts[0]?.date ?? new Date();
  const itemsXml = posts.map((post) => buildItemXml(post)).join("\n");
  const feedXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"',
    '  xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    '  xmlns:atom="http://www.w3.org/2005/Atom"',
    ">",
    "  <channel>",
    `    <title>${escapeXml(SITE_TITLE)}</title>`,
    `    <link>${escapeXml(SITE_URL)}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    `    <language>${escapeXml(SITE_LANGUAGE)}</language>`,
    `    <lastBuildDate>${escapeXml(latestDate.toUTCString())}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(new URL("/feed.xml", SITE_URL).toString())}" rel="self" type="application/rss+xml" />`,
    itemsXml,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, feedXml, "utf8");

  console.log(`Generated RSS feed with ${posts.length} posts at ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
