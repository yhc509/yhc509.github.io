import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import { toSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

function languageEntry(
  englishPath: string,
  lastModified: Date,
  changeFrequency: "weekly" | "monthly",
  priority: number
): MetadataRoute.Sitemap {
  const koreanPath = englishPath === "/" ? "/ko" : `/ko${englishPath}`;
  const alternates = {
    languages: {
      en: toSiteUrl(englishPath),
      ko: toSiteUrl(koreanPath),
    },
  };

  return [
    {
      url: toSiteUrl(englishPath),
      lastModified,
      changeFrequency,
      priority,
      alternates,
    },
    {
      url: toSiteUrl(koreanPath),
      lastModified,
      changeFrequency,
      priority,
      alternates,
    },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts("en");
  const projects = getAllProjects("en");
  const buildTime = new Date();

  return [
    ...languageEntry("/", buildTime, "weekly", 1),
    ...languageEntry("/projects", buildTime, "weekly", 0.9),
    ...languageEntry("/about", buildTime, "monthly", 0.7),
    ...posts.flatMap((post) =>
      languageEntry(`/posts/${post.slug}`, buildTime, "monthly", 0.8)
    ),
    ...projects.flatMap((project) =>
      languageEntry(`/projects/${project.slug}`, buildTime, "monthly", 0.8)
    ),
  ];
}
