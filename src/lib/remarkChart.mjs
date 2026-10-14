import { visit } from "unist-util-visit";

/** Turns a ```chart fenced block into a `<Chart spec="...">` element. */
export function remarkChart() {
  return function transform(tree) {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "chart" || !parent || typeof index !== "number") {
        return;
      }
      if (!Array.isArray(parent.children)) {
        return;
      }

      parent.children[index] = {
        type: "mdxJsxFlowElement",
        name: "Chart",
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
}
