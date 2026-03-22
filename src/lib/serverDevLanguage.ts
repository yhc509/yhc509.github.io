import "server-only";

import {
  DEFAULT_DEV_LANGUAGE,
  type DevLanguage,
  getConfiguredDevLanguage,
} from "./devLanguage";

export async function getServerDevLanguage(): Promise<DevLanguage | null> {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return getConfiguredDevLanguage();
}

export async function getRequestDevLanguage(): Promise<DevLanguage> {
  return (await getServerDevLanguage()) ?? DEFAULT_DEV_LANGUAGE;
}

export async function shouldUseEnglishVersionInDevelopment(): Promise<boolean> {
  return (await getRequestDevLanguage()) === "en";
}
