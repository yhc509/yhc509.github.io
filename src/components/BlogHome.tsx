"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TagFilter } from "./TagFilter";
import type { PostMeta, TagNode } from "@/lib/posts";

interface BlogHomeProps {
  posts: PostMeta[];
  tagTree: TagNode[];
}

function filterPostsByTags(posts: PostMeta[], selectedTags: string[]): PostMeta[] {
  if (selectedTags.length === 0) return posts;

  return posts.filter((post) =>
    selectedTags.some((selectedTag) =>
      post.tags.some(
        (postTag) =>
          postTag === selectedTag || postTag.startsWith(selectedTag + "/")
      )
    )
  );
}

function filterPostsBySearch(posts: PostMeta[], query: string): PostMeta[] {
  if (!query.trim()) return posts;

  const lowerQuery = query.toLowerCase();
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function BlogHome({ posts, tagTree }: BlogHomeProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("q") || "";

  const filteredByTags = filterPostsByTags(posts, selectedTags);
  const filteredPosts = filterPostsBySearch(filteredByTags, searchQuery);

  const updateUrl = (tags: string[], query: string) => {
    const params = new URLSearchParams();
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }
    if (query.trim()) {
      params.set("q", query);
    }
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  const setSelectedTags = (tags: string[]) => {
    updateUrl(tags, searchQuery);
  };

  const setSearchQuery = (query: string) => {
    updateUrl(selectedTags, query);
  };

  const getPostUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }
    const queryString = params.toString();
    return queryString ? `/posts/${slug}?${queryString}` : `/posts/${slug}`;
  };

  return (
    <div className="py-10">
      {/* Main content - 중앙 고정 */}
      <div className="relative max-w-3xl mx-auto px-5">
        {/* Sidebar - 포스트 영역 바로 왼쪽 */}
        <aside className="hidden lg:block absolute right-full mr-8 w-56 top-0">
          <div className="sticky top-8">
            <TagFilter
              tagTree={tagTree}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>
        </aside>

        {/* Mobile tag filter */}
        <div className="lg:hidden mb-6">
          <TagFilter
            tagTree={tagTree}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

        {/* Search input */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-muted)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Selected tags display */}
        {selectedTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                }}
              >
                #{tag}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Posts list */}
        <div className="grid gap-5">
          {filteredPosts.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>
              {searchQuery
                ? "검색 결과가 없습니다."
                : "선택한 태그에 해당하는 포스트가 없습니다."}
            </p>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.slug}
                href={getPostUrl(post.slug)}
                className="block p-6 rounded-xl border transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                }}
              >
                <article>
                  <h2 className="text-lg font-bold mb-2">{post.title}</h2>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {post.description}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: "var(--card-border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    className="flex items-center gap-3 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <time dateTime={post.date}>{post.date}</time>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
