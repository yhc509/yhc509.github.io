export interface TagNode {
  name: string;
  fullPath: string;
  children: TagNode[];
  count: number;
}

export function buildTagTree(items: { tags: string[] }[]): TagNode[] {
  const tagMap = new Map<string, number>();

  items.forEach((item) => {
    item.tags.forEach((tag) => {
      const parts = tag.split("/");
      for (let i = 1; i <= parts.length; i++) {
        const partialPath = parts.slice(0, i).join("/");
        tagMap.set(partialPath, (tagMap.get(partialPath) || 0) + 1);
      }
    });
  });

  const root: TagNode[] = [];
  const sortedTags = Array.from(tagMap.keys()).sort();

  sortedTags.forEach((tagPath) => {
    const parts = tagPath.split("/");
    if (parts.length === 1) {
      root.push({
        name: parts[0],
        fullPath: tagPath,
        children: [],
        count: tagMap.get(tagPath) || 0,
      });
    } else {
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const parentPath = parts.slice(0, i + 1).join("/");
        const parent = current.find((node) => node.fullPath === parentPath);
        if (parent) {
          current = parent.children;
        }
      }
      current.push({
        name: parts[parts.length - 1],
        fullPath: tagPath,
        children: [],
        count: tagMap.get(tagPath) || 0,
      });
    }
  });

  return root;
}
