import { SITE_URL } from "./site";

export const AUTHOR_NAME = "kinkeep";
export const AUTHOR_SAME_AS = ["https://github.com/yhc509", "https://x.com/yhkk_dev"];

export function authorPerson(jobTitle?: string) {
  return {
    "@type": "Person" as const,
    name: AUTHOR_NAME,
    url: SITE_URL,
    ...(jobTitle ? { jobTitle } : {}),
    sameAs: AUTHOR_SAME_AS,
  };
}
