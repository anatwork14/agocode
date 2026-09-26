export type RendererBaseProps = {
  ariaLabel: string;
};

export type GraphRendererNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type GraphRendererEdge = {
  from: string;
  to: string;
  directed?: boolean;
  label?: string | number;
};

export type GraphRendererContract = RendererBaseProps & {
  nodes: readonly GraphRendererNode[];
  edges: readonly GraphRendererEdge[];
  currentId?: string | null;
  targetId?: string | null;
  queuedIds?: readonly string[];
  visitedIds?: readonly string[];
  pathIds?: readonly string[];
  activeEdgeKeys?: readonly string[];
};

export type QueueRendererItem = {
  id: string;
  label: string;
  detail?: string;
  state?: "queued" | "current" | "visited";
};

export type QueueRendererContract = RendererBaseProps & {
  items: readonly QueueRendererItem[];
  emptyLabel?: string;
};

export type StackRendererItem = {
  id: string;
  title: string;
  detail?: string;
  state?: "active" | "waiting" | "base" | "returning" | "paused";
};

export type StackRendererContract = RendererBaseProps & {
  items: readonly StackRendererItem[];
  emptyLabel?: string;
  topFirst?: boolean;
};

export function graphEdgeKey(from: string, to: string) {
  return `${from}->${to}`;
}

export function validateGraphRendererContract(
  nodes: readonly GraphRendererNode[],
  edges: readonly GraphRendererEdge[],
) {
  const errors: string[] = [];
  const nodeIds = new Set<string>();

  for (const node of nodes) {
    if (!node.id.trim()) errors.push("Graph nodes require a non-empty id.");
    if (nodeIds.has(node.id)) errors.push(`Duplicate graph node id: ${node.id}`);
    nodeIds.add(node.id);
    if (!node.label.trim()) errors.push(`Graph node ${node.id || "<empty>"} requires a label.`);
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      errors.push(`Graph node ${node.id || "<empty>"} requires finite coordinates.`);
    }
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.from)) errors.push(`Graph edge references unknown source node: ${edge.from}`);
    if (!nodeIds.has(edge.to)) errors.push(`Graph edge references unknown target node: ${edge.to}`);
  }

  return errors;
}

export function validateLinearRendererItems(items: readonly { id: string }[]) {
  const seen = new Set<string>();
  const errors: string[] = [];

  for (const item of items) {
    if (!item.id.trim()) errors.push("Renderer items require a non-empty id.");
    if (seen.has(item.id)) errors.push(`Duplicate renderer item id: ${item.id}`);
    seen.add(item.id);
  }

  return errors;
}
