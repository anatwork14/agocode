export type Graph = Record<string, string[]>;

export type BfsEvent =
  | { type: "INIT"; start: string }
  | { type: "DEQUEUE"; node: string; depth: number }
  | { type: "VISIT"; node: string; depth: number }
  | { type: "ENQUEUE"; from: string; nodes: string[]; depth: number }
  | { type: "SKIP"; node: string }
  | { type: "FOUND"; node: string; path: string[]; depth: number }
  | { type: "COMPLETE"; found: boolean; path: string[] | null };

export type BfsTraceFrame = {
  event: BfsEvent;
  queue: { node: string; depth: number }[];
  visited: string[];
  current: string | null;
  path: string[] | null;
  note: string;
};

function cloneQueue(queue: { node: string; depth: number }[]) {
  return queue.map((item) => ({ ...item }));
}

function reconstructPath(parent: Record<string, string | null>, target: string) {
  const path: string[] = [];
  let current: string | null = target;
  while (current !== null) {
    path.push(current);
    current = parent[current] ?? null;
  }
  return path.reverse();
}

export function buildBfsTrace(graph: Graph, start: string, target: string): BfsTraceFrame[] {
  if (!graph[start]) return [];

  const frames: BfsTraceFrame[] = [];
  const queue: { node: string; depth: number }[] = [{ node: start, depth: 0 }];
  const discovered = new Set<string>([start]);
  const visited: string[] = [];
  const parent: Record<string, string | null> = { [start]: null };

  frames.push({
    event: { type: "INIT", start },
    queue: cloneQueue(queue),
    visited: [],
    current: null,
    path: null,
    note: `Start by enqueueing ${start}. Breadth-first search always removes the oldest queued node first.`,
  });

  while (queue.length) {
    const currentEntry = queue.shift()!;
    const { node, depth } = currentEntry;

    frames.push({
      event: { type: "DEQUEUE", node, depth },
      queue: cloneQueue(queue),
      visited: [...visited],
      current: node,
      path: null,
      note: `${node} leaves the front of the queue. It is the earliest discovered node that has not been processed yet.`,
    });

    if (visited.includes(node)) {
      frames.push({
        event: { type: "SKIP", node },
        queue: cloneQueue(queue),
        visited: [...visited],
        current: node,
        path: null,
        note: `${node} was already processed, so BFS skips it instead of following its edges again.`,
      });
      continue;
    }

    visited.push(node);
    frames.push({
      event: { type: "VISIT", node, depth },
      queue: cloneQueue(queue),
      visited: [...visited],
      current: node,
      path: null,
      note: `Mark ${node} visited at degree ${depth}. Nodes at smaller degrees have already been processed.`,
    });

    if (node === target) {
      const path = reconstructPath(parent, target);
      frames.push({
        event: { type: "FOUND", node, path, depth },
        queue: cloneQueue(queue),
        visited: [...visited],
        current: node,
        path,
        note: `${target} is reached at degree ${depth}. Because BFS processes nodes level by level, this path uses the fewest edges.`,
      });
      frames.push({
        event: { type: "COMPLETE", found: true, path },
        queue: cloneQueue(queue),
        visited: [...visited],
        current: null,
        path,
        note: `Shortest path: ${path.join(" → ")}.`,
      });
      return frames;
    }

    const newNeighbors: string[] = [];
    for (const neighbor of graph[node] ?? []) {
      if (discovered.has(neighbor)) continue;
      discovered.add(neighbor);
      parent[neighbor] = node;
      queue.push({ node: neighbor, depth: depth + 1 });
      newNeighbors.push(neighbor);
    }

    frames.push({
      event: { type: "ENQUEUE", from: node, nodes: [...newNeighbors], depth: depth + 1 },
      queue: cloneQueue(queue),
      visited: [...visited],
      current: node,
      path: null,
      note: newNeighbors.length
        ? `Enqueue ${newNeighbors.join(", ")} at degree ${depth + 1}. They go to the back, behind nodes discovered earlier.`
        : `${node} has no undiscovered neighbors to enqueue.`,
    });
  }

  frames.push({
    event: { type: "COMPLETE", found: false, path: null },
    queue: [],
    visited: [...visited],
    current: null,
    path: null,
    note: `${target} was not reachable from ${start}; the queue became empty.`,
  });

  return frames;
}

export function bfsShortestPath(graph: Graph, start: string, target: string): string[] | null {
  const frames = buildBfsTrace(graph, start, target);
  const final = frames.at(-1);
  return final?.event.type === "COMPLETE" && final.event.found ? final.event.path : null;
}
