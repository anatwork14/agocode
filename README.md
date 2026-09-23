# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, re-implement them from memory, and transfer that understanding to LeetCode-style problems**.

The canonical learning backbone follows the pedagogical progression of *Grokking Algorithms* by Aditya Bhargava. The product does **not** reproduce the book; it transforms its teaching principles into an original interactive learning experience: concrete examples first, visual mental models, executable code, short exercises, recaps, deliberate recall, and later problem transfer.

## Product principle

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

AgoCode is intentionally not another static textbook, animation gallery, or problem dump. Every lesson must make the learner actively reason about algorithm state and eventually write the algorithm again without copying a finished solution.

## Implementation status

The **Chapter 1 / Binary Search reference vertical slice** is functional across Read, Lab, Practice, and Review modes and is being hardened before the project expands to the rest of Chapter 1.

Currently implemented:

- Next.js + React + TypeScript application scaffold
- canonical design tokens and editorial page shell
- final SVG-first v1 brand mark and lockup
- responsive Book / Roadmap / Lab / Practice / Review routes
- book-faithful Binary Search Read mode
- interactive one-by-one vs midpoint number-guessing lab
- deterministic semantic Binary Search trace generator
- synchronized array state + Python code trace
- prediction gates before important trace transitions
- prediction-safe timeline scrubbing through already-visited states
- editable sorted-array / target scenarios in the full trace lab
- embedded retrieval exercises
- invariant / sorted-input / complexity reasoning assessment
- in-browser Python execution isolated in a Web Worker
- timeout protection, stdout/stderr capture, test reports, progressive hints, and Python-friendly Tab indentation
- Binary Search reconstruction exercise with real Python tests
- transfer rung 01: insertion-position search with a recorded first hypothesis
- transfer rung 02: first-occurrence boundary search where equality no longer ends the algorithm
- local completion evidence and a spaced-review queue derived from completed learning actions
- reduced-motion and keyboard-accessible controls baseline
- CI for typecheck, lint, and production build

Next implementation priorities:

1. third Binary Search transfer rung with the technique hidden more aggressively,
2. richer mastery evidence and review scheduling,
3. a fully blank implementation mode and/or richer editor integration,
4. Chapter 1 Running Time and Big O lessons,
5. deterministic unit tests for algorithm/event generation.

## Local development

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm typecheck
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

## Reference MVP

The first complete vertical slice is **Chapter 1 / Binary Search**. The MVP is successful when a learner can return days later, implement binary search from scratch, explain why sorted input is required and why the search is logarithmic, and recognize the pattern in an unlabeled problem.
