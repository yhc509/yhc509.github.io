export type DevLanguage = "ko" | "en";

export const DEFAULT_DEV_LANGUAGE: DevLanguage = "en";
export const DEV_LANGUAGE_COOKIE_NAME = "devLang";
export const DEV_LANGUAGE_STORAGE_KEY = "devLanguage";
export const DEV_LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const KOREAN_PATH_PREFIX = "/ko";

export function parseDevLanguage(value: string | null | undefined): DevLanguage | null {
  return value === "ko" || value === "en" ? value : null;
}

export function getDefaultDevLanguage(): DevLanguage {
  return DEFAULT_DEV_LANGUAGE;
}

export function getToggledDevLanguage(language: DevLanguage): DevLanguage {
  return language === "en" ? "ko" : "en";
}

export function getConfiguredDevLanguage(): DevLanguage | null {
  return parseDevLanguage(
    process.env.DEV_LANGUAGE ?? process.env.NEXT_PUBLIC_DEV_LANGUAGE
  );
}

export function languageFromPathname(pathname: string): DevLanguage {
  if (pathname === KOREAN_PATH_PREFIX || pathname.startsWith(`${KOREAN_PATH_PREFIX}/`)) {
    return "ko";
  }

  return "en";
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

  document.cookie = `${DEV_LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=${DEV_LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
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

export const DEV_LANGUAGE_BOOTSTRAP_SCRIPT = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(DEV_LANGUAGE_STORAGE_KEY)});if(stored!=="en"&&stored!=="ko")return;var path=location.pathname;if(path==="/dev-language-sync"||path.indexOf("/dev-language-sync/")===0)return;var isKo=path==="/ko"||path.indexOf("/ko/")===0;if((isKo?"ko":"en")===stored)return;var bare=isKo?(path.slice(3)||"/"):path;if(bare.charAt(0)!=="/")bare="/"+bare;var next=stored==="ko"?(bare==="/"?"/ko":"/ko"+bare):bare;location.replace(next+location.search+location.hash);}catch(e){}})();`;
