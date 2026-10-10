"use client";

import { useEffect } from "react";
import {
  localizedPath,
  persistDevLanguage,
  type DevLanguage,
} from "@/lib/devLanguage";

export function DevLanguageSyncClient({ language }: { language: DevLanguage }) {
  useEffect(() => {
    persistDevLanguage(language);

    let destination = localizedPath("/", language);

    try {
      if (document.referrer) {
        const url = new URL(document.referrer);
        if (
          url.origin === window.location.origin &&
          url.pathname !== "/dev-language-sync" &&
          !url.pathname.startsWith("/dev-language-sync/")
        ) {
          destination = `${localizedPath(url.pathname, language)}${url.search}${url.hash}`;
        }
      }
    } catch {
      destination = localizedPath("/", language);
    }

    window.location.replace(destination);
  }, [language]);

  return (
    <div className="px-5 py-10 text-sm" style={{ color: "var(--text-secondary)" }}>
      {language === "en" ? "Switching to English." : "한국어로 전환합니다."}
    </div>
  );
}
