"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  DEV_LANGUAGE_COOKIE_MAX_AGE,
  DEV_LANGUAGE_COOKIE_NAME,
  DEV_LANGUAGE_STORAGE_KEY,
  getConfiguredDevLanguage,
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

function readServerLanguage(): DevLanguage | null {
  return parseDevLanguage(document.documentElement.dataset.devLanguage);
}

function getClientLanguageSnapshot(): DevLanguage {
  return (
    readStoredLanguage() ??
    readCookieLanguage() ??
    readServerLanguage() ??
    getConfiguredDevLanguage() ??
    getDefaultDevLanguage()
  );
}

async function syncServerLanguage(language: DevLanguage): Promise<void> {
  const response = await fetch(`/dev-language-sync/${language}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to synchronize server language: ${response.status}`);
  }
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
    const preferredLanguage = getClientLanguageSnapshot();
    const storedLanguage = readStoredLanguage();
    const cookieLanguage = readCookieLanguage();
    const serverLanguage = readServerLanguage();

    if (storedLanguage !== preferredLanguage || cookieLanguage !== preferredLanguage) {
      persistLanguage(preferredLanguage);
    }

    if (serverLanguage !== preferredLanguage) {
      void syncServerLanguage(preferredLanguage)
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(error);
        });
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
        void syncServerLanguage(nextLanguage)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error(error);
          });
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
