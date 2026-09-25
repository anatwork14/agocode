# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, model unfamiliar problems, re-implement mechanisms from memory, and transfer that understanding to new contexts**.

The original Book Track follows the pedagogical progression of *Grokking Algorithms*. The broader AgoCode syllabus now combines that visual-first path with original learning structures synthesized from *Data Structures & Algorithms in Python* (Goodrich, Tamassia, Goldwasser), *Elements of Programming Interviews in Python* (Aziz, Lee, Prakash), and *The Algorithm Design Manual* (Skiena).

AgoCode does **not** reproduce those books. It transforms their teaching perspectives into original interactive lessons, field notes, design worksheets, visualizations, and transfer practice.

## Product principle

> Understand → Model → Baseline → Transform → Choose structure → Prove → Analyze → Implement → Vary → Recall

The shorter mastery loop remains:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

## What is implemented

- Next.js + React + TypeScript application foundation
- paper / ink / editorial-red visual system and SVG-first AgoCode brand
- responsive Book / Syllabus / Lab / Exercises / Blog / Review / Progress experiences
- interactive learning slices across all 11 original Book Track chapters
- deterministic traces and reusable array, stack, queue, graph, weighted-graph, table, grid, and state-inspector primitives
- in-browser Python execution in a Web Worker with timeout protection, tests, stdout/stderr, progressive hints, and Python-friendly indentation
- Transfer Track with direct coding challenges and no-label mixed recognition
- local evidence for coding attempts, hint use, prediction, explanation, recognition, and delayed recall
- seven-dimension mastery model: Understand / Trace / Predict / Rebuild / Explain / Transfer / Recall
- adaptive review scheduling based on actual recall outcomes
- **Expanded Syllabus**: 10 connected tracks covering analysis/correctness, ADTs and representations, trees/heaps/search structures, sorting/search/text, recursive search, graph modeling, optimization/hardness, problem-solving method, and algorithm engineering
- **Ways of Solving**: 12 original field notes about modeling, brute force, invariants, sorting as a transformation, ADT choice, special cases, repertoire, variants, complexity, and design logs
- **Canonical Problem Atlas**: 400+ source-aware entries drawn from named problems, canonical algorithms, and problem families in the source books, with search/filtering and an original AgoCode reasoning lens
- per-problem **Design Worksheet** that asks learners to restate, hand-solve, baseline, identify waste, choose structure, state an invariant, analyze, and vary
- CI gates for typecheck, tests, lint, and production build

## Knowledge architecture

AgoCode now separates four complementary views:

1. **Book Track** — guided visual intuition in a deliberate chapter order.
2. **Expanded Syllabus** — a dependency map of deeper data-structure and algorithm-design knowledge.
3. **Problem Atlas** — a repertoire of canonical problem names and families for recognition and transfer.
4. **Ways of Solving** — reusable problem-solving questions for the moment before the technique is obvious.

This prevents the product from collapsing into either a static textbook or a random problem list.

## Copyright boundary

The source books are used as pedagogical references. AgoCode may index short problem titles, chapter/topic names, and source provenance, but it does not republish full copyrighted exercise statements, published solutions, or book illustrations. Interactive exercises are rewritten as original AgoCode formulations with original visuals and hints.

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

## Original Book Track

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

The Book Track is intentionally preserved rather than overwritten. The expanded syllabus grows around it.

## Core product modes

- **Read** — illustrated editorial lessons and interactive analogies
- **Syllabus** — prerequisite and perspective map across the broader DSA curriculum
- **Lab** — synchronized visualization, algorithm state, code, prediction, and custom scenarios
- **Exercises** — canonical repertoire plus problem-design worksheets and interactive slices
- **Ways of Solving** — original problem-solving field notes
- **Practice** — reconstruction and progressively less-labeled transfer problems
- **Review** — spaced retrieval rescheduled by actual recall outcome
- **Progress** — evidence ledger plus multi-dimensional mastery diagnosis

## Reference milestone

A learning slice is successful when a learner can leave, return after a delay, rebuild the mechanism, explain why it works, diagnose a plausible bug, recognize the same idea after the surface story changes, and justify why the chosen representation or algorithm fits the real constraints.
