/**
 * A devlog with a project is read from that project page.
 * It stays out of the home list, RSS, and other post feeds.
 * A devlog without a project stays in those feeds.
 * @param {{ type?: unknown, project?: unknown } | null | undefined} post
 */
export function isProjectDevlog(post) {
  return (
    post?.type === "devlog" &&
    typeof post.project === "string" &&
    post.project.trim().length > 0
  );
}
