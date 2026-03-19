import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostType = "article" | "devlog" | "archive_candidate";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  readingTime: string;
  tags: string[];
  open: boolean;
  type: PostType;
  project?: string;
  series?: string;
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

function readTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function readPostType(value: unknown): PostType {
  if (typeof value === "string" && postTypes.has(value as PostType)) {
    return value as PostType;
  }

  return "article";
}

// Helper to recursively find files
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
    .filter((filePath) => /\.(md|mdx)$/.test(filePath))
    .map((filePath) => {
      const relativePath = path.relative(postsDirectory, filePath);
      return relativePath.replace(/\.(md|mdx)$/, "");
    })
    .filter((slug) => {
      // open: false인 포스트는 정적 파일로 생성하지 않음
      try {
        const post = getPostBySlug(slug);
        return post.open;
      } catch {
        return false;
      }
    });
}

export function getPostBySlug(slug: string): Post {
  // Check for .md or .mdx
  const extensions = [".mdx", ".md"];
  let fullPath = "";

  for (const ext of extensions) {
    const p = path.join(postsDirectory, `${slug}${ext}`);
    if (fs.existsSync(p)) {
      fullPath = p;
      break;
    }
  }

  if (!fullPath) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const tags = readTags(data.tags ?? data.categories);

  return {
    slug,
    title: data.title || slug,
    date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: data.description || "",
    content,
    readingTime: readingTime(content).text,
    tags,
    open: data.open !== false, // 기본값은 true (공개)
    type: readPostType(data.type),
    project: readOptionalString(data.project),
    series: readOptionalString(data.series),
  };
}

export function getAllPosts(): PostMeta[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        description: post.description,
        readingTime: post.readingTime,
        tags: post.tags,
        open: post.open,
        type: post.type,
        project: post.project,
        series: post.series,
      };
    })
    .filter((post) => post.open) // open: false인 포스트는 목록에서 제외
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));

  return posts;
}

export interface TagNode {
  name: string;
  fullPath: string;
  children: TagNode[];
  count: number;
}

export interface PostProjectOption {
  slug: string;
  title: string;
  count: number;
}

export function buildTagTree(posts: PostMeta[]): TagNode[] {
  const tagMap = new Map<string, number>();

  // Count all tags and their parent paths
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const parts = tag.split("/");
      for (let i = 1; i <= parts.length; i++) {
        const partialPath = parts.slice(0, i).join("/");
        tagMap.set(partialPath, (tagMap.get(partialPath) || 0) + 1);
      }
    });
  });

  // Build tree structure
  const root: TagNode[] = [];

  const sortedTags = Array.from(tagMap.keys()).sort();

  sortedTags.forEach((tagPath) => {
    const parts = tagPath.split("/");
    if (parts.length === 1) {
      root.push({
        name: parts[0],
        fullPath: tagPath,
        children: [],
        count: tagMap.get(tagPath) || 0,
      });
    } else {
      // Find parent node
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const parentPath = parts.slice(0, i + 1).join("/");
        const parent = current.find((n) => n.fullPath === parentPath);
        if (parent) {
          current = parent.children;
        }
      }
      current.push({
        name: parts[parts.length - 1],
        fullPath: tagPath,
        children: [],
        count: tagMap.get(tagPath) || 0,
      });
    }
  });

  return root;
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

export function filterPostsByTags(
  posts: PostMeta[],
  selectedTags: string[]
): PostMeta[] {
  if (selectedTags.length === 0) return posts;

  return posts.filter((post) =>
    selectedTags.every((selectedTag) =>
      post.tags.some(
        (postTag) =>
          postTag === selectedTag || postTag.startsWith(selectedTag + "/")
      )
    )
  );
}
