import { existsSync, readFileSync } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { readSlideDecks } from "../src/lib/slides.mjs";

const outputRoot = path.join(process.cwd(), "public/slides-assets");
const fontDir = path.join(process.cwd(), "content/slides/theme/fonts");

function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(
      "Chrome is required to render slide thumbnails. Set CHROME_PATH or install google-chrome.",
    );
  }
  return found;
}

function hangulFaceCss() {
  const regularPath = path.join(fontDir, "NotoSansKR-Regular.woff2");
  const boldPath = path.join(fontDir, "NotoSansKR-Bold.woff2");
  const regular = readFileSync(regularPath);
  const bold = readFileSync(boldPath);
  const face = (weight, data) => {
    const encoded = data.toString("base64");
    return `@font-face{font-family:"Noto Sans KR";font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${encoded}) format("woff2");unicode-range:U+1100-11FF,U+3130-318F,U+A960-A97F,U+AC00-D7A3,U+D7B0-D7FF;}`;
  };
  return `${face(400, regular)}${face(700, bold)}`;
}

function thumbnailDocument(deck, faces) {
  const slide = deck.slides[0] ?? "";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${faces}
  html, body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #fff; }
  ${deck.css}
  .marpit { width: 1280px; height: 720px; }
  .marpit > svg { display: block; width: 1280px; height: 720px; }
</style>
</head>
<body><div class="marpit">${slide}</div></body>
</html>`;
}

async function paintHangul(page, deck) {
  const result = await page.evaluate(() => {
    const root = document.querySelector(".marpit");
    if (!root) {
      return { ok: false, reason: "missing slide root" };
    }
    for (const node of [root, ...root.querySelectorAll("*")]) {
      const family = getComputedStyle(node).fontFamily;
      if (!family.includes("Noto Sans KR")) {
        node.style.fontFamily = `"Noto Sans KR", ${family}`;
      }
    }
    return document.fonts.ready.then(async () => {
      const hangul = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/u;
      const samples = [];
      for (const node of root.querySelectorAll("*")) {
        for (const child of node.childNodes) {
          if (child.nodeType !== Node.TEXT_NODE || !hangul.test(child.textContent)) {
            continue;
          }
          const weight = Number.parseInt(getComputedStyle(node).fontWeight, 10) >= 600 ? 700 : 400;
          const font = `${weight} 64px "Noto Sans KR"`;
          for (const char of child.textContent) {
            if (hangul.test(char)) {
              samples.push({ char, font });
            }
          }
        }
      }
      if (samples.length === 0) {
        return { ok: true, checked: 0 };
      }
      await Promise.all(samples.map((sample) => document.fonts.load(sample.font)));
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const seen = new Set();
      let checked = 0;
      for (const sample of samples) {
        const key = `${sample.font}\n${sample.char}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        checked += 1;
        ctx.font = sample.font;
        const width = ctx.measureText(sample.char).width;
        const missing = ctx.measureText("\u0378").width;
        if (!(width > missing + 1)) {
          return { ok: false, char: sample.char, font: sample.font, checked };
        }
      }
      return { ok: true, checked };
    });
  });
  if (!result.ok) {
    const detail = result.char
      ? `U+${result.char.codePointAt(0).toString(16)} in ${result.font}`
      : result.reason;
    throw new Error(
      `${deck.slug} ${deck.lang} thumbnail drew Hangul as a missing glyph (${detail})`,
    );
  }
  return result.checked;
}

async function main() {
  const decks = readSlideDecks();
  if (decks.length === 0) {
    console.log("Generated 0 slide thumbnails");
    return;
  }

  const faces = hangulFaceCss();
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
    for (const deck of decks) {
      const destination = path.join(outputRoot, deck.slug, `thumb-${deck.lang}.webp`);
      await mkdir(path.dirname(destination), { recursive: true });
      await page.setContent(thumbnailDocument(deck, faces), { waitUntil: "load" });
      const checked = await paintHangul(page, deck);
      const png = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1280, height: 720 },
      });
      await sharp(png).webp({ quality: 82 }).toFile(destination);
      console.log(`${deck.slug} ${deck.lang}: ${checked} Hangul glyphs checked`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Generated ${decks.length} slide thumbnails`);
}

main().catch((error) => {
  console.error("Failed to generate slide thumbnails.");
  console.error(error);
  process.exit(1);
});
