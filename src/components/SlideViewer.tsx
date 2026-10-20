"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { KoreanFallbackNote } from "@/components/KoreanFallbackNote";
import type { DevLanguage } from "@/lib/devLanguage";

type ViewMode = "scroll" | "presenter";

const PORTRAIT_PHONE = "(orientation: portrait) and (max-width: 767px)";

function readHash(total: number): number | null {
  const match = /^#(\d+)$/.exec(window.location.hash);
  if (!match) {
    return null;
  }
  const number = Number(match[1]);
  if (!Number.isInteger(number) || number < 1 || number > total) {
    return null;
  }
  return number - 1;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribePortrait(onChange: () => void) {
  const media = window.matchMedia(PORTRAIT_PHONE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function portraitSnapshot() {
  return window.matchMedia(PORTRAIT_PHONE).matches;
}

export function SlideViewer({
  slides,
  label,
  title,
  date,
  backHref,
  backLabel,
  note,
  language,
  contentLanguage,
}: {
  slides: string[];
  label: string;
  title: string;
  date: string;
  backHref: string;
  backLabel: string;
  note: string | null;
  language: DevLanguage;
  contentLanguage: DevLanguage;
}) {
  const useEnglish = language === "en";
  const total = slides.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const modeRef = useRef<ViewMode>("presenter");
  const pointerRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const portraitPhone = useSyncExternalStore(subscribePortrait, portraitSnapshot, () => false);
  const hashIndex = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("hashchange", onChange);
      return () => window.removeEventListener("hashchange", onChange);
    },
    () => readHash(total) ?? 0,
    () => 0,
  );
  const [modeOverride, setModeOverride] = useState<ViewMode | null>(null);
  const [manualIndex, setManualIndex] = useState<number | null>(null);
  const index = manualIndex ?? hashIndex;
  const [pseudoFs, setPseudoFs] = useState(false);
  const [nativeFs, setNativeFs] = useState(false);
  const fullscreen = pseudoFs || nativeFs;
  const effectiveMode: ViewMode = modeOverride ?? (portraitPhone ? "scroll" : "presenter");

  useEffect(() => {
    modeRef.current = effectiveMode;
    indexRef.current = index;
  }, [effectiveMode, index]);

  const writeHash = useCallback((next: number) => {
    const url = `${window.location.pathname}${window.location.search}#${next + 1}`;
    window.history.replaceState(null, "", url);
  }, []);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      indexRef.current = clamped;
      setManualIndex(clamped);
      writeHash(clamped);
      if (modeRef.current === "scroll") {
        document.getElementById(`slide-${clamped + 1}`)?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [total, writeHash],
  );

  useEffect(() => {
    const media = window.matchMedia(PORTRAIT_PHONE);
    const onChange = () => {
      setModeOverride(null);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onHash = () => {
      setManualIndex(null);
      if (modeRef.current !== "scroll") {
        return;
      }
      const hashed = readHash(total);
      if (hashed == null) {
        return;
      }
      document.getElementById(`slide-${hashed + 1}`)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [total]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.metaKey || event.ctrlKey) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        go(indexRef.current + 1);
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        go(indexRef.current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        go(0);
      } else if (event.key === "End") {
        event.preventDefault();
        go(total - 1);
      } else if (event.key === "Escape" && pseudoFs) {
        setPseudoFs(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, pseudoFs, total]);

  useEffect(() => {
    const onChange = () => {
      setNativeFs(document.fullscreenElement === rootRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [fullscreen]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const sheets = [...root.querySelectorAll<HTMLElement>(".slide-sheet")];
    sheets.forEach((sheet, sheetIndex) => {
      const active = sheetIndex === index;
      sheet.querySelectorAll("img").forEach((image) => {
        const near = Math.abs(sheetIndex - index) <= 1;
        if (near && image.loading === "lazy") {
          image.loading = "eager";
        }
      });
      sheet.querySelectorAll("video").forEach((video) => {
        if (active && video.dataset.autoplay === "true") {
          video.preload = "auto";
          void video.play().catch(() => {});
        } else {
          video.pause();
          if (!active) {
            video.preload = "none";
          }
        }
      });
    });
  }, [index, effectiveMode, slides]);

  useEffect(() => {
    if (effectiveMode !== "scroll") {
      return;
    }
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      return;
    }
    const sheets = [...root.querySelectorAll<HTMLElement>(".slide-sheet")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) {
          return;
        }
        const next = sheets.indexOf(visible.target as HTMLElement);
        if (next >= 0 && next !== indexRef.current) {
          indexRef.current = next;
          setManualIndex(next);
          writeHash(next);
        }
      },
      { root: null, threshold: [0.55, 0.75] },
    );
    sheets.forEach((sheet) => observer.observe(sheet));
    return () => observer.disconnect();
  }, [effectiveMode, slides, writeHash]);

  const toggleMode = () => {
    const next: ViewMode = effectiveMode === "scroll" ? "presenter" : "scroll";
    modeRef.current = next;
    setModeOverride(next);
    if (next === "scroll") {
      window.requestAnimationFrame(() => {
        document.getElementById(`slide-${indexRef.current + 1}`)?.scrollIntoView({
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  const toggleFullscreen = async () => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    if (fullscreen) {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      }
      setPseudoFs(false);
      return;
    }
    const request = root.requestFullscreen?.bind(root);
    if (typeof request !== "function") {
      setPseudoFs(true);
      return;
    }
    try {
      await request();
    } catch {
      setPseudoFs(true);
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || effectiveMode !== "presenter") {
      return;
    }
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("a, button, video, input, textarea, select")
    ) {
      return;
    }
    pointerRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerRef.current;
    pointerRef.current = null;
    if (!start || start.id !== event.pointerId || effectiveMode !== "presenter") {
      return;
    }
    if (start.x < 24) {
      return;
    }
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) {
        return;
      }
      const ratio = (event.clientX - rect.left) / rect.width;
      if (ratio < 0.3) {
        go(indexRef.current - 1);
      } else if (ratio > 0.7) {
        go(indexRef.current + 1);
      }
      return;
    }
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      go(indexRef.current + (dx < 0 ? 1 : -1));
    }
  };

  const labels = useEnglish
    ? {
        previous: "Previous slide",
        next: "Next slide",
        fullscreen: "Full screen",
        exitFullscreen: "Exit full screen",
        toScroll: "Show slides in a list",
        toPresenter: "Show one slide",
        position: `Slide ${index + 1} of ${total}`,
      }
    : {
        previous: "이전 슬라이드",
        next: "다음 슬라이드",
        fullscreen: "전체 화면",
        exitFullscreen: "전체 화면 종료",
        toScroll: "슬라이드를 세로로 보기",
        toPresenter: "한 장씩 보기",
        position: `${index + 1} / ${total} 슬라이드`,
      };

  return (
    <div
      ref={rootRef}
      className={`deck-page${fullscreen ? " is-fs" : ""}`}
      data-mode={modeOverride ?? undefined}
    >
      <div className="deck-top">
        <Link href={backHref} className="deck-back">
          {backLabel}
        </Link>
        <h1 lang={contentLanguage}>{title}</h1>
        <time dateTime={date}>{date}</time>
      </div>
      <KoreanFallbackNote show={note != null} message={note ?? ""} />
      <div className="slide-controls">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label={labels.previous}
        >
          <Chevron direction="left" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index >= total - 1}
          aria-label={labels.next}
        >
          <Chevron direction="right" />
        </button>
        <p className="slide-count" aria-live="polite" aria-atomic="true">
          <span aria-label={labels.position}>
            {index + 1} / {total}
          </span>
        </p>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
          aria-pressed={fullscreen}
          data-action="fullscreen"
        >
          {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
        <button
          type="button"
          onClick={toggleMode}
          aria-label={effectiveMode === "scroll" ? labels.toPresenter : labels.toScroll}
          aria-pressed={effectiveMode === "presenter"}
          data-action="mode"
        >
          {effectiveMode === "scroll" ? <PresenterIcon /> : <ScrollIcon />}
        </button>
      </div>
      <div
        ref={stageRef}
        className="slide-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-roledescription={useEnglish ? "slideshow" : "발표"}
        aria-label={label}
      >
        <div className="slide-frame" lang={contentLanguage}>
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              id={`slide-${slideIndex + 1}`}
              className="marpit slide-sheet"
              data-slide={slideIndex + 1}
              data-active={slideIndex === index ? "true" : "false"}
              dangerouslySetInnerHTML={{ __html: slide }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 9 4 4 9 4" />
      <polyline points="20 9 20 4 15 4" />
      <polyline points="4 15 4 20 9 20" />
      <polyline points="20 15 20 20 15 20" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 4 9 9 4 9" />
      <polyline points="15 4 15 9 20 9" />
      <polyline points="9 20 9 15 4 15" />
      <polyline points="15 20 15 15 20 15" />
    </svg>
  );
}

function ScrollIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function PresenterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="8" y1="22" x2="16" y2="22" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}
