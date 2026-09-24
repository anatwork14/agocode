# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, re-implement them from memory, and transfer that understanding to LeetCode-style problems**.

The canonical learning backbone follows the pedagogical progression of *Grokking Algorithms* by Aditya Bhargava. The product does **not** reproduce the book; it transforms its teaching principles into an original interactive learning experience: concrete examples first, visual mental models, executable code, short exercises, recaps, deliberate recall, and later problem transfer.

## Product principle

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

AgoCode is intentionally not another static textbook, animation gallery, or problem dump. Every lesson should make the learner actively reason about algorithm state and eventually reproduce the mechanism without copying a finished solution.

## Implementation status

**Chapters 1–5 now have live Book Track learning slices.** Binary Search still has the deepest transfer/review loop, while Chapters 2–5 progressively add reusable memory, stack, recursion, divide-and-conquer, sorting, and hash-table visualization primitives.

Currently implemented:

- Next.js + React + TypeScript application scaffold
- canonical paper/ink/red design system and SVG-first AgoCode brand
- responsive Book / Roadmap / Lab / Practice / Review routes
- in-browser Python execution isolated in a Web Worker with timeout protection, tests, stdout/stderr, progressive hints, and Python-friendly indentation
- richer local learning evidence with attempt history, best test performance, hint-use tracking, next-step guidance, and delayed-review scheduling
- shared visited-timeline reducer and reusable stack/call-frame renderer
- Chapter 1: Binary Search, Running Time, Big O, Traveling Salesperson, cumulative recap
- Binary Search prediction gates, custom scenarios, guided + blank reconstruction, bug repair, and four-rung transfer ladder
- Chapter 2: memory-slot model, arrays vs. linked lists, Selection Sort trace, Python rebuild, cumulative recap
- Chapter 3: recursion analogy, base/recursive cases, ordinary call stack, recursive factorial stack, prediction gates, Python rebuild, cumulative recap
- Chapter 4: book-aligned 1680×640 divide-and-conquer farm reduction, recursive-sum trace/rebuild, Quicksort partition trace, pivot strategy comparison, Python rebuild, cumulative recap
- Chapter 5: grocery lookup comparison, inspectable key→index hashing, mapping/duplicate/cache use cases, collision chains, load factor + rehashing, built-in dictionary exercise, cumulative recap
- deterministic tests for Binary Search, Selection Sort, factorial recursion, recursive sum, Quicksort, hash-table mechanics, learning evidence, and timeline behavior
- CI gates for typecheck, tests, lint, and production build

Next implementation priorities:

1. polish Chapter 5 collision/distribution feedback around the book's apple/avocado example and 0.7 resize rule,
2. persist prediction-attempt evidence and aggregate explicit mastery dimensions,
3. reschedule reviews from actual recall success/failure instead of only original completion time,
4. begin Chapter 6 Breadth-First Search with graph representation, queue ordering, shortest-unweighted-path reasoning, and deterministic traversal traces,
5. continue extracting reusable array/node/stack/graph/table renderer contracts before later graph and DP chapters.

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
