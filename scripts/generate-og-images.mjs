import fs from "fs";
import path from "path";
import { createElement } from "react";
import matter from "gray-matter";
import satori from "satori";
import sharp from "sharp";

const postsDir = path.join(process.cwd(), "content/posts");
const projectsDir = path.join(process.cwd(), "content/projects");
const outputDir = path.join(process.cwd(), "public/og");
const fontPath = path.join(process.cwd(), "public/fonts/Hahmlet-Bold.ttf");
const markdownExtensions = new Set([".md", ".mdx"]);

const WIDTH = 1200;
const HEIGHT = 630;
const BLOG_NAME = "yhc509's Dev Journey";

const COLORS = {
  bg: "#f8f7f4",
  text: "#2d2d2d",
  muted: "#9a9a9a",
  accent: "#4a6fa5",
  accentSoft: "rgba(74, 111, 165, 0.13)",
};

function pathExists(targetPath) {
  return fs.existsSync(targetPath);
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

function formatDate(raw) {
  if (!raw) {
    return "";
  }

  const date = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getFilesRecursively(dir) {
  if (!pathExists(dir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
      continue;
    }

    if (markdownExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function getMarkdownFiles(dir) {
  if (!pathExists(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        markdownExtensions.has(path.extname(entry.name).toLowerCase())
    )
    .map((entry) => path.join(dir, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function readFrontmatter(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  return matter(source).data;
}

function resolveTitleFontSize(title) {
  const length = Array.from(title).length;

  if (length > 60) {
    return 44;
  }

  if (length > 48) {
    return 46;
  }

  if (length > 36) {
    return 48;
  }

  return 52;
}

function createTagChip(tag) {
  return createElement(
    "div",
    {
      key: tag,
      style: {
        display: "flex",
        alignItems: "center",
        padding: "10px 18px",
        borderRadius: "999px",
        backgroundColor: COLORS.accentSoft,
        color: COLORS.accent,
        fontSize: "20px",
        lineHeight: 1,
      },
    },
    tag
  );
}

function createCardMarkup({ title, tags, date }) {
  const titleFontSize = resolveTitleFontSize(title);

  return createElement(
    "div",
    {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: "Hahmlet",
        boxSizing: "border-box",
        padding: "56px 64px 0 64px",
      },
    },
    [
      createElement(
        "div",
        {
          key: "content",
          style: {
            display: "flex",
            flexDirection: "column",
            flex: 1,
          },
        },
        [
          createElement(
            "div",
            {
              key: "brand",
              style: {
                display: "flex",
                fontSize: "20px",
                color: COLORS.muted,
              },
            },
            BLOG_NAME
          ),
          createElement(
            "div",
            {
              key: "title-wrap",
              style: {
                display: "flex",
                alignItems: "center",
                flex: 1,
                marginTop: "28px",
                paddingRight: "16px",
              },
            },
            createElement(
              "div",
              {
                style: {
                  display: "flex",
                  overflow: "hidden",
                  maxHeight: "250px",
                  fontSize: `${titleFontSize}px`,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "-0.03em",
                  color: COLORS.text,
                },
              },
              title
            )
          ),
          createElement(
            "div",
            {
              key: "meta",
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                paddingBottom: "40px",
              },
            },
            [
              tags.length > 0
                ? createElement(
                    "div",
                    {
                      key: "tags",
                      style: {
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                      },
                    },
                    tags.map((tag) => createTagChip(tag))
                  )
                : null,
              createElement(
                "div",
                {
                  key: "date",
                  style: {
                    display: "flex",
                    fontSize: "18px",
                    color: COLORS.muted,
                  },
                },
                date
              ),
            ]
          ),
        ]
      ),
      createElement("div", {
        key: "accent-line",
        style: {
          width: "100%",
          height: "6px",
          backgroundColor: COLORS.accent,
        },
      }),
    ]
  );
}

async function renderCardToFile(fontData, card, targetPath) {
  const svg = await satori(createCardMarkup(card), {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Hahmlet",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });

  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(targetPath);
}

async function generatePostImages(fontData) {
  const postFiles = getFilesRecursively(postsDir);
  let generatedCount = 0;

  for (const filePath of postFiles) {
    const data = readFrontmatter(filePath);
    if (data.open === false) {
      continue;
    }

    const relativePath = path.relative(postsDir, filePath);
    const slug = relativePath.replace(/\.(md|mdx)$/i, "");
    const title = readOptionalString(data.title) || slug;
    const tags = readStringArray(data.tags ?? data.categories).slice(0, 3);
    const date = formatDate(data.date);

    await renderCardToFile(
      fontData,
      { title, tags, date },
      path.join(outputDir, `${slug}.png`)
    );

    generatedCount += 1;
  }

  return generatedCount;
}

async function generateProjectImages(fontData) {
  const projectFiles = getMarkdownFiles(projectsDir);
  let generatedCount = 0;

  for (const filePath of projectFiles) {
    const data = readFrontmatter(filePath);
    if (data.open === false) {
      continue;
    }

    const slug = path.basename(filePath).replace(/\.(md|mdx)$/i, "");
    const title = readOptionalString(data.title) || slug;
    const tags = readStringArray(data.tags).slice(0, 3);
    const date = formatDate(data.date);

    await renderCardToFile(
      fontData,
      { title, tags, date },
      path.join(outputDir, "projects", `${slug}.png`)
    );

    generatedCount += 1;
  }

  return generatedCount;
}

async function main() {
  if (!pathExists(fontPath)) {
    throw new Error(`Font not found: ${fontPath}`);
  }

  await fs.promises.rm(outputDir, { recursive: true, force: true });
  await fs.promises.mkdir(outputDir, { recursive: true });

  const fontData = await fs.promises.readFile(fontPath);
  const postCount = await generatePostImages(fontData);
  const projectCount = await generateProjectImages(fontData);

  console.log(
    `Generated ${postCount} post OG images and ${projectCount} project OG images.`
  );
}

main().catch((error) => {
  console.error("Failed to generate OG images.");
  console.error(error);
  process.exit(1);
});
