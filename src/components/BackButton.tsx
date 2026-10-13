"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { localizedPath } from "@/lib/devLanguage";
import { useDevLanguage } from "@/components/DevLanguageProvider";

const LIST_QUERY_KEYS = ["month", "q", "page", "limit", "tags"] as const;

interface BackButtonProps {
  basePath?: string;
}

export function BackButton({ basePath = "/" }: BackButtonProps) {
  const language = useDevLanguage();
  const useEnglish = language === "en";
  const searchParams = useSearchParams();
  const params = new URLSearchParams();
  for (const key of LIST_QUERY_KEYS) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  const queryString = params.toString();
  const localizedBasePath = localizedPath(basePath, language);
  const backUrl = queryString ? `${localizedBasePath}?${queryString}` : localizedBasePath;

  return (
    <Link
      href={backUrl}
      className="inline-flex items-center gap-2 mb-8 text-sm transition-colors hover:opacity-70"
      style={{ color: "var(--text-secondary)" }}
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
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      {useEnglish ? "Back to list" : "목록으로"}
    </Link>
  );
}
