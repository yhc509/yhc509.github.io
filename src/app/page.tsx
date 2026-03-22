import { Suspense } from "react";
import { getAllProjects } from "@/lib/projects";
import { getAllPosts, buildPostProjectOptions, buildTagTree } from "@/lib/posts";
import { BlogHome } from "@/components/BlogHome";
import { HomeHero } from "@/components/HomeHero";


export default async function Home() {
  const posts = getAllPosts();
  const projects = getAllProjects();
  const tagTree = buildTagTree(posts);
  const projectTitleMap = Object.fromEntries(
    projects.map((project) => [project.slug, project.title])
  );
  const projectOptions = buildPostProjectOptions(posts, projectTitleMap);

  return (
    <>
      <HomeHero />
      <Suspense>
        <BlogHome
          posts={posts}
          tagTree={tagTree}
          projectOptions={projectOptions}
        />
      </Suspense>
    </>
  );
}
