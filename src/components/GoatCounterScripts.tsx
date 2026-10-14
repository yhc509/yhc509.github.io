import { GOATCOUNTER_ENDPOINT, GOATCOUNTER_SCRIPT } from "@/lib/analytics";
import { GOATCOUNTER_SCRIPT_ID, GoatCounterTracker } from "@/components/GoatCounter";

/** GoatCounter SPA setup from goatcounter.com/help/spa: no_onload, then count() per route in GoatCounterTracker. */
export function GoatCounterScripts() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "window.goatcounter = window.goatcounter || {}; window.goatcounter.no_onload = true;" }} />
      <script id={GOATCOUNTER_SCRIPT_ID} data-goatcounter={GOATCOUNTER_ENDPOINT} async src={GOATCOUNTER_SCRIPT} />
      <GoatCounterTracker />
    </>
  );
}
