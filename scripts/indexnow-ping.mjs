import { readFileSync } from "fs";
import path from "path";

const KEY = "f0d2a2e4a59a37a3574b39ac3d49224a";
const HOST = "kinkeep.dev";

async function main() {
  try {
    const keyPath = path.join(process.cwd(), "public", `${KEY}.txt`);
    const key = readFileSync(keyPath, "utf8").trim();
    if (key !== KEY) {
      throw new Error("IndexNow key file does not match the ping key");
    }

    const sitemapResponse = await fetch(`https://${HOST}/sitemap.xml`);
    if (!sitemapResponse.ok) {
      throw new Error(`sitemap request failed with ${sitemapResponse.status}`);
    }

    const sitemap = await sitemapResponse.text();
    const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    if (urlList.length === 0) {
      throw new Error("sitemap did not contain any URLs");
    }

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `https://${HOST}/${key}.txt`,
        urlList,
      }),
    });

    console.log(`IndexNow responded ${response.status} for ${urlList.length} URLs`);
    if (!response.ok) {
      console.error(await response.text());
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

await main();
