export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yhc509.github.io";

export function toSiteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
