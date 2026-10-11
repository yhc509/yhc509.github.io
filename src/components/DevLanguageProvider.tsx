"use client";

import { createContext, useContext } from "react";
import { DEFAULT_DEV_LANGUAGE, type DevLanguage } from "@/lib/devLanguage";

const DevLanguageContext = createContext<DevLanguage>(DEFAULT_DEV_LANGUAGE);

export function DevLanguageProvider({
  language,
  children,
}: {
  language: DevLanguage;
  children: React.ReactNode;
}) {
  return (
    <DevLanguageContext.Provider value={language}>{children}</DevLanguageContext.Provider>
  );
}

export function useDevLanguage(): DevLanguage {
  return useContext(DevLanguageContext);
}
