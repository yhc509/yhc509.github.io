import { cache } from "react";
import { fetchTweet, type Tweet } from "react-tweet/api";

const X_POST_ID = /^[0-9]{1,40}$/;
const FETCH_TIMEOUT_MS = 12_000;

export function xStatusUrl(id: string) {
  return `https://x.com/i/status/${id}`;
}

export function isXPostId(id: string) {
  return X_POST_ID.test(id);
}

async function fetchXPost(id: string): Promise<Tweet | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timed out fetching X post ${id}`));
    }, FETCH_TIMEOUT_MS);
  });
  const pending = fetchTweet(id, { cache: "force-cache" });
  pending.catch(() => {
    // The race below also handles this rejection. Swallow a late failure
    // when the timeout wins so the build does not see an unhandled rejection.
  });

  try {
    const result = await Promise.race([pending, timeout]);
    return result.data ?? null;
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export const loadXPost = cache(async (id: string): Promise<Tweet | null> => {
  if (!isXPostId(id)) {
    return null;
  }

  try {
    return await fetchXPost(id);
  } catch (error) {
    console.warn(`X post ${id} could not be embedded.`, error);
    return null;
  }
});
