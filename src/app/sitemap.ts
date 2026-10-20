import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import { getAllNewsIssues } from "@/lib/news";
import { getAllSlides } from "@/lib/slides";
import { toSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

function languageEntry(
  englishPath: string,
  lastModified: string | undefined,
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
  const newsIssues = getAllNewsIssues("ko");
  const slideDecks = getAllSlides();
  const latest = (dates: string[]) =>
    dates.reduce<string | undefined>((a, b) => (!a || b > a ? b : a), undefined);
  const latestPost = latest(posts.map((post) => post.modified));
  const latestNews = latest(newsIssues.map((issue) => issue.modified));
  const latestProject = latest(projects.map((project) => project.date));
  const latestSlide = latest(slideDecks.map((deck) => deck.date));
  const latestAny = latest(
    [latestPost, latestNews, latestProject, latestSlide].filter((d): d is string => Boolean(d))
  );

  return [
    ...languageEntry("/", latestAny, "weekly", 1),
    ...languageEntry("/projects", latestProject ?? latestAny, "weekly", 0.9),
    ...languageEntry("/about", latestAny, "monthly", 0.7),
    ...languageEntry("/news", latestNews, "weekly", 0.8),
    ...languageEntry("/slides", latestSlide, "monthly", 0.6),
    ...slideDecks.flatMap((deck) =>
      languageEntry(`/slides/${deck.slug}`, deck.date, "monthly", 0.5)
    ),
    ...newsIssues.flatMap((issue) =>
      languageEntry(`/news/${issue.id}`, issue.modified, "monthly", 0.6)
    ),
    ...posts.flatMap((post) =>
      languageEntry(`/posts/${post.slug}`, post.modified, "monthly", 0.8)
    ),
    ...projects.flatMap((project) =>
      languageEntry(`/projects/${project.slug}`, project.date, "monthly", 0.8)
    ),
  ];
}
