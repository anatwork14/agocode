# Chapter 6 — Breadth-First Search Implementation Checkpoint

## Goal

Transform the Breadth-First Search chapter into an interactive learning slice following the AgoCode learning loop:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

## Learning sequence

1. Real-world shortest path analogy
2. Graph representation
3. Queue mental model
4. BFS traversal animation
5. Shortest unweighted path reconstruction
6. Python rebuild
7. Prediction gates
8. Transfer problems
9. Review scheduling

## Visualization contracts

The implementation should reuse existing renderer primitives.

Required semantic events:

```ts
VISIT_NODE
ENQUEUE_NODE
DEQUEUE_NODE
MARK_DISCOVERED
SET_PARENT
FOUND_TARGET
RECONSTRUCT_PATH
```

## State model

```ts
type BFSState = {
  queue: string[];
  visited: string[];
  parents: Record<string, string | null>;
  current?: string;
  path?: string[];
};
```

## Exercises

- Predict next queue state
- Identify why DFS does not guarantee shortest path
- Rebuild BFS from memory
- Debug missing visited tracking
- Apply BFS to a changed problem statement

## Quality gate

Chapter 6 is complete only when learners can:

- explain why BFS finds shortest paths in unweighted graphs
- trace queue evolution manually
- implement BFS without copying
- explain the role of visited and parent tracking
- solve transfer problems
