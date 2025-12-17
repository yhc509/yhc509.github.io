"use client";

import { useState } from "react";
import type { TagNode } from "@/lib/posts";

interface TagFilterProps {
  tagTree: TagNode[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

function TagItem({
  node,
  selectedTags,
  onToggle,
  depth = 0,
}: {
  node: TagNode;
  selectedTags: string[];
  onToggle: (tag: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedTags.includes(node.fullPath);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1 cursor-pointer group"
        style={{ paddingLeft: `${depth * 12}px` }}
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
          onClick={() => onToggle(node.fullPath)}
          className={`flex items-center gap-2 text-sm transition-colors ${
            isSelected ? "font-medium" : ""
          }`}
          style={{
            color: isSelected ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          <span className="group-hover:underline">#{node.name}</span>
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {node.count}
          </span>
        </button>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TagItem
              key={child.fullPath}
              node={child}
              selectedTags={selectedTags}
              onToggle={onToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TagFilter({
  tagTree,
  selectedTags,
  onTagsChange,
}: TagFilterProps) {
  const handleToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClear = () => {
    onTagsChange([]);
  };

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm">Tags</h2>
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
      <div>
        {tagTree.map((node) => (
          <TagItem
            key={node.fullPath}
            node={node}
            selectedTags={selectedTags}
            onToggle={handleToggle}
          />
        ))}
      </div>
    </div>
  );
}
