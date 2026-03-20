"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PostProjectFilter } from "./PostProjectFilter";
import { TagFilter } from "./TagFilter";
import type { PostMeta, PostProjectOption, TagNode } from "@/lib/posts";

interface BlogHomeProps {
  posts: PostMeta[];
  tagTree: TagNode[];
  projectOptions: PostProjectOption[];
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

function filterPostsByProjects(
  posts: PostMeta[],
  selectedProjects: string[]
): PostMeta[] {
  if (selectedProjects.length === 0) return posts;

  return posts.filter(
    (post) => post.project && selectedProjects.includes(post.project)
  );
}

export function BlogHome({
  posts,
  tagTree,
  projectOptions,
}: BlogHomeProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const selectedProjects =
    searchParams.get("projects")?.split(",").filter(Boolean) || [];
  const searchQuery = searchParams.get("q") || "";
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = limitParam ? parseInt(limitParam, 10) : 10;

  const projectTitleMap = new Map(
    projectOptions.map((project) => [project.slug, project.title])
  );

  const filteredByProjects = filterPostsByProjects(posts, selectedProjects);
  const filteredByTags = filterPostsByTags(filteredByProjects, selectedTags);
  const filteredPosts = filterPostsBySearch(filteredByTags, searchQuery);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const updateUrl = (
    tags: string[],
    projects: string[],
    query: string,
    page: number,
    limit: number
  ) => {
    const params = new URLSearchParams();
    if (tags.length > 0) {
      params.set("tags", tags.join(","));
    }
    if (projects.length > 0) {
      params.set("projects", projects.join(","));
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
    updateUrl(tags, selectedProjects, searchQuery, 1, postsPerPage);
  };

  const setSelectedProjects = (projects: string[]) => {
    updateUrl(selectedTags, projects, searchQuery, 1, postsPerPage);
  };

  const setSearchQuery = (query: string) => {
    updateUrl(selectedTags, selectedProjects, query, 1, postsPerPage);
  };

  const setPage = (page: number) => {
    updateUrl(selectedTags, selectedProjects, searchQuery, page, postsPerPage);
  };

  const setLimit = (limit: number) => {
    updateUrl(selectedTags, selectedProjects, searchQuery, 1, limit);
  };

  const getPostUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }
    if (selectedProjects.length > 0) {
      params.set("projects", selectedProjects.join(","));
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
    <div id="posts-feed" className="pb-10">
      {/* Main content - 중앙 고정 */}
      <div className="relative max-w-3xl mx-auto px-5">
        {/* Sidebar - 포스트 영역 바로 왼쪽 */}
        <aside className="hidden lg:block absolute right-full mr-8 w-56 top-0">
          <div className="sticky top-8 space-y-4">
            <PostProjectFilter
              projects={projectOptions}
              selectedProjects={selectedProjects}
              onProjectsChange={setSelectedProjects}
            />
            <TagFilter
              tagTree={tagTree}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>
        </aside>

        {/* Mobile tag filter */}
        <div className="lg:hidden mb-6 space-y-4">
          <PostProjectFilter
            projects={projectOptions}
            selectedProjects={selectedProjects}
            onProjectsChange={setSelectedProjects}
          />
          <TagFilter
            tagTree={tagTree}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

        {/* Search and Limit input */}
        <div
          className="mb-6 flex gap-3 border-b pb-4"
          style={{ borderColor: "var(--card-border)" }}
        >
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
              aria-label="블로그 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 outline-none transition-colors"
              style={{
                backgroundColor: "transparent",
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
              className="h-full appearance-none rounded-lg border py-2 pl-4 pr-8 outline-none transition-colors cursor-pointer"
              style={{
                backgroundColor: "transparent",
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

        {(selectedTags.length > 0 ||
          selectedProjects.length > 0 ||
          searchQuery) && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => updateUrl([], [], "", 1, postsPerPage)}
              className="text-xs px-3 py-1 rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: "var(--card-border)",
                color: "var(--text-secondary)",
              }}
            >
              전체 초기화
            </button>
          </div>
        )}

        {/* Selected filters display */}
        {(selectedProjects.length > 0 || selectedTags.length > 0) && (
          <div className="mb-5 flex flex-wrap gap-2">
            {selectedProjects.map((projectSlug) => (
              <button
                key={projectSlug}
                onClick={() =>
                  setSelectedProjects(
                    selectedProjects.filter((slug) => slug !== projectSlug)
                  )
                }
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: "var(--card-border)",
                  color: "var(--foreground)",
                }}
              >
                프로젝트: {projectTitleMap.get(projectSlug) || projectSlug}
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
        <div>
          {filteredPosts.length === 0 ? (
            <div
              className="border-b py-8"
              style={{
                color: "var(--text-muted)",
                borderColor: "var(--card-border)",
              }}
            >
              {searchQuery
                ? "검색 결과가 없습니다."
                : "선택한 주제나 프로젝트에 해당하는 포스트가 없습니다."}
            </div>
          ) : (
            currentPosts.map((post) => (
              <Link
                key={post.slug}
                href={getPostUrl(post.slug)}
                className="block border-b py-5 transition-colors hover:opacity-85"
                style={{ borderColor: "var(--card-border)" }}
              >
                <article>
                  <div
                    className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <time dateTime={post.date}>{post.date}</time>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                    {post.project && projectTitleMap.has(post.project) && (
                      <>
                        <span>·</span>
                        <span>
                          Project: {projectTitleMap.get(post.project)}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg font-bold leading-snug">{post.title}</h2>
                  {post.description && (
                    <p
                      className="mt-2 text-sm leading-6"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {post.description}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{ color: "var(--text-muted)" }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="페이지 탐색" className="mt-10 flex justify-center items-center gap-2">
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
          </nav>
        )}
      </div>
    </div>
  );
}
