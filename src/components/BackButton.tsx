"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { shouldUseEnglish } from "@/lib/devLanguage";

interface BackButtonProps {
  basePath?: string;
}

export function BackButton({ basePath = "/" }: BackButtonProps) {
  const useEnglish = shouldUseEnglish();
  const searchParams = useSearchParams();
  const tags = searchParams.get("tags");
  const query = searchParams.get("q");

  const params = new URLSearchParams();
  if (tags) params.set("tags", tags);
  if (query) params.set("q", query);
  const queryString = params.toString();
  const backUrl = queryString ? `${basePath}?${queryString}` : basePath;

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
