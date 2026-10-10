import { MetadataRoute } from "next";
import { toSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/dev-language-sync/",
    },
    sitemap: toSiteUrl("/sitemap.xml"),
  };
}
