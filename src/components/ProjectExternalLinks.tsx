import Link from "next/link";
import type { ProjectLinks } from "@/lib/projects";

const linkOrder = ["github", "docs", "itch", "demo", "devlog"] as const;

type LinkKey = (typeof linkOrder)[number];

const linkLabels: Record<LinkKey, string> = {
  github: "GitHub",
  docs: "Docs",
  itch: "itch.io",
  demo: "Demo",
  devlog: "Devlog",
};

function isInternalLink(href: string) {
  return href.startsWith("/");
}

function ProjectLinkIcon({ name, size }: { name: LinkKey; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "github":
      return (
        <svg {...common}>
          <path
            d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
          />
        </svg>
      );
    case "docs":
      return (
        <svg {...common}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19v20H6.5a2.5 2.5 0 0 1 0-5H19" />
        </svg>
      );
    case "itch":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M8 12h2v2H8z" />
          <path d="M14 11h2v3h-2z" />
        </svg>
      );
    case "demo":
    case "devlog":
    default:
      return (
        <svg {...common}>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      );
  }
}

interface ProjectExternalLinksProps {
  links: ProjectLinks;
  compact?: boolean;
}

export function ProjectExternalLinks({
  links,
  compact = false,
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

  const iconSize = compact ? 14 : 16;
  const buttonClass = compact
    ? "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors hover:opacity-80"
    : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors hover:opacity-80";

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const content = (
          <ProjectLinkIcon name={item.key} size={iconSize} />
        );

        if (isInternalLink(item.href)) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className={buttonClass}
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--foreground)",
              }}
              aria-label={item.label}
              title={item.label}
            >
              {content}
            </Link>
          );
        }

        return (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className={buttonClass}
            style={{
              borderColor: "var(--card-border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--foreground)",
            }}
            aria-label={item.label}
            title={item.label}
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
