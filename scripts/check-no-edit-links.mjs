import fs from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "out");
const needles = [
  "github.com/yhc509/yhc509.github.io/edit/",
  "data-edit-page",
];

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...htmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      found.push(fullPath);
    }
  }
  return found;
}

if (process.env.VERCEL_ENV === "preview") {
  console.log("edit-link check: skipped because VERCEL_ENV=preview");
  process.exit(0);
}

if (!fs.existsSync(outDir)) {
  console.error("edit-link check: out/ is missing");
  process.exit(1);
}

const files = htmlFiles(outDir);
const hits = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const needle of needles) {
    if (text.includes(needle)) {
      hits.push(`${path.relative(process.cwd(), file)}: ${needle}`);
    }
  }
}

if (hits.length > 0) {
  console.error("edit-link check: production export contains an edit link");
  for (const hit of hits) console.error(`  ${hit}`);
  process.exit(1);
}

console.log(`edit-link check: scanned ${files.length} html files, production export is clean`);
