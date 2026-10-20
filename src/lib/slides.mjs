import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marp } from "@marp-team/marp-core";

export const SLIDES_DIR = path.join(process.cwd(), "content/slides");
export const THEME_FILE = path.join(SLIDES_DIR, "theme/presentation.css");
export const SLIDES_ASSET_PREFIX = "/slides-assets";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RASTER_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const SKIP_ASSET_EXTENSIONS = new Set([".md", ".mdx", ".pdf"]);

/** @type {Map<string, object[]>} */
const cache = new Map();
/** @type {Marp | null} */
let marp = null;

export function includeDraftDecks() {
  return process.env.SHOW_DRAFTS === "1";
}

export function clearSlideCache() {
  cache.clear();
}

/** @param {string} slug */
function assertSlug(slug) {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `content/slides/${slug}: slug must be lowercase letters, numbers, and hyphens`,
    );
  }
}

/**
 * @param {string} relativePath path inside the deck folder, using forward slashes
 * @returns {string}
 */
export function assetOutputName(relativePath) {
  const cleaned = relativePath.replace(/^\.\//, "").replace(/^\/+/, "").split(path.sep).join("/");
  const ext = path.posix.extname(cleaned).toLowerCase();
  if (!RASTER_EXTENSIONS.has(ext)) {
    return cleaned;
  }
  return `${cleaned.slice(0, -ext.length)}.webp`;
}

/**
 * Public URL for a markdown path such as `img/photo.png`.
 * @param {string} slug
 * @param {string} rawPath
 */
export function deckAssetUrl(slug, rawPath) {
  const output = assetOutputName(rawPath);
  const encoded = [slug, ...output.split("/")].map((part) => encodeURIComponent(part)).join("/");
  return `${SLIDES_ASSET_PREFIX}/${encoded}`;
}

/**
 * Marp scopes almost every rule to `div.marpit`. The print rule for `html, body` does not.
 * Point that one at the deck root so it cannot restyle the site.
 * @param {string} css
 */
export function scopeMarpCss(css) {
  return css.replace(/(^|[{}])(\s*)html\s*,\s*body\b/g, "$1$2div.marpit");
}

/** @param {string} css */
export function marpCssIsScoped(css) {
  if (/html\s*,\s*body\b/.test(css)) {
    return false;
  }
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim());
  return selectors.every((selector) => {
    if (
      selector === "" ||
      selector.startsWith("@") ||
      selector.startsWith("/*") ||
      selector === "from" ||
      selector === "to" ||
      /^\d+%$/.test(selector)
    ) {
      return true;
    }
    return selector.includes(".marpit");
  });
}

/** @param {string} html */
export function stripSlideScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

/**
 * Split a Marp inline-SVG render into one string per slide.
 * Nested `<svg>` inside a slide (author HTML) stays inside that slide.
 * @param {string} html
 * @returns {string[]}
 */
export function splitMarpSlides(html) {
  const cleaned = stripSlideScripts(html);
  /** @type {string[]} */
  const slides = [];
  let search = 0;
  while (search < cleaned.length) {
    const start = cleaned.indexOf("<svg", search);
    if (start === -1) {
      break;
    }
    const tagEnd = cleaned.indexOf(">", start);
    if (tagEnd === -1) {
      break;
    }
    const openTag = cleaned.slice(start, tagEnd + 1);
    if (!openTag.includes("data-marpit-svg")) {
      search = tagEnd + 1;
      continue;
    }
    let depth = 1;
    let index = tagEnd + 1;
    while (index < cleaned.length && depth > 0) {
      const nextOpen = cleaned.indexOf("<svg", index);
      const nextClose = cleaned.indexOf("</svg>", index);
      if (nextClose === -1) {
        break;
      }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        index = nextOpen + 4;
      } else {
        depth -= 1;
        index = nextClose + "</svg>".length;
      }
    }
    slides.push(cleaned.slice(start, index));
    search = index;
  }
  return slides;
}

/**
 * Offscreen slides should not pull images or video until they are shown.
 * @param {string} svg
 */
export function prepareSlideMedia(svg) {
  const withImages = svg.replace(/<img\b([^>]*?)>/gi, (_, attrs) => {
    let next = attrs;
    if (!/\bloading\s*=/i.test(next)) {
      next += ' loading="lazy"';
    }
    if (!/\bdecoding\s*=/i.test(next)) {
      next += ' decoding="async"';
    }
    return `<img${next}>`;
  });
  return withImages.replace(/<video\b([^>]*)>/gi, (_, attrs) => {
    let next = attrs;
    const autoplay = /\bautoplay\b/i.test(next);
    next = next.replace(/\sautoplay(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, "");
    next = next.replace(/\spreload\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    if (autoplay && !/\bdata-autoplay\s*=/i.test(next)) {
      next += ' data-autoplay="true"';
    }
    next += ' preload="none"';
    return `<video${next}>`;
  });
}

/**
 * @param {string} html
 * @param {string} slug
 */
export function rewriteDeckAssets(html, slug) {
  return html.replace(
    /(\s(?:src|poster)\s*=\s*)(["'])(?:\.\/)?(img\/[^"']+)\2/gi,
    (_, prefix, quote, rel) => `${prefix}${quote}${deckAssetUrl(slug, rel)}${quote}`,
  );
}

function getMarp() {
  if (!marp) {
    if (!fs.existsSync(THEME_FILE)) {
      throw new Error("content/slides/theme/presentation.css is missing");
    }
    const themeCss = fs.readFileSync(THEME_FILE, "utf8");
    marp = new Marp({ html: true, minifyCSS: true });
    marp.themeSet.default = marp.themeSet.add(themeCss);
  }
  return marp;
}

/**
 * @param {unknown} value
 * @param {string} file
 */
function readDate(value, file) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const yyyy = value.getUTCFullYear();
    const mm = String(value.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(value.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  throw new Error(`${file}: date must be YYYY-MM-DD`);
}

/**
 * @param {Record<string, unknown>} data
 * @param {string} file
 * @param {string} slug
 */
export function parseDeckFields(data, file, slug) {
  if (data.marp !== true) {
    throw new Error(`${file}: marp must be true`);
  }
  if (data.theme !== "presentation") {
    throw new Error(`${file}: theme must be presentation`);
  }
  if (String(data.size ?? "") !== "16:9") {
    throw new Error(`${file}: size must be 16:9`);
  }
  if (typeof data.title !== "string" || data.title.trim() === "") {
    throw new Error(`${file}: title must be a non-empty string`);
  }
  if (typeof data.description !== "string" || data.description.trim() === "") {
    throw new Error(`${file}: description must be a non-empty string`);
  }
  if (data.lang !== "ko" && data.lang !== "en") {
    throw new Error(`${file}: lang must be ko or en`);
  }
  if (data.draft != null && typeof data.draft !== "boolean") {
    throw new Error(`${file}: draft must be true or false`);
  }

  return {
    slug,
    title: data.title.trim(),
    date: readDate(data.date, file),
    description: data.description.trim(),
    lang: /** @type {"ko" | "en"} */ (data.lang),
    draft: data.draft === true,
  };
}

/**
 * @param {string} filePath
 * @param {string} slug
 */
export function readDeckSource(filePath, slug) {
  const file = path.relative(process.cwd(), filePath);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const fields = parseDeckFields(parsed.data, file, slug);
  return {
    ...fields,
    filePath,
    markdown: raw,
  };
}

/**
 * @param {string} markdown
 * @param {string} slug
 * @param {string} file
 */
export function renderDeckMarkdown(markdown, slug, file) {
  const { html, css } = getMarp().render(markdown);
  const scoped = scopeMarpCss(css);
  if (!marpCssIsScoped(scoped)) {
    throw new Error(`${file}: Marp CSS is not scoped to div.marpit`);
  }
  const slides = splitMarpSlides(html).map((slide) =>
    prepareSlideMedia(rewriteDeckAssets(slide, slug)),
  );
  if (slides.length === 0) {
    throw new Error(`${file}: rendered no slides`);
  }
  return { slides, css: scoped };
}

export function listDeckFiles() {
  if (!fs.existsSync(SLIDES_DIR)) {
    return [];
  }
  return fs
    .readdirSync(SLIDES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "theme")
    .map((entry) => {
      const slug = entry.name;
      assertSlug(slug);
      const filePath = path.join(SLIDES_DIR, slug, `${slug}.md`);
      if (!fs.existsSync(filePath)) {
        throw new Error(`content/slides/${slug}/${slug}.md is missing`);
      }
      return { slug, filePath };
    });
}

/**
 * @param {{ includeDrafts?: boolean }} [options]
 */
export function readSlideDecks({ includeDrafts = includeDraftDecks() } = {}) {
  const key = includeDrafts ? "drafts" : "published";
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const decks = listDeckFiles()
    .map(({ slug, filePath }) => {
      const source = readDeckSource(filePath, slug);
      if (source.draft && !includeDrafts) {
        return null;
      }
      const file = path.relative(process.cwd(), filePath);
      const rendered = renderDeckMarkdown(source.markdown, slug, file);
      return {
        slug: source.slug,
        title: source.title,
        date: source.date,
        description: source.description,
        lang: source.lang,
        draft: source.draft,
        slides: rendered.slides,
        css: rendered.css,
        slideCount: rendered.slides.length,
      };
    })
    .filter((deck) => deck !== null)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  cache.set(key, decks);
  return decks;
}

/**
 * @param {"ko" | "en"} language
 * @param {ReturnType<typeof readSlideDecks>} [decks]
 */
export function decksForLanguage(language, decks = readSlideDecks()) {
  return decks.filter((deck) => deck.lang === language);
}

/**
 * Files under a deck folder that the sync script should copy.
 * Draft decks are omitted unless SHOW_DRAFTS=1 or includeDrafts is set.
 * @param {{ includeDrafts?: boolean }} [options]
 */
export function listDeckAssetFiles({ includeDrafts = includeDraftDecks() } = {}) {
  /** @type {{ slug: string, sourcePath: string, relativePath: string }[]} */
  const files = [];
  for (const { slug, filePath } of listDeckFiles()) {
    const source = readDeckSource(filePath, slug);
    if (source.draft && !includeDrafts) {
      continue;
    }
    const deckDir = path.dirname(filePath);
    walkAssets(deckDir, deckDir, slug, files);
  }
  return files;
}

/**
 * @param {string} dir
 * @param {string} deckDir
 * @param {string} slug
 * @param {{ slug: string, sourcePath: string, relativePath: string }[]} files
 */
function walkAssets(dir, deckDir, slug, files) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAssets(fullPath, deckDir, slug, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (SKIP_ASSET_EXTENSIONS.has(ext)) {
      continue;
    }
    files.push({
      slug,
      sourcePath: fullPath,
      relativePath: path.relative(deckDir, fullPath).split(path.sep).join("/"),
    });
  }
}
