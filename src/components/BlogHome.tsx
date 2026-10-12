"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArchiveFilter, buildArchive, monthLabel } from "./ArchiveFilter";
import { localizedPath } from "@/lib/devLanguage";
import { useDevLanguage } from "@/components/DevLanguageProvider";
import { filterPostsBySearch } from "@/lib/postFilters";
import { getBlogCopy } from "@/lib/siteContent";
import type { PostMeta, PostProjectOption } from "@/lib/posts";

interface BlogHomeProps {
  posts: PostMeta[];
  projectOptions: PostProjectOption[];
}

function filterPostsByPeriod(posts: PostMeta[], period: string): PostMeta[] {
  if (!period) return posts;
  return posts.filter((post) => post.date.startsWith(period));
}

export function BlogHome({
  posts,
  projectOptions,
}: BlogHomeProps) {
  const language = useDevLanguage();
  const useEnglish = language === "en";
  const { searchPlaceholder } = getBlogCopy(language);
  const searchParams = useSearchParams();
  const router = useRouter();

  const monthParam = searchParams.get("month") || "";
  const selectedPeriod = /^\d{4}(-\d{2})?$/.test(monthParam) ? monthParam : "";
  const searchQuery = searchParams.get("q") || "";
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const postsPerPage = limitParam ? parseInt(limitParam, 10) : 10;

  const projectTitleMap = new Map(
    projectOptions.map((project) => [project.slug, project.title])
  );

  const archive = buildArchive(posts.map((post) => post.date));
  const filteredByPeriod = filterPostsByPeriod(posts, selectedPeriod);
  const filteredPosts = filterPostsBySearch(filteredByPeriod, searchQuery);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const updateUrl = (period: string, query: string, page: number, limit: number) => {
    const params = new URLSearchParams();
    if (period) {
      params.set("month", period);
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
    const homePath = localizedPath("/", language);
    router.push(queryString ? `${homePath}?${queryString}` : homePath, { scroll: false });
  };

  const setSelectedPeriod = (period: string) => {
    updateUrl(period, searchQuery, 1, postsPerPage);
  };

  const setSearchQuery = (query: string) => {
    updateUrl(selectedPeriod, query, 1, postsPerPage);
  };

  const setPage = (page: number) => {
    updateUrl(selectedPeriod, searchQuery, page, postsPerPage);
  };

  const setLimit = (limit: number) => {
    updateUrl(selectedPeriod, searchQuery, 1, limit);
  };

  const getPostUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (selectedPeriod) {
      params.set("month", selectedPeriod);
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
    const postPath = localizedPath(`/posts/${slug}`, language);
    return queryString ? `${postPath}?${queryString}` : postPath;
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

  const searchAriaLabel = useEnglish ? "Search posts" : "블로그 검색";
  const clearFiltersLabel = useEnglish ? "Clear all" : "전체 초기화";
  const projectFilterLabel = useEnglish ? "Project" : "프로젝트";
  const emptySearchResultLabel = useEnglish
    ? "No results found."
    : "검색 결과가 없습니다.";
  const emptyFilteredPostsLabel = useEnglish
    ? "No posts in the selected period."
    : "선택한 기간에 해당하는 포스트가 없습니다.";
  const paginationAriaLabel = useEnglish ? "Page navigation" : "페이지 탐색";
  const previousPageAriaLabel = useEnglish ? "Previous page" : "이전 페이지";
  const nextPageAriaLabel = useEnglish ? "Next page" : "다음 페이지";

  return (
    <div id="posts-feed" className="pb-10">
      {/* Main content - 중앙 고정 */}
      <div className="relative max-w-3xl mx-auto px-5">
        {/* Sidebar - 포스트 영역 바로 왼쪽 */}
        <aside className="hidden lg:block absolute right-full mr-8 w-56 top-0">
          <div className="sticky top-8 space-y-4">
            <ArchiveFilter
              archive={archive}
              selected={selectedPeriod}
              onSelect={setSelectedPeriod}
            />
          </div>
        </aside>

        {/* Mobile archive filter */}
        <div className="lg:hidden mb-6 space-y-4">
          <ArchiveFilter
            archive={archive}
            selected={selectedPeriod}
            onSelect={setSelectedPeriod}
            collapsible
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
              placeholder={searchPlaceholder}
              aria-label={searchAriaLabel}
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
              <option value={5}>{useEnglish ? "5" : "5개"}</option>
              <option value={10}>{useEnglish ? "10" : "10개"}</option>
              <option value={30}>{useEnglish ? "30" : "30개"}</option>
              <option value={50}>{useEnglish ? "50" : "50개"}</option>
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

        {(selectedPeriod || searchQuery) && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => updateUrl("", "", 1, postsPerPage)}
              className="text-xs px-3 py-1 rounded-full transition-colors hover:opacity-80"
              style={{
                backgroundColor: "var(--card-border)",
                color: "var(--text-secondary)",
              }}
            >
              {clearFiltersLabel}
            </button>
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
                ? emptySearchResultLabel
                : emptyFilteredPostsLabel}
            </div>
          ) : (
            currentPosts.map((post, index) => {
              const periodKey = post.date.slice(0, 7);
              const showHeading =
                index === 0 || currentPosts[index - 1].date.slice(0, 7) !== periodKey;
              return (
              <div key={post.slug}>
              {showHeading && (
                <h3
                  className="pt-6 pb-2 text-sm font-bold border-b"
                  style={{ color: "var(--text-secondary)", borderColor: "var(--card-border)" }}
                >
                  {useEnglish
                    ? `${monthLabel(Number(periodKey.slice(5, 7)), true)} ${periodKey.slice(0, 4)}`
                    : `${periodKey.slice(0, 4)}년 ${monthLabel(Number(periodKey.slice(5, 7)), false)}`}
                </h3>
              )}
              <Link
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
                    {useEnglish && post.missingEnglish && (
                      <>
                        <span>·</span>
                        <span>Korean only</span>
                      </>
                    )}
                    {post.project && projectTitleMap.has(post.project) && (
                      <>
                        <span>·</span>
                        <span>
                          {projectFilterLabel}: {projectTitleMap.get(post.project)}
                        </span>
                      </>
                    )}
                  </div>
                  <h2
                    className="text-lg font-bold leading-snug"
                    lang={useEnglish && post.missingEnglish ? "ko" : undefined}
                  >
                    {post.title}
                  </h2>
                  {post.description && (
                    <p
                      className="mt-2 text-sm leading-6"
                      style={{ color: "var(--text-secondary)" }}
                      lang={useEnglish && post.missingEnglish ? "ko" : undefined}
                    >
                      {post.description}
                    </p>
                  )}
                </article>
              </Link>
              </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label={paginationAriaLabel}
            className="mt-10 flex justify-center items-center gap-2"
          >
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--card-border)] transition-colors"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--text-secondary)"
              }}
              aria-label={previousPageAriaLabel}
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
              aria-label={nextPageAriaLabel}
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
