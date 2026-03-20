"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

export function Comments() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const scriptLoaded = useRef(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!ref.current || scriptLoaded.current) return;

    const scriptEl = document.createElement("script");
    scriptEl.src = "https://giscus.app/client.js";
    scriptEl.async = true;
    scriptEl.crossOrigin = "anonymous";

    scriptEl.setAttribute("data-repo", "yhc509/yhc509.github.io");
    scriptEl.setAttribute("data-repo-id", "R_kgDON6V84g");
    scriptEl.setAttribute("data-category", "Announcements");
    scriptEl.setAttribute("data-category-id", "DIC_kwDON6V84s4C0vjn");
    scriptEl.setAttribute("data-mapping", "pathname");
    scriptEl.setAttribute("data-strict", "0");
    scriptEl.setAttribute("data-reactions-enabled", "1");
    scriptEl.setAttribute("data-emit-metadata", "0");
    scriptEl.setAttribute("data-input-position", "bottom");
    scriptEl.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    scriptEl.setAttribute("data-lang", "ko");

    scriptEl.onerror = () => setLoadFailed(true);

    ref.current.appendChild(scriptEl);
    scriptLoaded.current = true;
  }, [theme]);

  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    if (iframe) {
      iframe.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: theme === "dark" ? "dark" : "light",
            },
          },
        },
        "https://giscus.app"
      );
    }
  }, [theme]);

  return (
    <section
      ref={ref}
      className="mt-12 pt-8 border-t"
      style={{ borderColor: "var(--card-border)" }}
    >
      {loadFailed && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          댓글을 불러올 수 없습니다.
        </p>
      )}
    </section>
  );
}
