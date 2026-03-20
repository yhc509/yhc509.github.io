import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "content/projects");
const projectFileExtensions = [".md", ".mdx"];

export interface ProjectLinks {
  github?: string;
  demo?: string;
  docs?: string;
  devlog?: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail: string;
  tags: string[];
  open: boolean;
  role: string;
  highlights: string[];
  links: ProjectLinks;
}

export interface Project extends ProjectMeta {
  content: string;
}

interface RawProject {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail: string;
  tags: string[];
  open: boolean;
  content: string;
  role?: string;
  highlights?: string[];
  links?: Partial<ProjectLinks>;
}

function failInvalidProject(slug: string, message: string): never {
  throw new Error(`Invalid project "${slug}": ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  slug: string,
  field: string,
  value: unknown
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    failInvalidProject(slug, `${field} must be a non-empty string.`);
  }

  return value.trim();
}

function readOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function readStringArray(
  slug: string,
  field: string,
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    failInvalidProject(slug, `${field} must be an array of strings.`);
  }

  return value.map((item, index) =>
    readRequiredString(slug, `${field}[${index}]`, item)
  );
}

function readOptionalLinks(slug: string, value: unknown): Partial<ProjectLinks> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    failInvalidProject(slug, "links must be an object.");
  }

  const github = readOptionalString(value.github);
  const demo = readOptionalString(value.demo);
  const docs = readOptionalString(value.docs);
  const devlog = readOptionalString(value.devlog);

  if (!github && !demo && !docs && !devlog) {
    failInvalidProject(slug, "links must contain at least one valid URL.");
  }

  return {
    ...(github ? { github } : {}),
    ...(demo ? { demo } : {}),
    ...(docs ? { docs } : {}),
    ...(devlog ? { devlog } : {}),
  };
}

function resolveProjectFilePath(slug: string): string {
  for (const extension of projectFileExtensions) {
    const fullPath = path.join(projectsDirectory, `${slug}${extension}`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  throw new Error(`Project file not found for slug "${slug}".`);
}

function readRawProjectBySlug(slug: string): RawProject {
  const fullPath = resolveProjectFilePath(slug);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const open = data.open !== false;

  return {
    slug,
    title: readRequiredString(slug, "title", data.title),
    date: readRequiredString(slug, "date", data.date),
    description: readRequiredString(slug, "description", data.description),
    thumbnail:
      readOptionalString(data.thumbnail) || "/images/default-project.svg",
    tags: data.tags ? readStringArray(slug, "tags", data.tags) : [],
    open,
    content,
    role: readOptionalString(data.role),
    highlights: Array.isArray(data.highlights)
      ? readStringArray(slug, "highlights", data.highlights)
      : undefined,
    links: readOptionalLinks(slug, data.links),
  };
}

function toPublicProject(project: RawProject): Project {
  if (!project.open) {
    throw new Error(`Project "${project.slug}" is not public.`);
  }

  if (!project.role) {
    failInvalidProject(project.slug, "role is required for public projects.");
  }

  if (
    !project.highlights ||
    project.highlights.length < 2 ||
    project.highlights.length > 5
  ) {
    failInvalidProject(
      project.slug,
      "highlights must contain 2–5 items for public projects."
    );
  }

  if (!project.links) {
    failInvalidProject(
      project.slug,
      "at least one public link is required for public projects."
    );
  }

  return {
    slug: project.slug,
    title: project.title,
    date: project.date,
    description: project.description,
    thumbnail: project.thumbnail,
    tags: project.tags,
    open: project.open,
    role: project.role,
    highlights: project.highlights,
    links: {
      ...(project.links.github ? { github: project.links.github } : {}),
      ...(project.links.demo ? { demo: project.links.demo } : {}),
      ...(project.links.docs ? { docs: project.links.docs } : {}),
      ...(project.links.devlog ? { devlog: project.links.devlog } : {}),
    },
    content: project.content,
  };
}

export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(projectsDirectory);
  return fileNames
    .filter((name) => name.endsWith(".md") || name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx?$/, ""))
    .filter((slug) => readRawProjectBySlug(slug).open);
}

export function getProjectBySlug(slug: string): Project {
  return toPublicProject(readRawProjectBySlug(slug));
}

export function getAllProjects(): ProjectMeta[] {
  const slugs = getAllProjectSlugs();
  return slugs
    .map((slug) => {
      const project = getProjectBySlug(slug);
      return {
        slug: project.slug,
        title: project.title,
        date: project.date,
        description: project.description,
        thumbnail: project.thumbnail,
        tags: project.tags,
        open: project.open,
        role: project.role,
        highlights: project.highlights,
        links: project.links,
      };
    })
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }

      return a.title.localeCompare(b.title, "ko");
    });
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
