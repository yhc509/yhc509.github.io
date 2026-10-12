"use client";

import { useEffect, useState } from "react";
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

const STORAGE_KEY = "archive-expanded-years";

function readStoredYears(): string[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((y): y is string => typeof y === "string") : null;
  } catch {
    return null;
  }
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

interface ArchiveFilterProps {
  archive: ArchiveYear[];
  selected: string;
  onSelect: (value: string) => void;
  collapsible?: boolean;
}

export function ArchiveFilter({ archive, selected, onSelect, collapsible = false }: ArchiveFilterProps) {
  const useEnglish = useDevLanguage() === "en";
  const headingLabel = useEnglish ? "Archive" : "아카이브";
  const allLabel = useEnglish ? "All" : "전체";
  const total = archive.reduce((sum, y) => sum + y.count, 0);
  const selectedYear = selected.slice(0, 4);
  const defaultYears = archive.length ? [archive[0].year] : [];

  const [expanded, setExpanded] = useState<string[]>(defaultYears);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredYears();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    if (stored) setExpanded(stored);
  }, []);

  const isOpen = (year: string) => expanded.includes(year) || year === selectedYear;

  const toggleYear = (year: string) => {
    const next = isOpen(year)
      ? expanded.filter((y) => y !== year)
      : [...expanded, year];
    setExpanded(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const itemClass = (active: boolean) =>
    `w-full flex items-center justify-between rounded px-2 py-1 text-left transition-colors ${
      active ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--card-border)]"
    }`;

  const tree = (
    <div className="space-y-1 text-sm">
      <button
        onClick={() => onSelect("")}
        aria-current={selected ? undefined : "true"}
        className={`${itemClass(!selected)} font-semibold`}
      >
        <span>{allLabel}</span>
        <span className="text-xs opacity-70">{total}</span>
      </button>
      {archive.map((year) => {
        const open = isOpen(year.year);
        const listId = `archive-${collapsible ? "m" : "d"}-${year.year}`;
        return (
          <section key={year.year}>
            <button
              onClick={() => toggleYear(year.year)}
              aria-expanded={open}
              aria-controls={listId}
              className={`${itemClass(false)} font-semibold`}
            >
              <span className="flex items-center gap-1.5">
                <Chevron open={open} />
                {year.year}
              </span>
              <span className="text-xs opacity-70">{year.count}</span>
            </button>
            {open && (
              <ul id={listId} className="mt-0.5 ml-5 space-y-0.5">
                {year.months.map((m) => (
                  <li key={m.key}>
                    <button
                      onClick={() => onSelect(selected === m.key ? "" : m.key)}
                      aria-current={selected === m.key ? "true" : undefined}
                      className={itemClass(selected === m.key)}
                      style={selected === m.key ? {} : { color: "var(--text-secondary)" }}
                    >
                      <span>{monthLabel(m.month, useEnglish)}</span>
                      <span className="text-xs opacity-70">{m.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );

  const boxStyle = { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" };

  if (collapsible) {
    return (
      <div className="rounded-xl border" style={boxStyle}>
        <button
          onClick={() => setPanelOpen((o) => !o)}
          aria-expanded={panelOpen}
          aria-controls="archive-mobile-panel"
          className="w-full flex items-center justify-between p-4 font-bold text-sm"
        >
          <span className="flex items-center gap-1.5">
            <Chevron open={panelOpen} />
            {headingLabel}
          </span>
          {selected && (
            <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
              {selected.length === 7
                ? `${selected.slice(0, 4)} ${monthLabel(Number(selected.slice(5, 7)), useEnglish)}`
                : selected}
            </span>
          )}
        </button>
        {panelOpen && (
          <div id="archive-mobile-panel" className="px-4 pb-4">
            {tree}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border" style={boxStyle}>
      <h2 className="font-bold text-sm mb-3">{headingLabel}</h2>
      {tree}
    </div>
  );
}
