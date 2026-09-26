import type {
  GraphRendererEdge,
  GraphRendererNode,
} from "@/lib/visualization/renderer-contracts";
import { designTokens } from "@/lib/ui/tokens";

export type RecursionTreeLevel = {
  depth: number;
  nodeCount: number;
  subproblemSize: number;
  workPerNode: number;
  totalWork: number;
};

export type RecursionTreeModel = {
  problemSize: number;
  depth: number;
  nodes: GraphRendererNode[];
  edges: GraphRendererEdge[];
  levels: RecursionTreeLevel[];
  totalWork: number;
};

function isPowerOfTwo(value: number) {
  return value >= 1 && (value & (value - 1)) === 0;
}

export function buildBalancedRecursionTree(problemSize: number): RecursionTreeModel {
  if (!Number.isInteger(problemSize) || !isPowerOfTwo(problemSize) || problemSize < 2 || problemSize > 16) {
    throw new RangeError("Recursion-tree problem size must be a power of two from 2 through 16.");
  }

  const depth = Math.log2(problemSize);
  const nodes: GraphRendererNode[] = [];
  const edges: GraphRendererEdge[] = [];
  const levels: RecursionTreeLevel[] = [];
  const verticalSpan = designTokens.layout.graphHeight - 90;

  for (let currentDepth = 0; currentDepth <= depth; currentDepth += 1) {
    const nodeCount = 2 ** currentDepth;
    const subproblemSize = problemSize / nodeCount;
    const y = 45 + (currentDepth / Math.max(depth, 1)) * verticalSpan;

    levels.push({
      depth: currentDepth,
      nodeCount,
      subproblemSize,
      workPerNode: subproblemSize,
      totalWork: nodeCount * subproblemSize,
    });

    for (let index = 0; index < nodeCount; index += 1) {
      const id = `${currentDepth}-${index}`;
      const x = ((index + 0.5) / nodeCount) * designTokens.layout.graphWidth;
      nodes.push({
        id,
        label: String(subproblemSize),
        x,
        y,
      });

      if (currentDepth > 0) {
        const parentId = `${currentDepth - 1}-${Math.floor(index / 2)}`;
        edges.push({ from: parentId, to: id, directed: true });
      }
    }
  }

  return {
    problemSize,
    depth,
    nodes,
    edges,
    levels,
    totalWork: levels.reduce((sum, level) => sum + level.totalWork, 0),
  };
}
