# AgoCode

AgoCode is a visual-first algorithm learning platform designed to help learners **understand algorithms, model unfamiliar problems, re-implement mechanisms from memory, and transfer that understanding to new contexts**.

The original Book Track follows the pedagogical progression of *Grokking Algorithms*. The broader AgoCode syllabus combines that visual-first path with original learning structures synthesized from *Data Structures & Algorithms in Python* (Goodrich, Tamassia, Goldwasser), *Elements of Programming Interviews in Python* (Aziz, Lee, Prakash), and *The Algorithm Design Manual* (Skiena).

AgoCode does **not** reproduce those books. It transforms their teaching perspectives into original interactive lessons, field notes, reasoning notebooks, visualizations, design tools, workbenches, case studies, and transfer practice.

## Product principle

> Understand → Model → Baseline → Transform → Choose structure → Prove → Analyze → Implement → Vary → Recall

The shorter mastery loop remains:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

## What is implemented

- Next.js + React + TypeScript application foundation
- paper / ink / editorial-red visual system and SVG-first AgoCode brand
- responsive Book / Syllabus / Lab / Problems / Solve / Ways / Casebook / Review / Progress experiences
- interactive learning slices across all 11 original Book Track chapters
- deterministic traces and reusable array, stack, queue, graph, weighted-graph, table, grid, and state-inspector primitives
- in-browser Python execution in a Web Worker with timeout protection, tests, stdout/stderr, progressive hints, and Python-friendly indentation
- Transfer Track with direct coding challenges and no-label mixed recognition
- local evidence for coding attempts, hint use, prediction, explanation, recognition, and delayed recall
- seven-dimension mastery model: Understand / Trace / Predict / Rebuild / Explain / Transfer / Recall
- adaptive review scheduling based on actual recall outcomes
- **Expanded Syllabus**: 10 connected tracks covering analysis/correctness, ADTs and representations, trees/heaps/search structures, sorting/search/text, recursive search, graph modeling, optimization/hardness, problem-solving method, and algorithm engineering
- syllabus modules route into relevant design labs so the broader map is increasingly executable rather than static
- **Practice progression**: Reinforce → Create → Build → Recognize → Vary → Retrieve
- **Ways of Solving**: 12 original field notes about modeling, brute force, invariants, sorting as a transformation, ADT choice, special cases, repertoire, variants, complexity, and design logs
- **Algorithm Design Casebook**: original progressive-reveal application stories that preserve raw request → baseline → model → rejected approach → pivot → design → verification → postmortem
- **Canonical Problem Atlas**: 400+ named, source-aware entries with search/filtering, blind recognition, randomized “Surprise me” practice, and an original AgoCode reasoning lens
- **Complete Goodrich source-workbook index**: 758 numbered `R`, `C`, and `P` references from the supplied PDF across Chapters 1–15, each routed to an AgoCode reasoning workspace without reproducing the copyrighted prompt
- **EPI source coverage**: named problem/design coverage across every problem chapter 4–24 in the supplied edition
- **Skiena source coverage**: all 75 catalog problems represented across data structures, numerical, combinatorial, graph, geometry, set, and string sections
- source-coverage tests lock those boundaries so later refactors cannot silently remove major source areas
- per-problem **persistent Reasoning Notebook**: understand, tiny/extreme cases, baseline, named waste, strategy, invariant, cost, and variant; autosaved locally with progressive structural hints
- Goodrich `P` references additionally open a persistent **Project Workspace** for interfaces, invariants, milestones, tests, complexity budgets, experiments, failure logs, and transfer retrospectives
- open-ended **Design a Solution** workspace for arbitrary problems that are not already in the atlas, including exact-vs-approximate requirements, scale, model candidates, special cases, candidate paradigms, invariants, and a “no, because…” rejection log
- **ADT Representation Workbench**: keep the abstract contract fixed, vary operation frequencies and collection size, then compare representation trade-offs
- **Invariant Workbench**: choose a correctness claim, defend initialization / preservation / termination, inspect state transitions, break weak claims with counterexamples, and rewrite the invariant for a transfer variant
- **Amortization Workbench**: compare dynamic-array capacity rules, inspect expensive resize spikes, measure cumulative average work, and contrast geometric growth with fixed-increment growth
- **Graph Modeling Workbench**: turn application stories into vertices, edges, direction, weights, and objectives before choosing a graph algorithm
- **DP State Design Workbench**: define subproblem meaning, dimensions, dependencies, and base cases before revealing a recurrence
- **Input Transformation Workbench**: compare sorting, hashing, heaps, and staged preprocessing by the relation they expose and the waste they remove
- **Special-Case Ladder**: solve a restricted problem, remove one assumption, identify the failed proof/structure, then add only the machinery the general case requires
- **Optimization Strategy Workbench**: compare exact, bounded-approximation, and heuristic strategies against quality requirements, scale, assumptions, and tiny exact oracles
- CI gates for typecheck, tests, lint, and production build

## Knowledge architecture

AgoCode separates six complementary views:

1. **Book Track** — guided visual intuition in a deliberate chapter order.
2. **Expanded Syllabus** — a dependency and perspective map across the broader DSA curriculum.
3. **Problem Atlas** — a repertoire of canonical problem names and families for recognition and transfer.
4. **Ways of Solving** — reusable problem-solving questions for the moment before the technique is obvious.
5. **Design Workspace** — a blank problem-solving canvas for turning a new problem into explicit models, baselines, trade-offs, and proof obligations.
6. **Algorithm Design Casebook** — original application stories that preserve the reasoning path normally erased by a polished final solution.

The Lab layer cuts across these views. Trace labs make algorithm state inspectable; design workbenches make representation choices, correctness arguments, amortized cost, graph models, DP state, input transformations, special-case generalization, and hard-optimization trade-offs inspectable.

This prevents the product from collapsing into a static textbook, an animation gallery, or a random problem list.

## Copyright boundary

The source books are used as pedagogical references. AgoCode may index short problem titles, chapter/topic names, exercise identifiers, and source provenance, but it does not republish full copyrighted exercise statements, published solutions, or book illustrations. Interactive exercises, workbenches, case studies, examples, explanations, and visuals are original AgoCode transformations.

The Goodrich preface describes roughly 750 exercises; the supplied PDF yields 758 indexed `R/C/P` identifiers in AgoCode's extraction. The site presents that as an indexing detail rather than changing the source's own stated count.

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
- [Source Synthesis](docs/SOURCE_SYNTHESIS.md)
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
- **Syllabus** — prerequisite/perspective map with direct links into relevant workbenches
- **Lab** — synchronized traces plus cross-cutting design workbenches
- **Problems** — canonical repertoire, complete source-workbook references, blind recognition, reasoning notebooks, and Project-tier engineering workspaces
- **Solve** — open-ended algorithm design canvas for unfamiliar problems
- **Ways** — original problem-solving field notes
- **Casebook** — progressive original application stories that expose modeling pivots and rejected approaches
- **Practice** — reconstruction and progressively less-labeled transfer problems
- **Review** — spaced retrieval rescheduled by actual recall outcome
- **Progress** — evidence ledger plus multi-dimensional mastery diagnosis

## Reference milestone

A learning slice is successful when a learner can leave, return after a delay, rebuild the mechanism, explain why it works, diagnose a plausible bug, recognize the same idea after the surface story changes, justify why the chosen representation or algorithm fits the real constraints, and identify which assumption would force the design to change.
