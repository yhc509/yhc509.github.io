import { authorPerson, personReference, websiteReference, WEBSITE_ID } from "./author";
import { siteContent } from "./siteContent";
import { SITE_URL } from "./site";

export function siteJsonLd(input: {
  description: string;
  jobTitle: string;
  inLanguage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: siteContent.name,
        url: SITE_URL,
        description: input.description,
        inLanguage: input.inLanguage,
        publisher: personReference(),
      },
      authorPerson(input.jobTitle),
    ],
  };
}

export function breadcrumbList(items: { name: string; item: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function mainEntityOfPage(url: string) {
  return {
    "@type": "WebPage",
    "@id": url,
  };
}

export function jsonLdGraph(nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}

export { personReference, websiteReference };
