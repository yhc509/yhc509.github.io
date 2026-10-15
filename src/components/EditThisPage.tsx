import type { DevLanguage } from "@/lib/devLanguage";

const EDIT_BASE = "https://github.com/yhc509/yhc509.github.io/edit";

/**
 * GitHub editor link for the markdown source of this page.
 * Rendered into the HTML only when the build is a Vercel preview.
 * Production builds (including SHOW_FUTURE=1) omit the element entirely.
 */
export function EditThisPage({
  sourcePath,
  language,
}: {
  sourcePath: string;
  language: DevLanguage;
}) {
  if (process.env.VERCEL_ENV !== "preview") return null;

  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  if (!ref || !sourcePath) return null;

  const href = `${EDIT_BASE}/${ref}/${sourcePath}`;
  const label = language === "ko" ? "이 글 수정" : "Edit this page";

  return (
    <p className="mt-3 text-sm leading-5">
      <a
        data-edit-page=""
        href={href}
        className="underline decoration-1 underline-offset-2"
        style={{ color: "var(--accent)" }}
      >
        {label}
      </a>
    </p>
  );
}
