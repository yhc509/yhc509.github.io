import Link from "next/link";
import type { ProjectLinks } from "@/lib/projects";

const linkOrder = ["github", "docs", "itch", "demo", "devlog"] as const;

const linkLabels: Record<(typeof linkOrder)[number], string> = {
  github: "GitHub",
  docs: "Docs",
  itch: "itch.io",
  demo: "Demo",
  devlog: "Devlog",
};

function isInternalLink(href: string) {
  return href.startsWith("/");
}

interface ProjectExternalLinksProps {
  links: ProjectLinks;
  compact?: boolean;
  dense?: boolean;
  variant?: "pill" | "plain";
}

export function ProjectExternalLinks({
  links,
  compact = false,
  dense = false,
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

  const pillGap = dense ? "gap-1" : "gap-2";
  const pillPadding = dense
    ? "px-2 py-0.5 text-xs"
    : compact
      ? "px-3 py-2 text-xs"
      : "px-4 py-2.5 text-sm";
  const iconSize = dense ? 10 : 14;
  const showPillIcon = !dense;

  return (
    <div className={`flex flex-wrap ${pillGap}`}>
      {items.map((item) => (
        isInternalLink(item.href) ? (
          <Link
            key={item.key}
            href={item.href}
            className={`inline-flex max-w-full items-center rounded-full border transition-colors hover:opacity-80 ${pillPadding} ${
              showPillIcon ? "gap-1" : ""
            }`}
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
          >
            <span className="truncate">{item.label}</span>
            {showPillIcon ? (
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            ) : null}
          </Link>
        ) : (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex max-w-full items-center rounded-full border transition-colors hover:opacity-80 ${pillPadding} ${
              showPillIcon ? "gap-1" : ""
            }`}
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
          >
            <span className="truncate">{item.label}</span>
            {showPillIcon ? (
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            ) : null}
          </a>
        )
      ))}
    </div>
  );
}
