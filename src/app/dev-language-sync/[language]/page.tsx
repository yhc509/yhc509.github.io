import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseDevLanguage } from "@/lib/devLanguage";
import { setServerDevLanguage } from "@/lib/serverDevLanguage";

interface DevLanguagePageProps {
  params: Promise<{ language: string }>;
}

export const dynamicParams = false;

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  return [{ language: "en" }, { language: "ko" }];
}

export default async function DevLanguagePage({ params }: DevLanguagePageProps) {
  const { language } = await params;
  const devLanguage = parseDevLanguage(language);

  if (!devLanguage) {
    notFound();
  }

  if (process.env.NODE_ENV === "development") {
    setServerDevLanguage(devLanguage);
  }

  return (
    <div className="px-5 py-10 text-sm" style={{ color: "var(--text-secondary)" }}>
      Development language synchronized.
    </div>
  );
}
