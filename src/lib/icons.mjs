import fs from "fs";
import path from "path";

const MARKS_DIR = path.join(process.cwd(), "src/marks");
const LUCIDE_DIR = path.join(process.cwd(), "node_modules/lucide-static");

/** Official marks. `mono` icons use currentColor so light and dark follow the site theme. */
export const BRANDS = {
  grok: { label: "Grok", file: "grok.svg", mono: true, source: "https://grok.com/" },
  cursor: {
    label: "Cursor",
    file: "cursor.svg",
    mono: true,
    source: "https://cursor.com/brand",
  },
  x: {
    label: "X",
    file: "x.svg",
    mono: true,
    source: "https://commons.wikimedia.org/wiki/File:X_logo_2023.svg",
  },
  gemini: {
    label: "Gemini",
    file: "gemini.svg",
    mono: false,
    source:
      "https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg",
  },
  openai: {
    label: "OpenAI",
    file: "openai.svg",
    mono: true,
    source: "https://commons.wikimedia.org/wiki/File:OpenAI_logo_2025_(symbol).svg",
  },
  anthropic: {
    label: "Anthropic",
    file: "anthropic.svg",
    mono: true,
    source: "https://claude.com/",
  },
};

const ICON_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** @typedef {{ name: string, label: string | null, mono: boolean, stroke: boolean, svg: string }} MarkIconData */

/** @type {Map<string, MarkIconData>} */
const cache = new Map();

/**
 * Brand id, or a Lucide icon name such as `circle-check`.
 * @param {string} name
 * @returns {MarkIconData}
 */
export function loadIcon(name) {
  const key = String(name ?? "").trim();
  const cached = cache.get(key);
  if (cached) return cached;

  if (!ICON_NAME.test(key)) {
    throw new Error(`Unknown icon "${key}"`);
  }

  const brand = BRANDS[/** @type {keyof typeof BRANDS} */ (key)];
  const file = brand
    ? path.join(MARKS_DIR, brand.file)
    : path.join(LUCIDE_DIR, "icons", `${key}.svg`);

  if (!fs.existsSync(file)) {
    const brands = Object.keys(BRANDS).join(", ");
    throw new Error(`Unknown icon "${key}". Use a brand id (${brands}) or a Lucide icon name.`);
  }

  const icon = {
    name: key,
    label: brand ? brand.label : null,
    mono: brand ? brand.mono : true,
    stroke: !brand,
    svg: fs.readFileSync(file, "utf8"),
  };
  cache.set(key, icon);
  return icon;
}

/** @param {string} svg @param {string} prefix */
export function scopeSvgIds(svg, prefix) {
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  let out = svg;
  for (const id of ids.sort((a, b) => b.length - a.length)) {
    const next = `${prefix}-${id}`;
    out = out.replaceAll(`id="${id}"`, `id="${next}"`);
    out = out.replaceAll(`url(#${id})`, `url(#${next})`);
    out = out.replaceAll(`href="#${id}"`, `href="#${next}"`);
    out = out.replaceAll(`xlink:href="#${id}"`, `xlink:href="#${next}"`);
  }
  return out;
}

/** @param {string} attrs */
function viewBoxFromSize(attrs) {
  const width = Number(/width="([\d.]+)"/.exec(attrs)?.[1]);
  const height = Number(/height="([\d.]+)"/.exec(attrs)?.[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  return `0 0 ${width} ${height}`;
}

/** @param {string} svg */
export function splitSvg(svg) {
  const source = svg.replace(/<!--[\s\S]*?-->/g, "").trim();
  const open = /<svg\b([^>]*)>/.exec(source);
  if (!open) {
    throw new Error("Icon SVG has no root element");
  }
  const viewBox =
    /viewBox="([^"]+)"/.exec(open[1])?.[1] ??
    viewBoxFromSize(open[1]) ??
    "0 0 24 24";
  const inner = source.slice(open.index + open[0].length).replace(/<\/svg>\s*$/, "");
  return { viewBox, inner };
}
