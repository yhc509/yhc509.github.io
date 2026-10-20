"use client";

import { usePathname } from "next/navigation";
import {
  getToggledDevLanguage,
  localizedPath,
  persistDevLanguage,
  stripLanguagePrefix,
} from "@/lib/devLanguage";
import { useDevLanguage } from "@/components/DevLanguageProvider";

export function DevLanguageToggle({
  englishOnlyPaths = [],
}: {
  englishOnlyPaths?: readonly string[];
}) {
  const pathname = usePathname() || "/";
  const language = useDevLanguage();

  if (englishOnlyPaths.includes(stripLanguagePrefix(pathname))) {
    return null;
  }

  const nextLanguage = getToggledDevLanguage(language);
  const href = localizedPath(pathname, nextLanguage);
  const currentLanguageLabel = language === "en" ? "English" : "한국어";
  const nextLanguageLabel = nextLanguage === "en" ? "English" : "한국어";
  const ariaLabel =
    language === "en"
      ? `Language. Currently ${currentLanguageLabel}. Switch to ${nextLanguageLabel}.`
      : `언어. 현재 ${currentLanguageLabel}. ${nextLanguageLabel}로 전환.`;

  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        persistDevLanguage(nextLanguage);
        const nextPath = localizedPath(window.location.pathname, nextLanguage);
        window.location.assign(
          `${nextPath}${window.location.search}${window.location.hash}`
        );
      }}
      className="dev-language-toggle"
      aria-label={ariaLabel}
      title={language === "en" ? "Language: EN" : "언어: KO"}
    >
      <span className="dev-language-toggle__option" data-active={language === "en"}>
        EN
      </span>
      <span style={{ color: "var(--text-muted)" }}>/</span>
      <span className="dev-language-toggle__option" data-active={language === "ko"}>
        KO
      </span>
    </a>
  );
}
