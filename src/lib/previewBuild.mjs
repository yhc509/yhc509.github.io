/** Future-dated posts and news pass the Seoul cutoff on preview builds and when SHOW_FUTURE=1. */
export function includeFutureContent() {
  return process.env.SHOW_FUTURE === "1" || process.env.VERCEL_ENV === "preview";
}

/** Absolute origin of this Vercel preview deployment. Null for GitHub Pages and local production builds. */
export function previewDeploymentOrigin() {
  if (process.env.VERCEL_ENV !== "preview" || !process.env.VERCEL_URL) return null;
  const host = process.env.VERCEL_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}`;
}
