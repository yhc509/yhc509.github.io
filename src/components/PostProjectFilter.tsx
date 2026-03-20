"use client";

import { useState } from "react";
import type { PostProjectOption } from "@/lib/posts";

interface PostProjectFilterProps {
  projects: PostProjectOption[];
  selectedProjects: string[];
  onProjectsChange: (projects: string[]) => void;
}

export function PostProjectFilter({
  projects,
  selectedProjects,
  onProjectsChange,
}: PostProjectFilterProps) {
  const handleSelect = (projectSlug: string) => {
    if (selectedProjects.includes(projectSlug) && selectedProjects.length === 1) {
      onProjectsChange([]);
      return;
    }

    onProjectsChange([projectSlug]);
  };

  const handleAdd = (projectSlug: string) => {
    if (!selectedProjects.includes(projectSlug)) {
      onProjectsChange([...selectedProjects, projectSlug]);
    }
  };

  const handleRemove = (projectSlug: string) => {
    onProjectsChange(selectedProjects.filter((slug) => slug !== projectSlug));
  };

  const handleClear = () => {
    onProjectsChange([]);
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-sm">Projects</h2>
        {selectedProjects.length > 0 && (
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

      <div className="space-y-1">
        {projects.map((project) => (
          <ProjectItem
            key={project.slug}
            project={project}
            selectedProjects={selectedProjects}
            onSelect={handleSelect}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectItem({
  project,
  selectedProjects,
  onSelect,
  onAdd,
  onRemove,
}: {
  project: PostProjectOption;
  selectedProjects: string[];
  onSelect: (projectSlug: string) => void;
  onAdd: (projectSlug: string) => void;
  onRemove: (projectSlug: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedProjects.includes(project.slug);

  return (
    <div
      className="flex items-center gap-1 py-1 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="w-4" />
      <button
        type="button"
        onClick={() => onSelect(project.slug)}
        className={`flex items-center gap-2 text-sm transition-colors ${
          isSelected ? "font-medium" : ""
        }`}
        style={{
          color: isSelected ? "var(--accent)" : "var(--text-secondary)",
        }}
      >
        <span className="group-hover:underline truncate">{project.title}</span>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {project.count}
        </span>
      </button>
      {hovered && !isSelected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(project.slug);
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
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(project.slug);
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
  );
}
