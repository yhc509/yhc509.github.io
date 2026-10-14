import { visit } from "unist-util-visit";

/** Turns one fenced language into an MDX component with a `spec` attribute. */
export function remarkSpecBlock(lang, componentName) {
  return function remark() {
    return function transform(tree) {
      visit(tree, "code", (node, index, parent) => {
        if (node.lang !== lang || !parent || typeof index !== "number") return;
        if (!Array.isArray(parent.children)) return;

        parent.children[index] = {
          type: "mdxJsxFlowElement",
          name: componentName,
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "spec",
              value: typeof node.value === "string" ? node.value : "",
            },
          ],
          children: [],
        };
      });
    };
  };
}

export const remarkCards = remarkSpecBlock("cards", "Cards");
export const remarkMatrix = remarkSpecBlock("matrix", "Matrix");
