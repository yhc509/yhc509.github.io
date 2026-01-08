import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export interface ProjectMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail: string;
  tags: string[];
  open: boolean;
}

export interface Project extends ProjectMeta {
  content: string;
}

export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(projectsDirectory);
  return fileNames
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

export function getProjectBySlug(slug: string): Project {
  const fullPath = path.join(projectsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const tags: string[] = data.tags || [];

  return {
    slug,
    title: data.title,
    date: data.date,
    description: data.description,
    thumbnail: data.thumbnail || "/images/default-project.svg",
    content,
    tags,
    open: data.open !== false, // 기본값은 true (공개)
  };
}

export function getAllProjects(): ProjectMeta[] {
  const slugs = getAllProjectSlugs();
  const projects = slugs
    .map((slug) => {
      const { content, ...meta } = getProjectBySlug(slug);
      return meta;
    })
    .filter((project) => project.open) // open: false인 프로젝트는 목록에서 제외
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));

  return projects;
}

export interface ProjectTagNode {
  name: string;
  fullPath: string;
  children: ProjectTagNode[];
  count: number;
}

export function buildProjectTagTree(projects: ProjectMeta[]): ProjectTagNode[] {
  const tagMap = new Map<string, number>();

  projects.forEach((project) => {
    project.tags.forEach((tag) => {
      const parts = tag.split("/");
      for (let i = 1; i <= parts.length; i++) {
        const partialPath = parts.slice(0, i).join("/");
        tagMap.set(partialPath, (tagMap.get(partialPath) || 0) + 1);
      }
    });
  });

  const root: ProjectTagNode[] = [];
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
