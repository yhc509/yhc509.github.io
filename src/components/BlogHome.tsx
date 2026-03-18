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
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = limitParam ? parseInt(limitParam, 10) : 10;

  const filteredByTags = filterPostsByTags(posts, selectedTags);
  const filteredPosts = filterPostsBySearch(filteredByTags, searchQuery);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const updateUrl = (tags: string[], query: string, page: number, limit: number) => {
    const params = new URLSearchParams();
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }
    if (query.trim()) {
      params.set("q", query);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    if (limit !== 10) {
      params.set("limit", limit.toString());
    }
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/", { scroll: false });
  };

  const setSelectedTags = (tags: string[]) => {
    updateUrl(tags, searchQuery, 1, postsPerPage);
  };

  const setSearchQuery = (query: string) => {
    updateUrl(selectedTags, query, 1, postsPerPage);
  };

  const setPage = (page: number) => {
    updateUrl(selectedTags, searchQuery, page, postsPerPage);
  };

  const setLimit = (limit: number) => {
    updateUrl(selectedTags, searchQuery, 1, limit);
  };

  const getPostUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }
    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }
    if (postsPerPage !== 10) {
      params.set("limit", postsPerPage.toString());
    }
    const queryString = params.toString();
    return queryString ? `/posts/${slug}?${queryString}` : `/posts/${slug}`;
  };

  // Calculate page range to show (max 10 pages)
  let startPage = Math.max(1, currentPage - 4);
  let endPage = Math.min(totalPages, currentPage + 5);

  if (endPage - startPage + 1 < 10) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + 9);
    } else if (endPage === totalPages) {
      startPage = Math.max(1, endPage - 9);
    }
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

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

        {/* Search and Limit input */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
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

          <div className="relative">
            <select
              value={postsPerPage}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="appearance-none pl-4 pr-8 py-2 rounded-lg border outline-none transition-colors cursor-pointer h-full"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            >
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={30}>30개</option>
              <option value={50}>50개</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--text-muted)" }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
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
            currentPosts.map((post) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--card-border)] transition-colors"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--text-secondary)"
              }}
              aria-label="Previous page"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="flex gap-1 overflow-x-auto">
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setPage(page)}
                  className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                      ? "bg-[var(--accent)] text-white"
                      : "hover:bg-[var(--card-border)]"
                    }`}
                  style={currentPage !== page ? { color: "var(--text-secondary)" } : {}}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--card-border)] transition-colors"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--text-secondary)"
              }}
              aria-label="Next page"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
