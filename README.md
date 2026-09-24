# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, re-implement them from memory, and transfer that understanding to LeetCode-style problems**.

The canonical learning backbone follows the pedagogical progression of *Grokking Algorithms* by Aditya Bhargava. The product does **not** reproduce the book; it transforms its teaching principles into an original interactive learning experience: concrete examples first, visual mental models, executable code, short exercises, recaps, deliberate recall, and later problem transfer.

## Product principle

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

AgoCode is intentionally not another static textbook, animation gallery, or problem dump. Every lesson should make the learner actively reason about algorithm state and eventually reproduce the algorithm without copying a finished solution.

## Implementation status

**Chapter 1 is an end-to-end interactive chapter, and Chapter 2 now has its first complete Book Track slice.** Binary Search also has a four-rung transfer ladder plus delayed-recall drills.

Currently implemented:

- Next.js + React + TypeScript application scaffold
- canonical paper/ink/red design system and SVG-first AgoCode brand
- responsive Book / Roadmap / Lab / Practice / Review routes
- Binary Search intuition, guessing, halving, sorted-input counterexample, code trace, prediction gates, reconstruction, explanation, and recap
- deterministic Binary Search trace generator with reusable visited-timeline reducer
- editable sorted-array / target scenarios in Lab mode
- in-browser Python execution isolated in a Web Worker with timeout protection, stdout/stderr, tests, progressive hints, and Python-friendly indentation
- Binary Search transfer ladder: insertion boundary → first occurrence → rotated array → monotonic answer space
- blank Binary Search rebuild and boundary bug-repair recall drills
- richer local learning evidence with attempt history, best test performance, and hint-use tracking
- Chapter 1 Running Time, Big O, factorial-growth/TSP lesson, and cumulative retrieval
- Chapter 2 memory-slot model, arrays-vs-linked-lists trade-off lab, Selection Sort trace, Python rebuild, and cumulative recap
- deterministic unit tests for Binary Search, Selection Sort, learning evidence, and the shared timeline reducer
- CI gates for typecheck, tests, lint, and production build

Next implementation priorities:

1. strengthen mastery aggregation from recorded attempt evidence,
2. add prediction-attempt persistence and review rescheduling after successful/failed recall,
3. polish Chapter 2 interactions and add a dedicated Selection Sort transfer task,
4. begin Chapter 3 Recursion with stack/call-stack visualization primitives,
5. continue extracting reusable visualization primitives before graph and DP chapters.

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
- **Review** — spaced retrieval based on completed learning evidence

## Reference milestone

A learning slice is successful when a learner can leave, return after a delay, rebuild the mechanism, explain why it works, diagnose a plausible bug, and recognize the same idea after the problem framing changes.
