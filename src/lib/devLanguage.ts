export type DevLanguage = "ko" | "en";

export const DEFAULT_DEV_LANGUAGE: DevLanguage = "en";
const DEV_LANGUAGE_STORAGE_KEY = "devLanguage";
const KOREAN_PATH_PREFIX = "/ko";

export function parseDevLanguage(value: string | null | undefined): DevLanguage | null {
  return value === "ko" || value === "en" ? value : null;
}

export function getToggledDevLanguage(language: DevLanguage): DevLanguage {
  return language === "en" ? "ko" : "en";
}

export function stripLanguagePrefix(pathname: string): string {
  if (pathname === KOREAN_PATH_PREFIX) {
    return "/";
  }

  if (pathname.startsWith(`${KOREAN_PATH_PREFIX}/`)) {
    const stripped = pathname.slice(KOREAN_PATH_PREFIX.length);
    return stripped.length > 0 ? stripped : "/";
  }

  return pathname || "/";
}

export function localizedPath(path: string, language: DevLanguage): string {
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const bare = stripLanguagePrefix(normalized);
  const localized =
    language === "ko" ? (bare === "/" ? KOREAN_PATH_PREFIX : `${KOREAN_PATH_PREFIX}${bare}`) : bare;

  return `${localized}${query}${hash}`;
}

export function persistDevLanguage(language: DevLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DEV_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures and still navigate.
  }

}
