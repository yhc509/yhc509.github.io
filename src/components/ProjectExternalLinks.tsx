import Link from "next/link";
import type { ProjectLinks } from "@/lib/projects";

const linkOrder = ["github", "demo", "docs", "devlog"] as const;

const linkLabels: Record<(typeof linkOrder)[number], string> = {
  github: "GitHub",
  demo: "Demo",
  docs: "Docs",
  devlog: "Devlog",
};

function isInternalLink(href: string) {
  return href.startsWith("/");
}

interface ProjectExternalLinksProps {
  links: ProjectLinks;
  compact?: boolean;
  variant?: "pill" | "plain";
}

export function ProjectExternalLinks({
  links,
  compact = false,
  variant = "pill",
}: ProjectExternalLinksProps) {
  const items = linkOrder.flatMap((key) => {
    const href = links[key];
    if (!href) {
      return [];
    }

    return [{ key, href, label: linkLabels[key] }];
  });

  if (items.length === 0) {
    return null;
  }

  if (variant === "plain") {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {items.map((item) => (
          isInternalLink(item.href) ? (
            <Link
              key={item.key}
              href={item.href}
              className="inline-flex items-center gap-1 underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              <span>{item.label}</span>
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--foreground)" }}
            >
              <span>{item.label}</span>
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
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          )
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        isInternalLink(item.href) ? (
          <Link
            key={item.key}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-full border transition-colors hover:opacity-80 ${
              compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
            }`}
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
          >
            <span>{item.label}</span>
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
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 rounded-full border transition-colors hover:opacity-80 ${
              compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
            }`}
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
          >
            <span>{item.label}</span>
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
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        )
      ))}
    </div>
  );
}
