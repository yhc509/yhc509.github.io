"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedPath, stripLanguagePrefix } from "@/lib/devLanguage";
import { useDevLanguage } from "@/components/DevLanguageProvider";

export function NavLinks() {
  const pathname = usePathname();
  const language = useDevLanguage();
  const barePath = stripLanguagePrefix(pathname);

  const isPostsActive = barePath === "/" || barePath.startsWith("/posts");
  const isProjectsActive =
    barePath === "/projects" || barePath.startsWith("/projects/");
  const isNewsActive = barePath === "/news" || barePath.startsWith("/news/");
  const isSlidesActive = barePath === "/slides" || barePath.startsWith("/slides/");
  const isAboutActive = barePath === "/about";

  return (
    <>
      <Link
        href={localizedPath("/", language)}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm transition-colors"
        style={{
          backgroundColor: isPostsActive ? "var(--accent)" : "var(--card-bg)",
          color: isPostsActive ? "white" : "var(--foreground)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="hidden sm:inline">Posts</span>
      </Link>
      <Link
        href={localizedPath("/projects", language)}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm transition-colors"
        style={{
          backgroundColor: isProjectsActive ? "var(--accent)" : "var(--card-bg)",
          color: isProjectsActive ? "white" : "var(--foreground)",
        }}
        aria-label="Projects"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        </svg>
        <span className="hidden sm:inline">Projects</span>
      </Link>
      <Link
        href={localizedPath("/news", language)}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm transition-colors"
        style={{
          backgroundColor: isNewsActive ? "var(--accent)" : "var(--card-bg)",
          color: isNewsActive ? "white" : "var(--foreground)",
        }}
        aria-label="News"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
        <span className="hidden sm:inline">News</span>
      </Link>
      <Link
        href={localizedPath("/slides", language)}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm transition-colors"
        style={{
          backgroundColor: isSlidesActive ? "var(--accent)" : "var(--card-bg)",
          color: isSlidesActive ? "white" : "var(--foreground)",
        }}
        aria-label="Slides"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span className="hidden sm:inline">Slides</span>
      </Link>
      <Link
        href={localizedPath("/about", language)}
        className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm transition-colors"
        style={{
          backgroundColor: isAboutActive ? "var(--accent)" : "var(--card-bg)",
          color: isAboutActive ? "white" : "var(--foreground)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="hidden sm:inline">About</span>
      </Link>
    </>
  );
}
