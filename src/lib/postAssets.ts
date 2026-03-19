import { visit } from "unist-util-visit";

const assetPropertyKeys = new Set(["src", "poster"]);

interface AssetNodeCandidate {
  type?: string;
  url?: unknown;
  value?: unknown;
  attributes?: unknown;
}

interface AssetAttributeCandidate {
  type?: string;
  name?: unknown;
  value?: unknown;
}

export function resolvePostAssetSrc(src: string | undefined, postDir: string) {
  if (!src) {
    return src;
  }

  if (
    src.startsWith("http") ||
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

function rewriteHtmlAssetAttributes(value: string, postDir: string) {
  return value.replace(
    /\b(src|poster)=["']([^"']+)["']/g,
    (_match, attributeName: string, attributeValue: string) => {
      const resolvedValue = resolvePostAssetSrc(attributeValue, postDir);
      return `${attributeName}="${resolvedValue ?? attributeValue}"`;
    }
  );
}

export function createPostAssetRemarkPlugin(postDir: string) {
  return function remarkPostAssetPaths() {
    return function transform(tree: unknown) {
      visit(tree, (node: unknown) => {
        const assetNode = node as AssetNodeCandidate;

        if (assetNode.type === "image" && typeof assetNode.url === "string") {
          assetNode.url = resolvePostAssetSrc(assetNode.url, postDir);
          return;
        }

        if (
          (assetNode.type === "mdxJsxFlowElement" ||
            assetNode.type === "mdxJsxTextElement") &&
          Array.isArray(assetNode.attributes)
        ) {
          assetNode.attributes = assetNode.attributes.map((attribute: unknown) => {
            const assetAttribute = attribute as AssetAttributeCandidate;

            if (
              assetAttribute.type !== "mdxJsxAttribute" ||
              typeof assetAttribute.name !== "string" ||
              !assetPropertyKeys.has(assetAttribute.name) ||
              typeof assetAttribute.value !== "string"
            ) {
              return assetAttribute;
            }

            return {
              ...assetAttribute,
              value: resolvePostAssetSrc(assetAttribute.value, postDir),
            };
          });
          return;
        }

        if (assetNode.type === "html" && typeof assetNode.value === "string") {
          assetNode.value = rewriteHtmlAssetAttributes(assetNode.value, postDir);
        }
      });
    };
  };
}
