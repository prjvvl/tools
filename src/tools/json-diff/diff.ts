export type DiffStatus = "added" | "removed" | "changed" | "unchanged";
export type DiffKind = "object" | "array" | "leaf";

export interface DiffNode {
  /** Property key (object) or index (array); null for the root node. */
  key: string | number | null;
  status: DiffStatus;
  kind: DiffKind;
  /** Present for leaf nodes, and for kind-mismatch nodes rendered as a single changed value. */
  oldValue?: unknown;
  newValue?: unknown;
  /** Present for object/array nodes that were diffed structurally. */
  children?: DiffNode[];
}

function kindOf(value: unknown): DiffKind {
  if (Array.isArray(value)) return "array";
  if (value !== null && typeof value === "object") return "object";
  return "leaf";
}

/** Builds a subtree where every node is uniformly tagged "added" or "removed" (used when a key only exists on one side). */
function buildWhole(value: unknown, key: string | number | null, status: "added" | "removed"): DiffNode {
  const kind = kindOf(value);
  if (kind === "leaf") {
    return {
      key,
      status,
      kind,
      oldValue: status === "removed" ? value : undefined,
      newValue: status === "added" ? value : undefined,
    };
  }
  const entries: [string | number, unknown][] =
    kind === "array"
      ? (value as unknown[]).map((v, i) => [i, v])
      : Object.entries(value as Record<string, unknown>);
  return {
    key,
    status,
    kind,
    children: entries.map(([k, v]) => buildWhole(v, k, status)),
  };
}

function deriveStatus(children: DiffNode[]): DiffStatus {
  return children.length === 0 || children.every((c) => c.status === "unchanged") ? "unchanged" : "changed";
}

function diffNode(oldValue: unknown, newValue: unknown, key: string | number | null): DiffNode {
  const oldKind = kindOf(oldValue);
  const newKind = kindOf(newValue);

  if (oldKind !== newKind) {
    // Shape changed (e.g. a value went from an object to a string): treat as
    // a single changed leaf-style node rather than trying to diff mismatched
    // structures key-by-key.
    const equal = oldValue === newValue;
    return { key, status: equal ? "unchanged" : "changed", kind: "leaf", oldValue, newValue };
  }

  if (oldKind === "leaf") {
    const equal = oldValue === newValue;
    return { key, status: equal ? "unchanged" : "changed", kind: "leaf", oldValue, newValue };
  }

  if (oldKind === "array") {
    const oldArr = oldValue as unknown[];
    const newArr = newValue as unknown[];
    const maxLen = Math.max(oldArr.length, newArr.length);
    const children: DiffNode[] = [];
    for (let i = 0; i < maxLen; i++) {
      if (i >= oldArr.length) children.push(buildWhole(newArr[i], i, "added"));
      else if (i >= newArr.length) children.push(buildWhole(oldArr[i], i, "removed"));
      else children.push(diffNode(oldArr[i], newArr[i], i));
    }
    return { key, status: deriveStatus(children), kind: "array", children };
  }

  // Both objects.
  const oldObj = oldValue as Record<string, unknown>;
  const newObj = newValue as Record<string, unknown>;
  const oldKeys = Object.keys(oldObj);
  const newOnlyKeys = Object.keys(newObj).filter((k) => !Object.prototype.hasOwnProperty.call(oldObj, k));
  const orderedKeys = [...oldKeys, ...newOnlyKeys];

  const children: DiffNode[] = orderedKeys.map((k) => {
    const inOld = Object.prototype.hasOwnProperty.call(oldObj, k);
    const inNew = Object.prototype.hasOwnProperty.call(newObj, k);
    if (inOld && !inNew) return buildWhole(oldObj[k], k, "removed");
    if (!inOld && inNew) return buildWhole(newObj[k], k, "added");
    return diffNode(oldObj[k], newObj[k], k);
  });

  return { key, status: deriveStatus(children), kind: "object", children };
}

/** Produces a structural diff tree for two already-parsed JSON values. */
export function diffJson(oldValue: unknown, newValue: unknown): DiffNode {
  return diffNode(oldValue, newValue, null);
}
