import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { readSlideDecks } from "../src/lib/slides.mjs";

const outputRoot = path.join(process.cwd(), "public/slides-assets");

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

function thumbnailDocument(deck) {
  const slide = deck.slides[0] ?? "";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: 1280px; height: 720px; overflow: hidden; background: #fff; }
  ${deck.css}
  .marpit { width: 1280px; height: 720px; }
  .marpit > svg { display: block; width: 1280px; height: 720px; }
</style>
</head>
<body><div class="marpit">${slide}</div></body>
</html>`;
}

async function main() {
  const decks = readSlideDecks();
  if (decks.length === 0) {
    console.log("Generated 0 slide thumbnails");
    return;
  }

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
      await page.setContent(thumbnailDocument(deck), { waitUntil: "load" });
      const png = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 1280, height: 720 },
      });
      await sharp(png).webp({ quality: 82 }).toFile(destination);
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
