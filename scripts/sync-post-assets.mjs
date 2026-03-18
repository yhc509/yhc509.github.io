import fs from "node:fs";
import path from "node:path";

const sourceDir = path.join(process.cwd(), "content", "posts");
const targetDir = path.join(process.cwd(), "public", "posts-images");
const markdownExtensions = new Set([".md", ".mdx"]);
const assetExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".avif",
]);

function resetDirectory(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyAssets(sourcePath, destinationPath) {
  const entries = fs.readdirSync(sourcePath, { withFileTypes: true });

  for (const entry of entries) {
    const from = path.join(sourcePath, entry.name);
    const to = path.join(destinationPath, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyAssets(from, to);
      continue;
    }

    if (entry.name === ".DS_Store") {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (markdownExtensions.has(extension)) {
      continue;
    }

    if (!assetExtensions.has(extension)) {
      continue;
    }

    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

resetDirectory(targetDir);
copyAssets(sourceDir, targetDir);
