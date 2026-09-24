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

type GraphRendererProps = {
  nodes: readonly GraphRendererNode[];
  edges: readonly GraphRendererEdge[];
  ariaLabel: string;
  currentId?: string | null;
  targetId?: string | null;
  queuedIds?: readonly string[];
  visitedIds?: readonly string[];
  pathIds?: readonly string[];
  activeEdgeKeys?: readonly string[];
};

export function GraphRenderer({
  nodes,
  edges,
  ariaLabel,
  currentId = null,
  targetId = null,
  queuedIds = [],
  visitedIds = [],
  pathIds = [],
  activeEdgeKeys = [],
}: GraphRendererProps) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const queued = new Set(queuedIds);
  const visited = new Set(visitedIds);
  const path = new Set(pathIds);
  const pathEdges = new Set(pathIds.slice(0, -1).map((nodeId, index) => `${nodeId}->${pathIds[index + 1]}`));
  const activeEdges = new Set(activeEdgeKeys);

  return (
    <svg className="graph-renderer" viewBox="0 0 640 360" role="img" aria-label={ariaLabel}>
      <defs>
        <marker id="agocode-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
        </marker>
      </defs>

      <g className="graph-renderer__edges">
        {edges.map((edge, index) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;
          const edgeKey = `${edge.from}->${edge.to}`;
          const active = pathEdges.has(edgeKey) || pathEdges.has(`${edge.to}->${edge.from}`) || activeEdges.has(edgeKey);
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          return (
            <g key={`${edge.from}-${edge.to}-${index}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={`graph-renderer__edge ${active ? "graph-renderer__edge--path" : ""}`}
                markerEnd={edge.directed ? "url(#agocode-arrow)" : undefined}
              />
              {edge.label !== undefined ? (
                <g className="graph-renderer__edge-label" transform={`translate(${midX} ${midY})`}>
                  <rect x="-16" y="-11" width="32" height="22" rx="3" />
                  <text textAnchor="middle" dominantBaseline="central">{edge.label}</text>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>

      <g className="graph-renderer__nodes">
        {nodes.map((node) => {
          const classes = [
            "graph-renderer__node",
            visited.has(node.id) ? "graph-renderer__node--visited" : "",
            queued.has(node.id) ? "graph-renderer__node--queued" : "",
            path.has(node.id) ? "graph-renderer__node--path" : "",
            node.id === targetId ? "graph-renderer__node--target" : "",
            node.id === currentId ? "graph-renderer__node--current" : "",
          ].filter(Boolean).join(" ");

          return (
            <g className={classes} transform={`translate(${node.x} ${node.y})`} key={node.id}>
              <circle r="28" />
              <text textAnchor="middle" dominantBaseline="central">{node.label}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
