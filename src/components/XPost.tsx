import { XPostCard } from "@/components/XPostCard";
import { isXPostId, loadXPost, xStatusUrl } from "@/lib/xPost";

export async function XPost({ id }: { id: string }) {
  const tweetId = String(id ?? "").trim();
  const tweet = await loadXPost(tweetId);

  if (!tweet) {
    return <XPostFallback id={tweetId} />;
  }

  return <XPostCard tweet={tweet} />;
}

export function XPostFallback({ id }: { id: string }) {
  const href = isXPostId(id) ? xStatusUrl(id) : null;

  if (!href) {
    return (
      <div className="x-post x-post-fallback not-prose" data-x-post-fallback="invalid">
        <span className="x-post-fallback__label">X</span>
        <span className="x-post-fallback__title">Post unavailable</span>
      </div>
    );
  }

  return (
    <a
      className="x-post x-post-fallback not-prose"
      data-x-post-fallback={id}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="x-post-fallback__label">X</span>
      <span className="x-post-fallback__title">View post</span>
      <span className="x-post-fallback__url">{href}</span>
    </a>
  );
}
