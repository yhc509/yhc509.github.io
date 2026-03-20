import { promises as fs } from "fs";
import path from "path";

const postsRoot = path.join(process.cwd(), "content/posts");
const outputRoot = path.join(process.cwd(), "public/posts-images");
const markdownExtensions = new Set([".md", ".mdx"]);

async function collectAssetFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectAssetFiles(fullPath)));
      continue;
    }

    if (markdownExtensions.has(path.extname(entry.name).toLowerCase())) {
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  const assetFiles = await collectAssetFiles(postsRoot);

  for (const assetFile of assetFiles) {
    const relativePath = path.relative(postsRoot, assetFile);
    const destinationPath = path.join(outputRoot, relativePath);

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(assetFile, destinationPath);
  }

  console.log(`Synced ${assetFiles.length} post assets to public/posts-images`);
}

main().catch((error) => {
  console.error("Failed to sync post assets.");
  console.error(error);
  process.exit(1);
});
