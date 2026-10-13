/** GoatCounter site code. Change only this if the account uses a different code. */
export const GOATCOUNTER_CODE = "kinkeep";
export const GOATCOUNTER_ENDPOINT = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
export const GOATCOUNTER_SCRIPT = "https://gc.zgo.at/count.js";

/** Only these hosts send pageviews. localhost, Tailscale previews and other hosts never count. */
export const ANALYTICS_HOSTS = ["kinkeep.dev", "www.kinkeep.dev", "yhc509.github.io"];
