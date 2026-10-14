import fs from "fs";
import path from "path";
import satori from "satori";
import sharp from "sharp";
import { NEWS_DIR, NEWS_IMAGE_DIR, newsItemImagePath, newsOgPath, readNewsIssues } from "../src/lib/newsIssues.mjs";

const WIDTH = 1200;
const HEIGHT = 630;
const fontData = fs.readFileSync(path.join(process.cwd(), "public/fonts/Hahmlet-Bold.ttf"));

/** `**word**` marks the highlighted keyword. @param {string} label */
function labelSpans(label) {
  return label
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => {
      const highlighted = part.startsWith("**") && part.endsWith("**");
      return {
        type: "span",
        props: {
          style: { color: highlighted ? "#facc15" : "#ffffff", whiteSpace: "pre" },
          children: highlighted ? part.slice(2, -2) : part,
        },
      };
    });
}

/** Transparent overlay: badge + headline in the top band, clear of the logo card. */
async function renderOverlay(label, issueNumber) {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 56,
          fontFamily: "Hahmlet",
          fontWeight: 700,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontSize: 22,
                color: "#0b1220",
                background: "#facc15",
                borderRadius: 999,
                padding: "6px 18px",
                marginBottom: 22,
              },
              children: `AI News #${issueNumber}`,
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", fontSize: 72, lineHeight: 1.1, letterSpacing: -1 },
              children: labelSpans(label),
            },
          },
        ],
      },
    },
    { width: WIDTH, height: HEIGHT, fonts: [{ name: "Hahmlet", data: fontData, weight: 700, style: "normal" }] }
  );
  return Buffer.from(svg);
}

function copyNewsImageDir() {
  const targetDir = path.join(process.cwd(), "public", "news-img");
  fs.mkdirSync(targetDir, { recursive: true });
  if (!fs.existsSync(NEWS_IMAGE_DIR)) return;
  for (const name of fs.readdirSync(NEWS_IMAGE_DIR)) {
    const from = path.join(NEWS_IMAGE_DIR, name);
    if (!fs.statSync(from).isFile()) continue;
    fs.copyFileSync(from, path.join(targetDir, name));
  }
}

async function main() {
  copyNewsImageDir();
  let count = 0;
  for (const language of /** @type {const} */ (["en", "ko"])) {
    for (const issue of readNewsIssues(language, { includeHidden: true })) {
      for (const item of issue.items) {
        if (!item.image) continue;
        const imageTarget = path.join(process.cwd(), "public", newsItemImagePath(item.image));
        fs.mkdirSync(path.dirname(imageTarget), { recursive: true });
        fs.copyFileSync(path.join(NEWS_IMAGE_DIR, item.image), imageTarget);
      }
      if (!issue.thumbnailBase) continue;
      const target = path.join(process.cwd(), "public", newsOgPath(issue.id, issue.thumbnailLanguage));
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const base = sharp(path.join(NEWS_IMAGE_DIR, issue.thumbnailBase)).resize(WIDTH, HEIGHT, { fit: "cover" });
      if (issue.thumbnailLabel) {
        base.composite([{ input: await renderOverlay(issue.thumbnailLabel, issue.issue) }]);
      }
      await base.png().toFile(target);
      count += 1;
    }
  }
  console.log(`Generated ${count} news thumbnails from ${path.relative(process.cwd(), NEWS_DIR)}`);
}

main().catch((error) => {
  console.error("Failed to generate news thumbnails.");
  console.error(error);
  process.exit(1);
});
