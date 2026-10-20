import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { assetOutputName, listDeckAssetFiles } from "../src/lib/slides.mjs";

const outputRoot = path.join(process.cwd(), "public/slides-assets");
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

async function main() {
  await fs.rm(outputRoot, { recursive: true, force: true });
  await fs.mkdir(outputRoot, { recursive: true });

  const assets = listDeckAssetFiles();
  for (const asset of assets) {
    const outputName = assetOutputName(asset.relativePath);
    const destinationPath = path.join(outputRoot, asset.slug, outputName);
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    const ext = path.posix.extname(asset.relativePath).toLowerCase();
    if (RASTER.has(ext)) {
      await sharp(asset.sourcePath).webp({ quality: 80 }).toFile(destinationPath);
    } else {
      await fs.copyFile(asset.sourcePath, destinationPath);
    }
  }

  console.log(`Synced ${assets.length} slide assets to public/slides-assets`);
}

main().catch((error) => {
  console.error("Failed to sync slide assets.");
  console.error(error);
  process.exit(1);
});
