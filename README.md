# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, re-implement them from memory, and transfer that understanding to unfamiliar problems**.

The canonical learning backbone follows the pedagogical progression of *Grokking Algorithms* by Aditya Bhargava. AgoCode does **not** reproduce the book; it transforms its teaching principles into an original interactive learning experience: concrete examples first, visual mental models, executable traces, short prediction gates, reconstruction, explanation, delayed recall, and later problem transfer.

## Product principle

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

AgoCode is intentionally not another static textbook, animation gallery, or problem dump. A lesson is only successful when the learner can reason about state, reproduce the mechanism without copying, explain why it works, and recognize the idea again after the surface story changes.

## Implementation status

The Book Track now has interactive learning slices across all 11 chapters, with progressively richer visual and practice systems around the core algorithms.

Currently implemented:

- Next.js + React + TypeScript application foundation
- canonical paper/ink/red design system and SVG-first AgoCode brand
- responsive Book / Roadmap / Lab / Practice / Review / Progress routes
- in-browser Python execution isolated in a Web Worker with timeout protection, tests, stdout/stderr, progressive hints, and Python-friendly indentation
- deterministic algorithm traces and reusable timeline behavior
- reusable array, stack/call-frame, queue, graph, weighted-graph, table, grid, and state-inspector visualization primitives
- Chapter 1: Binary Search, running time, Big O, Traveling Salesperson, cumulative recap
- Chapter 2: memory model, arrays vs. linked lists, Selection Sort, cumulative recap
- Chapter 3: recursion, base/recursive cases, stack, recursive call stack, cumulative recap
- Chapter 4: divide and conquer, recursive reduction, Quicksort, runtime behavior, cumulative recap
- Chapter 5: hash functions, key→index mapping, use cases, collisions, load factor, resizing, cumulative recap
- Chapter 6: graph modeling, FIFO queue behavior, Breadth-First Search, shortest unweighted paths, prediction gates, reconstruction, cumulative recap
- Chapter 7: weighted graphs, Dijkstra relaxation, parent reconstruction, negative-weight limitation, cumulative recap
- Chapter 8: greedy scheduling, counterexamples, set-cover approximation, cumulative recap
- Chapter 9: dynamic-programming state grids, knapsack recurrence, sequence DP, cumulative recap
- Chapter 10: K-nearest-neighbor classification/regression, feature distance, neighborhood quality, cumulative recap
- Chapter 11: advanced-topic map and next-step exploration
- Transfer Track with direct coding challenges plus no-label mixed pattern recognition
- adaptive mixed-recognition sessions that prioritize recent misses and track technique-level first-try accuracy
- local learning evidence for coding attempts, hint use, first-try recognition, BFS prediction, explanation quality, and delayed recall
- seven-dimension mastery model: Understand / Trace / Predict / Rebuild / Explain / Transfer / Recall
- progress dashboard that separates completion from evidence strength and surfaces the weakest learning dimension
- adaptive spaced review: successful recall expands intervals, weak recall returns the item sooner
- deterministic tests for the core algorithms, timeline behavior, learning evidence, recognition, and mastery scoring
- CI gates for typecheck, tests, lint, and production build

## Local development

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## Documentation

- [Product Blueprint](docs/PRODUCT_BLUEPRINT.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [Brand Guidelines](docs/BRAND_GUIDELINES.md)
- [Learning & Content Specification](docs/LEARNING_CONTENT_SPEC.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Content & Copyright Policy](docs/CONTENT_COPYRIGHT_POLICY.md)
- [Agent/Contributor Guardrails](AGENTS.md)

## Canonical curriculum

1. Introduction to Algorithms — Binary Search, Running Time, Big O, Traveling Salesperson
2. Selection Sort — Memory, Arrays vs. Linked Lists, Selection Sort
3. Recursion — Base/Recursive Case, Stack, Call Stack
4. Quicksort — Divide & Conquer, Quicksort, Big O Revisited
5. Hash Tables
6. Breadth-First Search
7. Dijkstra’s Algorithm
8. Greedy Algorithms
9. Dynamic Programming
10. K-Nearest Neighbors
11. Where to Go Next

Interview-specific techniques such as two pointers, sliding window, monotonic stack, binary search on answer, and advanced graph/DP patterns belong to an **Extension Track** around the book-faithful foundation.

## Core product modes

- **Read** — illustrated editorial lessons and interactive analogies
- **Lab** — synchronized visualization, algorithm state, code, prediction, and custom scenarios
- **Practice** — reconstruction and progressively less-labeled transfer problems
- **Review** — spaced retrieval rescheduled by actual recall outcome
- **Progress** — evidence ledger plus multi-dimensional mastery diagnosis

## Reference milestone

A learning slice is successful when a learner can leave, return after a delay, rebuild the mechanism, explain why it works, diagnose a plausible bug, and recognize the same idea after the problem framing changes.
