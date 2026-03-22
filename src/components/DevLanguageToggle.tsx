"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  DEV_LANGUAGE_COOKIE_MAX_AGE,
  DEV_LANGUAGE_COOKIE_NAME,
  DEV_LANGUAGE_STORAGE_KEY,
  getDefaultDevLanguage,
  getToggledDevLanguage,
  parseDevLanguage,
  type DevLanguage,
} from "@/lib/devLanguage";

function readCookieLanguage(): DevLanguage | null {
  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${DEV_LANGUAGE_COOKIE_NAME}=`))
    ?.split("=")[1];

  return parseDevLanguage(cookieValue);
}

function readStoredLanguage(): DevLanguage | null {
  const storedValue = window.localStorage.getItem(DEV_LANGUAGE_STORAGE_KEY);
  return parseDevLanguage(storedValue);
}

function persistLanguage(language: DevLanguage) {
  window.localStorage.setItem(DEV_LANGUAGE_STORAGE_KEY, language);
  document.cookie = `${DEV_LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=${DEV_LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
}

function getClientLanguageSnapshot(): DevLanguage {
  return readStoredLanguage() ?? readCookieLanguage() ?? getDefaultDevLanguage();
}

export function DevLanguageToggle() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const language = useSyncExternalStore(
    () => () => {},
    getClientLanguageSnapshot,
    getDefaultDevLanguage
  );

  useEffect(() => {
    const storedLanguage = readStoredLanguage();
    const cookieLanguage = readCookieLanguage();

    if (storedLanguage && storedLanguage !== cookieLanguage) {
      persistLanguage(storedLanguage);
      window.location.reload();
      return;
    }

    if (cookieLanguage && cookieLanguage !== storedLanguage) {
      window.localStorage.setItem(DEV_LANGUAGE_STORAGE_KEY, cookieLanguage);
      return;
    }

    if (!storedLanguage && !cookieLanguage) {
      window.localStorage.setItem(DEV_LANGUAGE_STORAGE_KEY, getDefaultDevLanguage());
    }
  }, []);

  if (!mounted) {
    return <div className="fixed right-4 bottom-4 z-[70] h-11 w-20 rounded-full" />;
  }

  const currentLanguageLabel = language === "en" ? "English" : "Korean";
  const ariaLabel =
    language === "en"
      ? `Development language toggle. Currently viewing ${currentLanguageLabel}.`
      : "개발 언어 전환. 현재 한국어 보기";

  return (
    <button
      type="button"
      onClick={() => {
        const nextLanguage = getToggledDevLanguage(language);
        persistLanguage(nextLanguage);
        window.location.reload();
      }}
      className="dev-language-toggle"
      aria-label={ariaLabel}
      title={`Dev language: ${language.toUpperCase()}`}
    >
      <span className="dev-language-toggle__option" data-active={language === "en"}>
        EN
      </span>
      <span style={{ color: "var(--text-muted)" }}>/</span>
      <span className="dev-language-toggle__option" data-active={language === "ko"}>
        KO
      </span>
    </button>
  );
}
