"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import type { TagNode } from "@/lib/posts";

interface TagFilterProps {
  tagTree: TagNode[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

type TagGroupKey = "game-engine" | "graphics" | "ai";

interface TagGroup {
  key: TagGroupKey;
  label: string;
  count: number;
  defaultExpanded: boolean;
  nodes: TagNode[];
}

const TAG_GROUP_CONFIG: Record<
  TagGroupKey,
  { label: string; defaultExpanded: boolean }
> = {
  "game-engine": { label: "Game Engine", defaultExpanded: true },
  graphics: { label: "Graphics", defaultExpanded: true },
  ai: { label: "AI", defaultExpanded: true },
};

function getTagGroupKey(fullPath: string): TagGroupKey | undefined {
  if (fullPath === "Game Engine") {
    return "game-engine";
  }
  if (fullPath === "Graphics") {
    return "graphics";
  }
  if (fullPath === "AI") {
    return "ai";
  }
  return undefined;
}

function buildTagGroups(tagTree: TagNode[]): TagGroup[] {
  const groups = new Map<TagGroupKey, TagNode[]>();

  tagTree.forEach((node) => {
    const groupKey = getTagGroupKey(node.fullPath);
    if (!groupKey) {
      return;
    }
    const nodes = groups.get(groupKey) ?? [];
    nodes.push(node);
    groups.set(groupKey, nodes);
  });

  return (Object.entries(TAG_GROUP_CONFIG) as Array<
    [TagGroupKey, { label: string; defaultExpanded: boolean }]
  >)
    .map(([key, config]) => {
      const nodes = groups.get(key) ?? [];
      return {
        key,
        label: config.label,
        count: nodes.reduce((sum, node) => sum + node.count, 0),
        defaultExpanded: config.defaultExpanded,
        nodes,
      };
    })
    .filter((group) => group.nodes.length > 0);
}

function TagItem({
  node,
  selectedTags,
  onSelect,
  onAdd,
  onRemove,
  label,
  depth = 0,
}: {
  node: TagNode;
  selectedTags: string[];
  onSelect: (tag: string) => void;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  label?: string;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedTags.includes(node.fullPath);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 cursor-pointer group"
        style={{ paddingLeft: `${depth * 12}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-4 h-4 flex items-center justify-center text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {expanded ? "▼" : "▶"}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <button
          onClick={() => onSelect(node.fullPath)}
          className={`flex items-center gap-2 text-sm transition-colors ${isSelected ? "font-medium" : ""
            }`}
          style={{
            color: isSelected ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          <span className="group-hover:underline">#{label ?? node.name}</span>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {node.count}
          </span>
        </button>
        {hovered && !isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(node.fullPath);
            }}
            className="w-5 h-5 flex items-center justify-center text-xs rounded transition-all hover:scale-110"
            style={{
              color: "var(--accent)",
              backgroundColor: "var(--card-border)",
            }}
            title="선택에 추가"
          >
            +
          </button>
        )}
        {hovered && isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(node.fullPath);
            }}
            className="w-5 h-5 flex items-center justify-center text-xs rounded transition-all hover:scale-110"
            style={{
              color: "var(--text-muted)",
              backgroundColor: "var(--card-border)",
            }}
            title="선택에서 제거"
          >
            −
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TagItem
              key={child.fullPath}
              node={child}
              selectedTags={selectedTags}
              onSelect={onSelect}
              onAdd={onAdd}
              onRemove={onRemove}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TagGroupSection({
  group,
  children,
}: {
  group: TagGroup;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(group.defaultExpanded);

  return (
    <section className="border-t pt-3 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mb-2 flex w-full items-center justify-between text-left"
      >
        <span
          className="text-xs font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--text-muted)" }}
        >
          {group.label}
        </span>
        <span
          className="flex items-center gap-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <span>{group.count}</span>
          <span>{expanded ? "−" : "+"}</span>
        </span>
      </button>
      {expanded && <div>{children}</div>}
    </section>
  );
}

export function TagFilter({
  tagTree,
  selectedTags,
  onTagsChange,
}: TagFilterProps) {
  // 단일 선택: 해당 태그만 선택
  const handleSelect = (tag: string) => {
    if (selectedTags.includes(tag) && selectedTags.length === 1) {
      // 이미 선택된 유일한 태그를 다시 클릭하면 해제
      onTagsChange([]);
    } else {
      // 해당 태그만 선택
      onTagsChange([tag]);
    }
  };

  // 추가 선택: 기존 선택에 추가
  const handleAdd = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  // 선택 해제: 기존 선택에서 제거
  const handleRemove = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const handleClear = () => {
    onTagsChange([]);
  };

  const tagGroups = buildTagGroups(tagTree);

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm">Topics</h2>
        {selectedTags.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs px-2 py-1 rounded transition-colors"
            style={{
              color: "var(--text-muted)",
              backgroundColor: "var(--card-border)",
            }}
          >
            초기화
          </button>
        )}
      </div>
      <div className="space-y-4">
        {tagGroups.map((group) => (
          <TagGroupSection key={group.key} group={group}>
            {group.nodes.map((node) => (
              <TagItem
                key={node.fullPath}
                node={node}
                selectedTags={selectedTags}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onRemove={handleRemove}
                label={node.children.length === 0 ? undefined : "전체"}
              />
            ))}
          </TagGroupSection>
        ))}
      </div>
    </div>
  );
}
