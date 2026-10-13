import { visit } from "unist-util-visit";

const ASSET_ATTRIBUTES = new Set(["src", "poster"]);

/**
 * @param {string | undefined} src
 * @param {string} postDir
 * @returns {string | undefined}
 */
export function resolvePostAssetSrc(src, postDir) {
  if (!src) {
    return src;
  }

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src;
  }

  const cleanSrc = src.replace(/^\.\//, "");
  const relativePath = postDir ? `${postDir}/${cleanSrc}` : cleanSrc;
  return `/posts-images/${relativePath}`;
}

/** @param {string} postDir */
export function createPostAssetRemarkPlugin(postDir) {
  return function remarkPostAssetPaths() {
    /** @param {import("unist").Node} tree */
    return function transform(tree) {
      visit(tree, (/** @type {any} */ node) => {
        if (node.type === "image" && typeof node.url === "string") {
          node.url = resolvePostAssetSrc(node.url, postDir);
          return;
        }

        if (
          (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
          Array.isArray(node.attributes)
        ) {
          node.attributes = node.attributes.map((/** @type {any} */ attribute) => {
            if (
              attribute?.type !== "mdxJsxAttribute" ||
              !ASSET_ATTRIBUTES.has(attribute.name) ||
              typeof attribute.value !== "string"
            ) {
              return attribute;
            }

            return { ...attribute, value: resolvePostAssetSrc(attribute.value, postDir) };
          });
          return;
        }

        if (node.type === "html" && typeof node.value === "string") {
          node.value = node.value.replace(
            /\b(src|poster)=["']([^"']+)["']/g,
            (/** @type {string} */ _match, /** @type {string} */ name, /** @type {string} */ value) =>
              `${name}="${resolvePostAssetSrc(value, postDir) ?? value}"`
          );
        }
      });
    };
  };
}

/**
 * Formats a front-matter date as local YYYY-MM-DD, or returns null when it is missing or invalid.
 * @param {unknown} raw
 * @returns {string | null}
 */
export function formatPostDate(raw) {
  if (!raw) {
    return null;
  }

  const date = raw instanceof Date ? raw : new Date(/** @type {string | number} */ (raw));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
