"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();

  const isPostsActive = pathname === "/" || pathname.startsWith("/posts");
  const isAboutActive = pathname === "/about";

  return (
    <>
      <Link
        href="/"
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isPostsActive ? "var(--accent)" : "var(--card-bg)",
          color: isPostsActive ? "white" : "var(--foreground)",
        }}
        aria-label="포스트"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </Link>
      <Link
        href="/about"
        className="p-2 rounded-lg transition-colors"
        style={{
          backgroundColor: isAboutActive ? "var(--accent)" : "var(--card-bg)",
          color: isAboutActive ? "white" : "var(--foreground)",
        }}
        aria-label="소개"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </Link>
    </>
  );
}
