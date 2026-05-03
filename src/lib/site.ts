export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://kinkeep.dev";

export function toSiteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
