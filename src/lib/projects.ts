import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { DevLanguage } from "./devLanguage";

const projectsDirectory = path.join(process.cwd(), "content/projects");
const projectFileExtensions = [".mdx", ".md"];

const projectLinkKeys = ["github", "demo", "docs", "devlog", "itch"] as const;
const projectKinds = ["game", "tool"] as const;

type ProjectLinkKey = (typeof projectLinkKeys)[number];
export type ProjectKind = (typeof projectKinds)[number];

export interface ProjectLinks {
  github?: string;
  demo?: string;
  docs?: string;
  devlog?: string;
  itch?: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  thumbnail: string;
  open: boolean;
  kind: ProjectKind;
  role: string;
  highlights: string[];
  links: ProjectLinks;
  missingEnglish: boolean;
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
  open: boolean;
  kind: ProjectKind;
  content: string;
  role?: string;
  highlights?: string[];
  links?: Partial<ProjectLinks>;
  missingEnglish: boolean;
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

function readProjectKind(slug: string, value: unknown): ProjectKind {
  const kind = readRequiredString(slug, "kind", value);
  if (kind !== "game" && kind !== "tool") {
    failInvalidProject(
      slug,
      `kind must be one of: ${projectKinds.join(", ")}.`
    );
  }

  return kind;
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

  const unknownKey = Object.keys(value).find(
    (key) => !projectLinkKeys.includes(key as ProjectLinkKey)
  );
  if (unknownKey) {
    failInvalidProject(
      slug,
      `links.${unknownKey} is not an allowed link. Allowed links: ${projectLinkKeys.join(", ")}.`
    );
  }

  const links: Partial<ProjectLinks> = {};
  for (const key of projectLinkKeys) {
    const href = readOptionalString(value[key]);
    if (href) {
      links[key] = href;
    }
  }

  if (Object.keys(links).length === 0) {
    failInvalidProject(slug, "links must contain at least one valid URL.");
  }

  return links;
}

function findProjectPath(slug: string): string | null {
  for (const extension of projectFileExtensions) {
    const fullPath = path.join(projectsDirectory, `${slug}${extension}`);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function hasEnglishProject(slug: string): boolean {
  return findProjectPath(`${slug}-en`) !== null;
}

function isEnglishVariantFilePath(filePath: string): boolean {
  return /-en\.(md|mdx)$/.test(filePath);
}

function resolveProjectFilePath(slug: string, language: DevLanguage): string {
  const englishPath =
    language === "en" && hasEnglishProject(slug) ? findProjectPath(`${slug}-en`) : null;
  const fullPath = englishPath ?? findProjectPath(slug);

  if (fullPath) {
    return fullPath;
  }

  throw new Error(`Project file not found for slug "${slug}".`);
}

function readRawProjectBySlug(slug: string, language: DevLanguage): RawProject {
  const resolvedPath = resolveProjectFilePath(slug, language);
  const fileContents = fs.readFileSync(resolvedPath, "utf8");
  const { data, content } = matter(fileContents);
  const open = data.open !== false;

  return {
    slug,
    title: readRequiredString(slug, "title", data.title),
    date: readRequiredString(slug, "date", data.date),
    description: readRequiredString(slug, "description", data.description),
    thumbnail:
      readOptionalString(data.thumbnail) || "/images/default-project.svg",
    open,
    kind: readProjectKind(slug, data.kind),
    content,
    role: readOptionalString(data.role),
    highlights: Array.isArray(data.highlights)
      ? readStringArray(slug, "highlights", data.highlights)
      : undefined,
    links: readOptionalLinks(slug, data.links),
    missingEnglish: !hasEnglishProject(slug),
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
    open: project.open,
    kind: project.kind,
    role: project.role,
    highlights: project.highlights,
    links: {
      ...(project.links.github ? { github: project.links.github } : {}),
      ...(project.links.demo ? { demo: project.links.demo } : {}),
      ...(project.links.docs ? { docs: project.links.docs } : {}),
      ...(project.links.devlog ? { devlog: project.links.devlog } : {}),
      ...(project.links.itch ? { itch: project.links.itch } : {}),
    },
    missingEnglish: project.missingEnglish,
    content: project.content,
  };
}

export function getAllProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(projectsDirectory);
  return fileNames
    .filter(
      (name) =>
        (name.endsWith(".md") || name.endsWith(".mdx")) &&
        !isEnglishVariantFilePath(name)
    )
    .map((name) => name.replace(/\.mdx?$/, ""))
    .filter((slug) => readRawProjectBySlug(slug, "ko").open);
}

export function getProjectBySlug(slug: string, language: DevLanguage = "en"): Project {
  return toPublicProject(readRawProjectBySlug(slug, language));
}

export function getAllProjects(language: DevLanguage = "en"): ProjectMeta[] {
  const slugs = getAllProjectSlugs();
  return slugs
    .map((slug) => {
      const project = getProjectBySlug(slug, language);
      return {
        slug: project.slug,
        title: project.title,
        date: project.date,
        description: project.description,
        thumbnail: project.thumbnail,
        open: project.open,
        kind: project.kind,
        role: project.role,
        highlights: project.highlights,
        links: project.links,
        missingEnglish: project.missingEnglish,
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
