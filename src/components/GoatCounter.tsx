"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ANALYTICS_HOSTS } from "@/lib/analytics";

type GoatCounterGlobal = { no_onload?: boolean; count?: (vars: { path: string }) => void };

export const GOATCOUNTER_SCRIPT_ID = "goatcounter-script";

/**
 * count.js loads with no_onload (see GoatCounterScripts), so nothing is sent automatically.
 * This sends one pageview per route, including client-side navigations, on production hosts only.
 */
export function GoatCounterTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!ANALYTICS_HOSTS.includes(window.location.hostname)) return;
    const send = () => {
      const goatcounter = (window as unknown as { goatcounter?: GoatCounterGlobal }).goatcounter;
      goatcounter?.count?.({ path: window.location.pathname + window.location.search });
    };
    const goatcounter = (window as unknown as { goatcounter?: GoatCounterGlobal }).goatcounter;
    if (goatcounter?.count) {
      send();
      return;
    }
    const script = document.getElementById(GOATCOUNTER_SCRIPT_ID);
    script?.addEventListener("load", send, { once: true });
    return () => script?.removeEventListener("load", send);
  }, [pathname]);

  return null;
}
