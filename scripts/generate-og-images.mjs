import fs from "fs";
import path from "path";
import { createElement } from "react";
import matter from "gray-matter";
import satori from "satori";
import sharp from "sharp";
import { formatPostDate } from "../src/lib/postAssets.mjs";

const postsDir = path.join(process.cwd(), "content/posts");
const projectsDir = path.join(process.cwd(), "content/projects");
const outputDir = path.join(process.cwd(), "public/og");
const fontPath = path.join(process.cwd(), "public/fonts/Hahmlet-Bold.ttf");
const markdownExtensions = new Set([".md", ".mdx"]);

const WIDTH = 1200;
const HEIGHT = 630;
const BLOG_NAME = "kinkeep.dev";

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

function getPngFilesRecursively(dir) {
  if (!pathExists(dir)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getPngFilesRecursively(fullPath));
      continue;
    }

    if (path.extname(entry.name).toLowerCase() === ".png") {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
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

async function shouldGenerateImage(sourcePath, targetPath) {
  try {
    const [sourceStat, targetStat] = await Promise.all([
      fs.promises.stat(sourcePath),
      fs.promises.stat(targetPath),
    ]);

    return sourceStat.mtimeMs > targetStat.mtimeMs;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return true;
    }

    throw error;
  }
}

function isEnglishVariant(filePath) {
  return /-en\.(md|mdx)$/i.test(filePath);
}

function canonicalPostSlug(filePath) {
  const relativePath = path.relative(postsDir, filePath);
  return relativePath.replace(/\.(md|mdx)$/i, "").replace(/-en$/, "");
}

function canonicalProjectSlug(filePath) {
  return path.basename(filePath).replace(/\.(md|mdx)$/i, "").replace(/-en$/, "");
}

async function renderFrontmatterCard(fontData, filePath, slug, targetPath) {
  const data = readFrontmatter(filePath);
  if (data.open === false) {
    return { included: false, generated: false };
  }

  const title = readOptionalString(data.title) || slug;
  const tags = readStringArray(data.tags ?? data.categories).slice(0, 3);
  const date = (formatPostDate(data.date) ?? "");

  if (!(await shouldGenerateImage(filePath, targetPath))) {
    return { included: true, generated: false };
  }

  await renderCardToFile(fontData, { title, tags, date }, targetPath);
  return { included: true, generated: true };
}

async function generateGroupedImages(fontData, groups, englishTarget, koreanTarget) {
  let generatedCount = 0;
  const expectedFiles = new Set();

  for (const [slug, group] of groups) {
    if (!group.ko && !group.en) {
      continue;
    }

    const englishSource = group.en ?? group.ko;
    const targets = [[englishSource, englishTarget(slug)]];
    if (group.ko) {
      targets.push([group.ko, koreanTarget(slug)]);
    }

    for (const [sourcePath, targetPath] of targets) {
      if (!sourcePath) {
        continue;
      }

      const result = await renderFrontmatterCard(fontData, sourcePath, slug, targetPath);
      if (!result.included) {
        continue;
      }

      expectedFiles.add(targetPath);
      if (result.generated) {
        generatedCount += 1;
      }
    }
  }

  return { generatedCount, expectedFiles };
}

async function generatePostImages(fontData) {
  const groups = new Map();

  for (const filePath of getFilesRecursively(postsDir)) {
    const slug = canonicalPostSlug(filePath);
    const group = groups.get(slug) ?? {};
    if (isEnglishVariant(filePath)) {
      group.en = filePath;
    } else {
      group.ko = filePath;
    }
    groups.set(slug, group);
  }

  return generateGroupedImages(
    fontData,
    groups,
    (slug) => path.join(outputDir, `${slug}.png`),
    (slug) => path.join(outputDir, "ko", `${slug}.png`)
  );
}

async function generateProjectImages(fontData) {
  const groups = new Map();

  for (const filePath of getMarkdownFiles(projectsDir)) {
    const slug = canonicalProjectSlug(filePath);
    const group = groups.get(slug) ?? {};
    if (isEnglishVariant(filePath)) {
      group.en = filePath;
    } else {
      group.ko = filePath;
    }
    groups.set(slug, group);
  }

  return generateGroupedImages(
    fontData,
    groups,
    (slug) => path.join(outputDir, "projects", `${slug}.png`),
    (slug) => path.join(outputDir, "ko", "projects", `${slug}.png`)
  );
}

async function cleanupOrphanImages(expectedFiles) {
  const existingFiles = getPngFilesRecursively(outputDir);
  let deletedCount = 0;

  for (const filePath of existingFiles) {
    if (expectedFiles.has(filePath)) {
      continue;
    }

    await fs.promises.rm(filePath, { force: true });
    deletedCount += 1;
  }

  return deletedCount;
}

async function main() {
  if (!pathExists(fontPath)) {
    throw new Error(`Font not found: ${fontPath}`);
  }

  await fs.promises.mkdir(outputDir, { recursive: true });

  const fontData = await fs.promises.readFile(fontPath);
  const { generatedCount: postCount, expectedFiles: expectedPostFiles } =
    await generatePostImages(fontData);
  const { generatedCount: projectCount, expectedFiles: expectedProjectFiles } =
    await generateProjectImages(fontData);
  const deletedCount = await cleanupOrphanImages(
    new Set([...expectedPostFiles, ...expectedProjectFiles])
  );

  console.log(
    `Generated ${postCount} post OG images and ${projectCount} project OG images. Deleted ${deletedCount} orphan images.`
  );
}

main().catch((error) => {
  console.error("Failed to generate OG images.");
  console.error(error);
  process.exit(1);
});
