export type DevLanguage = "ko" | "en";

export const DEFAULT_DEV_LANGUAGE: DevLanguage = "ko";
export const DEV_LANGUAGE_COOKIE_NAME = "devLang";
export const DEV_LANGUAGE_STORAGE_KEY = "devLanguage";
export const DEV_LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseDevLanguage(value: string | null | undefined): DevLanguage | null {
  return value === "ko" || value === "en" ? value : null;
}

export function getDefaultDevLanguage(): DevLanguage {
  return DEFAULT_DEV_LANGUAGE;
}

export function getToggledDevLanguage(language: DevLanguage): DevLanguage {
  return language === "en" ? "ko" : "en";
}

export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function getConfiguredDevLanguage(): DevLanguage | null {
  return parseDevLanguage(
    process.env.DEV_LANGUAGE ?? process.env.NEXT_PUBLIC_DEV_LANGUAGE
  );
}

export function shouldUseEnglish(): boolean {
  if (!isDevelopmentEnvironment()) {
    return true;
  }

  return getConfiguredDevLanguage() === "en";
}
