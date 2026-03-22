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

function readBrowserStoredDevLanguage(): DevLanguage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseDevLanguage(window.localStorage.getItem(DEV_LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function readBrowserCookieDevLanguage(): DevLanguage | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${DEV_LANGUAGE_COOKIE_NAME}=`))
    ?.split("=")[1];

  return parseDevLanguage(cookieValue);
}

function readServerRenderedDevLanguage(): DevLanguage | null {
  if (typeof document === "undefined") {
    return null;
  }

  return parseDevLanguage(document.documentElement.dataset.devLanguage);
}

export function getCurrentDevLanguage(): DevLanguage {
  if (!isDevelopmentEnvironment()) {
    return "en";
  }

  if (typeof window === "undefined") {
    return getConfiguredDevLanguage() ?? DEFAULT_DEV_LANGUAGE;
  }

  return (
    readBrowserStoredDevLanguage() ??
    readBrowserCookieDevLanguage() ??
    readServerRenderedDevLanguage() ??
    getConfiguredDevLanguage() ??
    DEFAULT_DEV_LANGUAGE
  );
}

export function shouldUseEnglish(): boolean {
  return getCurrentDevLanguage() === "en";
}
