import { Suspense } from "react";
import { getAllPosts, buildTagTree } from "@/lib/posts";
import { BlogHome } from "@/components/BlogHome";
import { HomeHero } from "@/components/HomeHero";

export default function Home() {
  const posts = getAllPosts();
  const tagTree = buildTagTree(posts);

  return (
    <>
      <HomeHero />
      <Suspense>
        <BlogHome posts={posts} tagTree={tagTree} />
      </Suspense>
    </>
  );
}
