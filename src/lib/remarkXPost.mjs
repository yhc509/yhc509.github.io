import { visit } from "unist-util-visit";

const STATUS_URL =
  /^https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d+)(?:[/?#][^\s]*)?$/i;

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function statusIdFromUrl(raw) {
  const value = raw.trim().replace(/[)\].,!?;:]+$/g, "");
  const match = STATUS_URL.exec(value);
  return match ? match[2] : null;
}

/**
 * A paragraph whose only content is a bare status URL, including a GFM autolink.
 * @param {any} node
 * @returns {string | null}
 */
function statusIdFromParagraph(node) {
  const children = (node.children ?? []).filter((child) => {
    return !(child?.type === "text" && String(child.value).trim() === "");
  });

  if (children.length !== 1) {
    return null;
  }

  const only = children[0];

  if (only.type === "link" && typeof only.url === "string") {
    const hrefId = statusIdFromUrl(only.url);
    if (!hrefId) {
      return null;
    }

    const text = (only.children ?? [])
      .filter((child) => child?.type === "text")
      .map((child) => child.value)
      .join("");
    return statusIdFromUrl(text) === hrefId ? hrefId : null;
  }

  if (only.type === "text" && typeof only.value === "string") {
    return statusIdFromUrl(only.value);
  }

  return null;
}

/** Turns a lone x.com / twitter.com status URL into an `<XPost>` element. */
export function remarkXPost() {
  return function transform(tree) {
    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || typeof index !== "number" || !Array.isArray(parent.children)) {
        return;
      }

      const id = statusIdFromParagraph(node);
      if (!id) {
        return;
      }

      parent.children[index] = {
        type: "mdxJsxFlowElement",
        name: "XPost",
        attributes: [
          {
            type: "mdxJsxAttribute",
            name: "id",
            value: id,
          },
        ],
        children: [],
      };
    });
  };
}
