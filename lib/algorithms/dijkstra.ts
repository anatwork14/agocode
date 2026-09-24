export type WeightedGraph = Record<string, Record<string, number>>;

export type DijkstraEvent =
  | { type: "INIT"; start: string }
  | { type: "SELECT"; node: string; cost: number }
  | { type: "RELAX"; from: string; to: string; edgeWeight: number; candidate: number; previous: number }
  | { type: "UPDATE"; node: string; cost: number; parent: string }
  | { type: "KEEP"; node: string; cost: number }
  | { type: "PROCESS"; node: string }
  | { type: "COMPLETE"; target: string; cost: number; path: string[] | null };

export type DijkstraFrame = {
  event: DijkstraEvent;
  costs: Record<string, number>;
  parents: Record<string, string | null>;
  processed: string[];
  current: string | null;
  path: string[] | null;
  note: string;
};

export type DijkstraResult = {
  cost: number;
  path: string[] | null;
  costs: Record<string, number>;
  parents: Record<string, string | null>;
  processed: string[];
  frames: DijkstraFrame[];
};

function allNodes(graph: WeightedGraph) {
  const nodes = new Set<string>();
  for (const [node, neighbors] of Object.entries(graph)) {
    nodes.add(node);
    for (const neighbor of Object.keys(neighbors)) nodes.add(neighbor);
  }
  return [...nodes];
}

function validateWeights(graph: WeightedGraph) {
  for (const [from, neighbors] of Object.entries(graph)) {
    for (const [to, weight] of Object.entries(neighbors)) {
      if (!Number.isFinite(weight)) throw new Error(`Edge ${from} → ${to} must have a finite weight.`);
      if (weight < 0) throw new Error("Dijkstra's algorithm requires non-negative edge weights.");
    }
  }
}

function lowestUnprocessed(costs: Record<string, number>, processed: Set<string>) {
  let bestNode: string | null = null;
  let bestCost = Number.POSITIVE_INFINITY;
  for (const [node, cost] of Object.entries(costs)) {
    if (!processed.has(node) && cost < bestCost) {
      bestNode = node;
      bestCost = cost;
    }
  }
  return bestNode;
}

function reconstructPath(parents: Record<string, string | null>, start: string, target: string) {
  if (start === target) return [start];
  if (!(target in parents) || parents[target] === null) return null;

  const path: string[] = [];
  const seen = new Set<string>();
  let current: string | null = target;
  while (current !== null) {
    if (seen.has(current)) return null;
    seen.add(current);
    path.push(current);
    if (current === start) return path.reverse();
    current = parents[current] ?? null;
  }
  return null;
}

export function buildDijkstraTrace(graph: WeightedGraph, start: string, target: string): DijkstraResult {
  validateWeights(graph);
  const nodes = allNodes(graph);
  if (!nodes.includes(start)) throw new Error(`Unknown start node: ${start}`);
  if (!nodes.includes(target)) throw new Error(`Unknown target node: ${target}`);

  const costs: Record<string, number> = Object.fromEntries(nodes.map((node) => [node, Number.POSITIVE_INFINITY]));
  const parents: Record<string, string | null> = Object.fromEntries(nodes.map((node) => [node, null]));
  const processed = new Set<string>();
  const frames: DijkstraFrame[] = [];
  costs[start] = 0;

  const push = (event: DijkstraEvent, current: string | null, note: string, path: string[] | null = null) => {
    frames.push({
      event,
      costs: { ...costs },
      parents: { ...parents },
      processed: [...processed],
      current,
      path,
      note,
    });
  };

  push(
    { type: "INIT", start },
    null,
    `Set ${start} to cost 0 and every other node to infinity because no route to them is known yet.`,
  );

  let node = lowestUnprocessed(costs, processed);
  while (node !== null) {
    const cost = costs[node];
    push(
      { type: "SELECT", node, cost },
      node,
      `${node} is the cheapest unprocessed node currently known at cost ${cost}. With non-negative weights, that cost can now be finalized.`,
    );

    for (const [neighbor, weight] of Object.entries(graph[node] ?? {})) {
      const previous = costs[neighbor];
      const candidate = cost + weight;
      push(
        { type: "RELAX", from: node, to: neighbor, edgeWeight: weight, candidate, previous },
        node,
        `Try ${node} → ${neighbor}: ${cost} + ${weight} = ${candidate}. Compare that with the current cost ${Number.isFinite(previous) ? previous : "∞"}.`,
      );

      if (candidate < previous) {
        costs[neighbor] = candidate;
        parents[neighbor] = node;
        push(
          { type: "UPDATE", node: neighbor, cost: candidate, parent: node },
          node,
          `A cheaper route was found. Update ${neighbor} to cost ${candidate} and remember ${node} as its parent.`,
        );
      } else {
        push(
          { type: "KEEP", node: neighbor, cost: previous },
          node,
          `${neighbor} already has an equal or cheaper known route, so keep its current cost.`,
        );
      }
    }

    processed.add(node);
    push(
      { type: "PROCESS", node },
      node,
      `Mark ${node} processed. Dijkstra will not choose it as the cheapest node again.`,
    );
    node = lowestUnprocessed(costs, processed);
  }

  const finalCost = costs[target];
  const path = Number.isFinite(finalCost) ? reconstructPath(parents, start, target) : null;
  push(
    { type: "COMPLETE", target, cost: finalCost, path },
    null,
    path
      ? `Follow parents backward to recover ${path.join(" → ")} with total weight ${finalCost}.`
      : `${target} is unreachable from ${start}; its cost remains infinity.`,
    path,
  );

  return { cost: finalCost, path, costs, parents, processed: [...processed], frames };
}

export function dijkstraShortestPath(graph: WeightedGraph, start: string, target: string) {
  const result = buildDijkstraTrace(graph, start, target);
  return { cost: result.cost, path: result.path };
}
