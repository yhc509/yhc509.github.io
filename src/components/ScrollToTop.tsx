"use client";

import { shouldUseEnglish } from "@/lib/devLanguage";

export function ScrollToTop() {
  const useEnglish = shouldUseEnglish();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className="flex items-center gap-2 mx-auto mt-12 px-4 py-2 rounded-lg text-sm transition-colors"
      style={{
        backgroundColor: "var(--card-bg)",
        color: "var(--text-secondary)",
        border: "1px solid var(--card-border)",
      }}
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
        <path d="M18 15l-6-6-6 6" />
      </svg>
      {useEnglish ? "Back to top" : "맨 위로"}
    </button>
  );
}
