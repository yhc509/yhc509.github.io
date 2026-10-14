import { MetadataRoute } from "next";
import { toSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dev-language-sync/",
        "/dev/x-embed-fixture",
        "/ko/dev/x-embed-fixture",
      ],
    },
    sitemap: toSiteUrl("/sitemap.xml"),
  };
}
