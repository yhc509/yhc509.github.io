import { readFileSync, writeFileSync } from "fs";

const files = ["public/posts/index.html", "public/ko/posts/index.html"];
const productionMeta = '<meta name="robots" content="noindex" />';
const previewMeta = '<meta name="robots" content="noindex, nofollow" />';
const restore = process.argv.includes("--restore");
const vercel =
  !restore && Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const productionHtml = html.replaceAll(previewMeta, productionMeta);
  const next = vercel
    ? productionHtml.replaceAll(productionMeta, previewMeta)
    : productionHtml;
  if (next !== html) {
    writeFileSync(file, next);
  }
}
