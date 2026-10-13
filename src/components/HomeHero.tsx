import { type DevLanguage } from "@/lib/devLanguage";
import { getBlogCopy } from "@/lib/siteContent";

export function HomeHero({ language }: { language: DevLanguage }) {
  const { headline } = getBlogCopy(language);

  return (
    <section className="max-w-3xl mx-auto px-5 pt-6 pb-1 sm:pt-7">
      <div
        className="border-b pb-5"
        style={{ borderColor: "var(--card-border)" }}
      >
        <h1 className="max-w-3xl text-2xl font-bold leading-snug sm:text-3xl">
          {headline}
        </h1>
      </div>
    </section>
  );
}
