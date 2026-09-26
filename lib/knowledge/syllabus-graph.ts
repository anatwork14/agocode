import { syllabusTracks, type SyllabusModule, type SyllabusTrack } from "./syllabus.ts";

export type SyllabusGraphNode = {
  id: string;
  module: SyllabusModule;
  track: SyllabusTrack;
};

const prerequisiteMap: Record<string, string[]> = {
  "search-growth": [],
  "representation-recursion": [],
  "lookup-graphs-optimization": ["search-growth", "representation-recursion"],
  "experimental-analysis": ["search-growth"],
  correctness: ["experimental-analysis"],
  amortization: ["experimental-analysis", "sequence-representations"],
  "sequence-representations": ["representation-recursion"],
  "stack-queue-deque": ["sequence-representations"],
  "maps-sets": ["sequence-representations", "search-growth"],
  "trees-traversal": ["recursive-design"],
  "priority-queues": ["sequence-representations"],
  "search-trees": ["trees-traversal", "search-growth"],
  "sorting-as-tool": ["search-growth", "representation-recursion"],
  "search-selection": ["search-growth", "sorting-as-tool"],
  "text-indexes": ["maps-sets", "sorting-as-tool"],
  "recursive-design": ["representation-recursion"],
  "divide-conquer": ["recursive-design", "search-growth"],
  "backtracking-pruning": ["recursive-design", "correctness"],
  "graph-representation": ["maps-sets"],
  "graph-traversal": ["graph-representation", "stack-queue-deque"],
  "weighted-graphs": ["graph-representation", "priority-queues", "greedy-invariant"],
  "greedy-invariant": ["correctness"],
  "dynamic-programming": ["recursive-design", "correctness"],
  hardness: ["backtracking-pruning", "greedy-invariant", "dynamic-programming"],
  "understand-model": [],
  "baseline-refine": ["understand-model"],
  "pattern-repertoire": ["baseline-refine"],
  "libraries-implementation": ["sequence-representations"],
  "memory-external": ["maps-sets", "search-trees", "sorting-as-tool"],
  "parallel-design": ["understand-model", "correctness"],
};

export const syllabusGraphNodes: SyllabusGraphNode[] = syllabusTracks.flatMap((track) =>
  track.modules.map((module) => ({ id: module.id, module, track })),
);

const nodeById = new Map(syllabusGraphNodes.map((node) => [node.id, node]));

export const syllabusGraphEdges = Object.entries(prerequisiteMap).flatMap(([to, prerequisites]) =>
  prerequisites.map((from) => ({ from, to })),
);

export function getSyllabusGraphNode(id: string) {
  return nodeById.get(id);
}

export function getModulePrerequisites(id: string) {
  return (prerequisiteMap[id] ?? []).map((item) => nodeById.get(item)).filter((item): item is SyllabusGraphNode => Boolean(item));
}

export function getModuleDependents(id: string) {
  return syllabusGraphEdges
    .filter((edge) => edge.from === id)
    .map((edge) => nodeById.get(edge.to))
    .filter((item): item is SyllabusGraphNode => Boolean(item));
}

export function hasSyllabusGraphCycle() {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const prerequisite of prerequisiteMap[id] ?? []) {
      if (visit(prerequisite)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };

  return syllabusGraphNodes.some((node) => visit(node.id));
}

export function getSyllabusTrackGraph(trackId: string) {
  const track = syllabusTracks.find((item) => item.id === trackId);
  if (!track) return [];
  return track.modules.map((module) => ({
    module,
    prerequisites: getModulePrerequisites(module.id),
    dependents: getModuleDependents(module.id),
  }));
}
