import { useState } from "react";
import type { DiffNode, DiffStatus } from "./diff";

const statusTextClass: Record<DiffStatus, string> = {
  added: "text-success",
  removed: "text-error",
  changed: "text-warning",
  unchanged: "text-fg-muted",
};

function formatValue(value: unknown): string {
  if (value === undefined) return "—";
  return JSON.stringify(value);
}

function keyLabel(node: DiffNode): string | null {
  if (node.key === null) return null;
  return typeof node.key === "number" ? `[${node.key}]` : node.key;
}

function summary(node: DiffNode): string {
  if (node.kind === "leaf") return "";
  const count = node.children?.length ?? 0;
  const noun = node.kind === "array" ? (count === 1 ? "item" : "items") : count === 1 ? "key" : "keys";
  return node.kind === "array" ? `[${count} ${noun}]` : `{${count} ${noun}}`;
}

/** An object/array node is worth opening by default when it's shallow and
 * actually contains a difference; an unchanged subtree stays collapsed so
 * the tree reads as "here's what differs", not a full re-render of both
 * documents. */
function defaultExpanded(node: DiffNode, depth: number): boolean {
  if (node.kind === "leaf") return false;
  if (node.status === "unchanged") return false;
  return depth < 2;
}

interface RowProps {
  node: DiffNode;
  depth: number;
  path: string;
  overrides: Record<string, boolean>;
  onToggle: (path: string) => void;
}

function DiffRow({ node, depth, path, overrides, onToggle }: RowProps) {
  const label = keyLabel(node);
  const tone = statusTextClass[node.status];
  const indentStyle = { paddingLeft: `${depth * 1.25}rem` };

  if (node.kind === "leaf") {
    return (
      <div className="px-3 py-0.5 font-mono text-sm whitespace-pre-wrap break-words" style={indentStyle}>
        {label !== null && <span className="text-fg-muted">{label}: </span>}
        {node.status === "changed" ? (
          <span className={tone}>
            <span className="line-through opacity-70">{formatValue(node.oldValue)}</span>
            {" → "}
            <span>{formatValue(node.newValue)}</span>
          </span>
        ) : node.status === "added" ? (
          <span className={tone}>{formatValue(node.newValue)}</span>
        ) : node.status === "removed" ? (
          <span className={tone}>{formatValue(node.oldValue)}</span>
        ) : (
          <span className={tone}>{formatValue(node.oldValue)}</span>
        )}
      </div>
    );
  }

  const expanded = overrides[path] ?? defaultExpanded(node, depth);
  const children = node.children ?? [];

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(path)}
        className="flex w-full items-center gap-1.5 px-3 py-0.5 text-left font-mono text-sm hover:bg-surface"
        style={indentStyle}
        aria-expanded={expanded}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`size-3 shrink-0 text-fg-muted transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
        {label !== null && <span className="text-fg-muted">{label}: </span>}
        <span className={tone}>{summary(node)}</span>
      </button>
      {expanded &&
        children.map((child, i) => (
          <DiffRow
            key={`${path}.${child.key ?? i}`}
            node={child}
            depth={depth + 1}
            path={`${path}.${child.key ?? i}`}
            overrides={overrides}
            onToggle={onToggle}
          />
        ))}
    </div>
  );
}

export default function DiffTreeView({ root }: { root: DiffNode }) {
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  function handleToggle(path: string) {
    setOverrides((prev) => ({ ...prev, [path]: !(prev[path] ?? defaultExpandedForPath(root, path)) }));
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-bg py-2">
      <DiffRow node={root} depth={0} path="root" overrides={overrides} onToggle={handleToggle} />
    </div>
  );
}

/** Re-derives what a path's default expansion would have been, so the first
 * click on a node always flips its current (possibly default) state rather
 * than assuming it was collapsed. */
function defaultExpandedForPath(root: DiffNode, path: string): boolean {
  const parts = path.split(".").slice(1);
  let node = root;
  let depth = 0;
  for (const part of parts) {
    const next = node.children?.find((c) => String(c.key) === part);
    if (!next) break;
    node = next;
    depth++;
  }
  return defaultExpanded(node, depth);
}
