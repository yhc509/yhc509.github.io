import type { Metadata } from "next";
import { previewDeploymentOrigin } from "./previewBuild.mjs";

export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://kinkeep.dev";

/** Canonical origin stays on the public site. Preview asset URLs use the deployment host. */
export function deploymentOrigin() {
  return previewDeploymentOrigin() ?? SITE_URL;
}

export function toSiteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function toAssetUrl(path = "/") {
  return new URL(path, deploymentOrigin()).toString();
}

export function languageAlternates(
  canonicalPath: string,
  englishPath: string,
  koreanPath: string
): Metadata["alternates"] {
  return {
    canonical: toSiteUrl(canonicalPath),
    languages: {
      en: toSiteUrl(englishPath),
      ko: toSiteUrl(koreanPath),
      "x-default": toSiteUrl(englishPath),
    },
  };
}
