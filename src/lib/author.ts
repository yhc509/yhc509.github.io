import { SITE_URL } from "./site";

export const AUTHOR_NAME = "kinkeep";
export const AUTHOR_SAME_AS = ["https://github.com/yhc509", "https://x.com/yhkk_dev"];

export const PERSON_ID = new URL("/#person", SITE_URL).toString();
export const WEBSITE_ID = new URL("/#website", SITE_URL).toString();

export function authorPerson(jobTitle?: string) {
  return {
    "@type": "Person" as const,
    "@id": PERSON_ID,
    name: AUTHOR_NAME,
    url: SITE_URL,
    ...(jobTitle ? { jobTitle } : {}),
    sameAs: AUTHOR_SAME_AS,
  };
}

export function personReference() {
  return { "@id": PERSON_ID };
}

export function websiteReference() {
  return { "@id": WEBSITE_ID };
}
