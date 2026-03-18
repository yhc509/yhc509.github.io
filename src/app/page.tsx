import { Suspense } from "react";
import { getAllPosts, buildTagTree } from "@/lib/posts";
import { BlogHome } from "@/components/BlogHome";

export default function Home() {
  const posts = getAllPosts();
  const tagTree = buildTagTree(posts);

  return (
    <Suspense>
      <BlogHome posts={posts} tagTree={tagTree} />
    </Suspense>
  );
}
