"use client";

import { EmbeddedTweet } from "react-tweet";
import type { Tweet } from "react-tweet/api";
import "react-tweet/theme.css";

export function XPostCard({ tweet }: { tweet: Tweet }) {
  return (
    <div className="x-post not-prose" data-x-post={tweet.id_str}>
      <EmbeddedTweet tweet={tweet} />
    </div>
  );
}
