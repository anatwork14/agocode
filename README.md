# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, re-implement them from memory, and transfer that understanding to LeetCode-style problems**.

The canonical learning backbone follows the pedagogical progression of *Grokking Algorithms* by Aditya Bhargava. The product does **not** reproduce the book; it transforms its teaching principles into an original interactive learning experience: concrete examples first, visual mental models, executable code, short exercises, recaps, deliberate recall, and later problem transfer.

## Product principle

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

AgoCode is intentionally not another static textbook, animation gallery, or problem dump. Every lesson must make the learner actively reason about algorithm state and eventually write the algorithm again without copying a finished solution.

## Implementation status

**Chapter 1 is now an end-to-end interactive chapter**, and Binary Search has a working learning/transfer loop across Read, Lab, Practice, and Review modes.

Currently implemented:

- Next.js + React + TypeScript application scaffold
- canonical paper/ink/red design system and SVG-first AgoCode brand
- responsive Book / Roadmap / Lab / Practice / Review routes
- Binary Search intuition, number guessing, halving, sorted-input counterexample, code trace, reconstruction, explanation, and recap
- deterministic semantic Binary Search trace generator with synchronized array state and Python code
- prediction gates before branch updates and prediction-safe timeline scrubbing through visited states
- editable sorted-array / target scenarios in the full Lab
- in-browser Python execution isolated in a Web Worker with timeout protection, stdout/stderr, tests, progressive hints, and Python-friendly indentation
- transfer rung 01: insertion-position search
- transfer rung 02: first-occurrence boundary search
- transfer rung 03: rotated-array pattern recognition with the technique hidden from the problem framing
- Running Time lesson with interactive linear-vs-logarithmic growth comparison
- Big O lesson with common growth classes and worst-case reasoning
- Traveling Salesperson factorial-growth scene with an original SVG route visualization
- Chapter 1 cumulative retrieval check
- local completion evidence and a spaced-review queue
- deterministic Binary Search trace tests using Node's native test runner
- CI gates for typecheck, tests, lint, and production build

Next implementation priorities:

1. search-on-answer transfer rung to complete the first Binary Search ladder,
2. richer mastery evidence and review scheduling rather than simple completion flags,
3. a fully blank implementation mode and stronger code-editor ergonomics,
4. Chapter 2: memory model, arrays vs. linked lists, and Selection Sort,
5. reusable visualization reducers/primitives and broader deterministic tests before graph/DP chapters.

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

Interview-specific techniques such as two pointers, sliding window, monotonic stack, binary search on answer, and advanced graph/DP patterns belong to an **Extension Track** after the book-faithful foundation.

## Core product modes

- **Read** — illustrated editorial lessons and interactive analogies
- **Lab** — synchronized visualization, algorithm state, code, prediction, and custom scenarios
- **Practice** — reconstruction and progressively less-labeled transfer problems
- **Review** — spaced retrieval based on completed learning evidence

## Reference milestone

The first milestone is successful when a learner can return after a delay, implement Binary Search from scratch, explain its invariant and logarithmic behavior, and recognize the discard-region idea inside a problem that is not presented as an exact Binary Search exercise.
