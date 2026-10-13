import { promises as fs } from "fs";
import path from "path";
import { readNewsIssues } from "../src/lib/newsIssues.mjs";

const SITE_URL = "https://kinkeep.dev";

const FEEDS = [
  { language: "en", basePath: "/news", title: "kinkeep.dev AI News", description: "A short AI newsletter with summaries and one-line takes." },
  { language: "ko", basePath: "/ko/news", title: "kinkeep.dev AI 뉴스", description: "요약과 한 줄 코멘트를 붙인 짧은 AI 뉴스레터." },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function issueHtml(issue) {
  const items = issue.items
    .map(
      (item) =>
        `<li><p><a href="${escapeXml(item.url)}">${escapeXml(item.title)}</a> (${escapeXml(item.source)})</p>` +
        (item.summary ? `<p>${escapeXml(item.summary)}</p>` : "") +
        (item.points ? `<ul>${item.points.map((point) => `<li>${escapeXml(point)}</li>`).join("")}</ul>` : "") +
        `${item.comment ? `<p><em>${escapeXml(item.comment)}</em></p>` : ""}</li>`
    )
    .join("");
  return `<ol>${items}</ol>`;
}

async function writeFeed({ language, basePath, title, description }) {
  const issues = readNewsIssues(language);
  const feedUrl = new URL(`${basePath}/feed.xml`, SITE_URL).toString();
  const lastBuildDate = issues[0] ? new Date(issues[0].date) : new Date();

  const items = issues.map((issue) => {
    const link = new URL(`${basePath}/${issue.id}`, SITE_URL).toString();
    return [
      "  <item>",
      `    <title>${escapeXml(issue.title)}</title>`,
      `    <link>${escapeXml(link)}</link>`,
      `    <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `    <pubDate>${escapeXml(new Date(issue.date).toUTCString())}</pubDate>`,
      `    <description>${escapeXml(issue.description)}</description>`,
      `    <content:encoded><![CDATA[${issueHtml(issue).replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded>`,
      "  </item>",
    ].join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(new URL(basePath, SITE_URL).toString())}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${language}</language>`,
    `    <lastBuildDate>${escapeXml(lastBuildDate.toUTCString())}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  const outputPath = path.join(process.cwd(), "public", basePath, "feed.xml");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, xml, "utf8");
  console.log(`Generated news feed with ${issues.length} issues at ${outputPath}`);
}

Promise.all(FEEDS.map(writeFeed)).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
