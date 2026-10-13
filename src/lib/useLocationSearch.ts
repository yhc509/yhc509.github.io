"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "locationsearchchange";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

const getSnapshot = () => window.location.search;
const getServerSnapshot = () => "";

// Reads the query string only on the client, so static HTML renders the unfiltered list
// instead of bailing out to a Suspense boundary the way useSearchParams does.
export function useLocationSearch() {
  const search = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const navigate = useCallback((url: string, mode: "push" | "replace" = "push") => {
    if (mode === "push") {
      window.history.pushState(null, "", url);
    } else {
      window.history.replaceState(null, "", url);
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [new URLSearchParams(search), navigate] as const;
}
