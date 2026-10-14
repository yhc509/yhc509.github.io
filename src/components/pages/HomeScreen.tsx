import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { getAllPosts, buildPostProjectOptions } from "@/lib/posts";
import { BlogHome } from "@/components/BlogHome";
import { HomeHero } from "@/components/HomeHero";
import type { DevLanguage } from "@/lib/devLanguage";
import { absoluteDocumentTitle, indexDocumentTitle } from "@/lib/documentTitle";
import { languageAlternates } from "@/lib/site";

export function homeMetadata(language: DevLanguage): Metadata {
  const canonicalPath = language === "en" ? "/" : "/ko";

  return {
    ...absoluteDocumentTitle(indexDocumentTitle("home", language)),
    alternates: languageAlternates(canonicalPath, "/", "/ko"),
  };
}

export function HomeScreen({ language }: { language: DevLanguage }) {
  const posts = getAllPosts(language);
  const projects = getAllProjects(language);
  const projectTitleMap = Object.fromEntries(
    projects.map((project) => [project.slug, project.title])
  );
  const projectOptions = buildPostProjectOptions(posts, projectTitleMap);

  return (
    <>
      <HomeHero language={language} />
      <>
        <BlogHome
          posts={posts}
          projectOptions={projectOptions}
        />
      </>
    </>
  );
}
