import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
export { filterPostsBySearch } from "./postFilters";
import type { DevLanguage } from "./devLanguage";
import { formatPostDate } from "./postAssets.mjs";
import { resolveModifiedDate } from "./contentDates.mjs";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostType = "article" | "devlog" | "archive_candidate";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  modified: string;
  description: string;
  readingTime: string;
  open: boolean;
  type: PostType;
  project?: string;
  series?: string;
  missingEnglish: boolean;
}

export interface Post extends PostMeta {
  content: string;
}


const postTypes = new Set<PostType>(["article", "devlog", "archive_candidate"]);

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function readPostType(value: unknown): PostType {
  if (typeof value === "string" && postTypes.has(value as PostType)) {
    return value as PostType;
  }

  return "article";
}

function formatDateString(raw: unknown): string {
  return formatPostDate(raw) ?? new Date().toISOString().split("T")[0];
}

function isPublishable(dateStr: string): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(dateStr) <= today;
}

function isOpen(open: boolean): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return open;
}

function findPostPath(slug: string): string | null {
  const extensions = [".mdx", ".md"];

  for (const ext of extensions) {
    const fullPath = path.join(postsDirectory, `${slug}${ext}`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function hasEnglishPost(slug: string): boolean {
  return findPostPath(`${slug}-en`) !== null;
}

function isEnglishVariantFilePath(filePath: string): boolean {
  return /-en\.(md|mdx)$/.test(filePath);
}

function getFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

export function getAllPostSlugs(): string[] {
  const filePaths = getFilesRecursively(postsDirectory);
  return filePaths
    .filter(
      (filePath) => /\.(md|mdx)$/.test(filePath) && !isEnglishVariantFilePath(filePath)
    )
    .map((filePath) => {
      const relativePath = path.relative(postsDirectory, filePath);
      return relativePath.replace(/\.(md|mdx)$/, "");
    })
    .filter((slug) => {
      // production에서는 open: false / 미래 날짜 포스트를 정적 파일로 생성하지 않음
      try {
        const post = getPostBySlug(slug, "ko");
        return isOpen(post.open) && isPublishable(post.date);
      } catch {
        return false;
      }
    });
}

function formatReadingTime(content: string, language: DevLanguage): string {
  const stats = readingTime(content);
  return language === "ko" ? `약 ${Math.max(1, Math.ceil(stats.minutes))}분` : stats.text;
}

function parsePostFile(
  fullPath: string,
  slug: string,
  missingEnglish: boolean,
  contentLanguage: DevLanguage
): Post {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const date = formatDateString(data.date);

  return {
    slug,
    title: data.title || slug,
    date,
    modified: resolveModifiedDate(fullPath, date, data.updated, formatDateString),
    description: data.description || "",
    content,
    readingTime: formatReadingTime(content, contentLanguage),
    open: data.open !== false,
    type: readPostType(data.type),
    project: readOptionalString(data.project),
    series: readOptionalString(data.series),
    missingEnglish,
  };
}

export function getPostBySlug(slug: string, language: DevLanguage = "en"): Post {
  const missingEnglish = !hasEnglishPost(slug);
  const englishPath =
    language === "en" && !missingEnglish ? findPostPath(`${slug}-en`) : null;
  const fullPath = englishPath ?? findPostPath(slug);

  if (!fullPath) {
    throw new Error(`Post not found: ${slug}`);
  }

  return parsePostFile(fullPath, slug, missingEnglish, englishPath ? "en" : "ko");
}

export function getAllPosts(language: DevLanguage = "en"): PostMeta[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug, language);
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        modified: post.modified,
        description: post.description,
        readingTime: post.readingTime,
        open: post.open,
        type: post.type,
        project: post.project,
        series: post.series,
        missingEnglish: post.missingEnglish,
      };
    })
    .filter((post) => isOpen(post.open) && isPublishable(post.date)) // production에서는 open: false이거나 미래 날짜인 포스트를 목록에서 제외
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));

  return posts;
}

export function getAdjacentPosts(
  slug: string,
  language: DevLanguage = "en"
): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getAllPosts(language);
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}

export interface PostProjectOption {
  slug: string;
  title: string;
  count: number;
}

export interface ProjectPostGroups {
  devlogs: PostMeta[];
  articles: PostMeta[];
}

function comparePostsByDateAscending(a: PostMeta, b: PostMeta): number {
  const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateDiff !== 0) {
    return dateDiff;
  }

  return a.title.localeCompare(b.title, "ko");
}

function readDevlogNumber(title: string): number | undefined {
  const match = title.match(/devlog\s+(\d+)\s*$/i);
  if (!match) {
    return undefined;
  }

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function compareDevlogs(a: PostMeta, b: PostMeta): number {
  const aNumber = readDevlogNumber(a.title);
  const bNumber = readDevlogNumber(b.title);

  if (aNumber !== undefined && bNumber !== undefined && aNumber !== bNumber) {
    return aNumber - bNumber;
  }

  return comparePostsByDateAscending(a, b);
}

export function buildPostProjectOptions(
  posts: PostMeta[],
  projectTitleMap: Record<string, string> = {}
): PostProjectOption[] {
  const counts = new Map<string, number>();

  posts.forEach((post) => {
    if (!post.project) {
      return;
    }

    counts.set(post.project, (counts.get(post.project) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([slug, count]) => ({
      slug,
      title: projectTitleMap[slug] || slug,
      count,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.title.localeCompare(b.title, "ko");
    });
}

export function getPostsByProject(
  projectSlug: string,
  language: DevLanguage = "en"
): PostMeta[] {
  return getAllPosts(language)
    .filter((post) => post.project === projectSlug)
    .sort(comparePostsByDateAscending);
}

export function getProjectPostGroups(
  projectSlug: string,
  language: DevLanguage = "en"
): ProjectPostGroups {
  const relatedPosts = getPostsByProject(projectSlug, language);

  return {
    devlogs: relatedPosts
      .filter((post) => post.type === "devlog")
      .sort(compareDevlogs),
    articles: relatedPosts
      .filter((post) => post.type === "article")
      .sort(comparePostsByDateAscending),
  };
}

