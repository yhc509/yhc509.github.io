"use client";

import { useDevLanguage } from "@/components/DevLanguageProvider";

export interface ArchiveYear {
  year: string;
  count: number;
  months: { key: string; month: number; count: number }[];
}

export function monthLabel(month: number, useEnglish: boolean): string {
  if (!useEnglish) return `${month}월`;
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

export function buildArchive(dates: string[]): ArchiveYear[] {
  const years = new Map<string, Map<string, number>>();
  for (const date of dates) {
    const year = date.slice(0, 4);
    const key = date.slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) continue;
    const months = years.get(year) ?? new Map<string, number>();
    months.set(key, (months.get(key) ?? 0) + 1);
    years.set(year, months);
  }
  return [...years.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, months]) => {
      const list = [...months.entries()]
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, count]) => ({ key, month: Number(key.slice(5, 7)), count }));
      return { year, count: list.reduce((sum, m) => sum + m.count, 0), months: list };
    });
}

interface ArchiveFilterProps {
  archive: ArchiveYear[];
  selected: string;
  onSelect: (value: string) => void;
}

export function ArchiveFilter({ archive, selected, onSelect }: ArchiveFilterProps) {
  const useEnglish = useDevLanguage() === "en";
  const headingLabel = useEnglish ? "Archive" : "아카이브";
  const clearLabel = useEnglish ? "Clear" : "초기화";

  const itemClass = (active: boolean) =>
    `w-full flex items-center justify-between rounded px-2 py-1 text-left transition-colors ${
      active ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--card-border)]"
    }`;

  return (
    <div
      className="p-4 rounded-xl border"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm">{headingLabel}</h2>
        {selected && (
          <button
            onClick={() => onSelect("")}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{ color: "var(--text-muted)", backgroundColor: "var(--card-border)" }}
          >
            {clearLabel}
          </button>
        )}
      </div>
      <div className="space-y-3 text-sm">
        {archive.map((year) => (
          <section key={year.year}>
            <button
              onClick={() => onSelect(selected === year.year ? "" : year.year)}
              className={`${itemClass(selected === year.year)} font-semibold`}
            >
              <span>{year.year}</span>
              <span className="text-xs opacity-70">{year.count}</span>
            </button>
            <ul className="mt-1 ml-2 space-y-0.5">
              {year.months.map((m) => (
                <li key={m.key}>
                  <button
                    onClick={() => onSelect(selected === m.key ? "" : m.key)}
                    className={itemClass(selected === m.key)}
                    style={selected === m.key ? {} : { color: "var(--text-secondary)" }}
                  >
                    <span>{monthLabel(m.month, useEnglish)}</span>
                    <span className="text-xs opacity-70">{m.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
