# AgoCode Implementation Roadmap

_Last reconciled: 2026-09-26_

This document is the **authoritative current-state delivery ledger** for AgoCode. It replaces the earlier milestone checklist, which had accumulated unchecked items that were already implemented. A checked item below means the capability exists in the repository; repository-local work is considered complete only when the full CI contract passes.

## 1. Product contract

AgoCode is an interactive algorithm notebook built around two connected loops.

### Mastery loop

```text
Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall
```

### Problem-solving loop

```text
Understand → Model → Baseline → Transform → Choose structure
→ Prove → Analyze → Implement → Vary → Recall
```

A primary feature should strengthen one or more of these steps and produce inspectable evidence. Completion, confidence, and decorative interaction are never promoted into mastery evidence by themselves.

---

## 2. Repository-local completion status

### Platform foundation

- [x] Next.js App Router + React + TypeScript application.
- [x] Paper / ink / editorial-red visual language and SVG-first AgoCode brand.
- [x] Shared CSS design tokens plus typed runtime token references.
- [x] Stable UI primitives for recurring lab headers, metrics, margin notes, and renderer contracts.
- [x] Responsive Book, Syllabus, Lab, Problems, Solve, Ways, Practice, Review, Progress, Sets, and Data Settings surfaces.
- [x] Global keyboard focus treatment and skip navigation to the main-content target.
- [x] Reduced-motion baseline.
- [x] Dependency-free accessibility contract checks in CI.
- [x] Route-integrity tests for data-driven links and primary learner journeys.
- [x] Authored-content schema validation in CI.
- [x] Conservative production JavaScript/CSS asset budgets in CI.
- [x] Zero-warning lint gate.
- [x] Typecheck, deterministic tests, production build, accessibility, content validation, and performance-budget checks run in one CI job.

### Learning runtime

- [x] Deterministic semantic traces throughout the Book Track.
- [x] Forward/backward stepping and visited-history scrubbing.
- [x] Prediction gates before meaningful state transitions.
- [x] Stable semantic code-line IDs independent of displayed line numbers or formatting.
- [x] Topic-independent autoplay state machine with slow / normal / fast speeds.
- [x] Autoplay pauses at prediction gates instead of skipping learner work.
- [x] Reusable array, stack, queue, graph, weighted-graph, table, grid, and state-inspector views.
- [x] Formal graph / queue / stack renderer contracts with deterministic authoring validation.
- [x] Balanced recursion-tree model and level-work visualization for divide-and-conquer analysis.
- [x] In-browser Python execution in an isolated Web Worker.
- [x] Execution timeout protection and runtime restart.
- [x] stdout / stderr capture.
- [x] Visible tests and pedagogically hidden checks.
- [x] Hidden checks contribute to objective completion evidence without displaying expected values in the normal learner UI.
- [x] Progressive hint ladders, reconstruction exercises, repair exercises, and transfer demands.

### Editor decision

- [x] Keep the lightweight textarea-based coding editor for the current product. Monaco is intentionally **not** added: its bundle and interaction cost would not currently improve the evidence model enough to justify the dependency. Revisit only if future authoring needs require language-server/editor functionality that materially changes learning quality.

### Learning evidence

- [x] Persistent local coding-attempt history.
- [x] Passed-test counts, hint use, prediction evidence, explanation evidence, mixed-recognition evidence, and delayed-recall evidence.
- [x] Adaptive recall rescheduling.
- [x] Seven-dimension mastery view: Understand / Trace / Predict / Rebuild / Explain / Transfer / Recall.
- [x] Per-problem independence ladder: seen → guided → solved → independent → transferred → recalled.
- [x] Attempt history preserves latest vs. strongest demonstrated reasoning evidence.
- [x] Support-removal and time-to-independence tracking.
- [x] Repeated weaker attempts do not erase previously verified stronger evidence.
- [x] Reasoning notebooks preserve exact developed-stage identities for new finalized attempts.
- [x] Legacy count-only reasoning records remain valid but are not retroactively invented into stage-specific evidence.
- [x] Objective design-skill evidence model for problem framing, baseline diagnosis, strategy/modeling, correctness, cost analysis, and variation/transfer.
- [x] Design-skill coverage counts unique exercises and independent no-lens observations rather than self-confidence.
- [x] Source-workbook contribution to design evidence is visible across Goodrich / EPI / Skiena-derived exercises.
- [x] Local evidence export/import and learner-controlled portability/reset controls.

---

## 3. Book Track

The original 11-chapter visual path is complete and remains AgoCode's low-friction entry sequence.

### Chapter 1 — Introduction to Algorithms

- [x] Binary Search intuition, sorted-input prerequisite, deterministic trace, prediction gates, synchronized Python, reconstruction, repair, Big O, growth classes, factorial-growth intuition, transfer ladder, and delayed recall.

### Chapter 2 — Selection Sort

- [x] Memory-slot model, arrays vs. linked structures, operation trade-offs, Selection Sort trace, shrinking unsorted region, O(n²) reasoning, reconstruction, recall, and ADT Representation Workbench extension.

### Chapter 3 — Recursion

- [x] Base case and progress rule, ordinary call stack, recursive stack growth/unwind, factorial trace, reconstruction, prediction, delayed recall, and shared guarded autoplay.

### Chapter 4 — Quicksort / Divide & Conquer

- [x] Divide-and-conquer model, recursive sum, Quicksort partitioning, pivot/partition prediction, recursion stack, balanced vs. lopsided reasoning, average vs. worst case, reconstruction, delayed recall, and a branching recursion-tree work model.
- [x] Recursion-tree lesson explicitly distinguishes guaranteed balanced splitting from Quicksort's input/pivot-dependent shape.

### Chapters 5–11

- [x] Hash Tables: hashing, collisions, load factor, rehashing, average/worst-case reasoning, tests, review.
- [x] Breadth-First Search: graph representation, queue/visited state, level-order shortest paths, cyclic/unreachable cases, recall.
- [x] Dijkstra: weighted graphs, tentative/final distances, relaxation, parent reconstruction, invariant, negative-edge boundary, zero-weight/unreachable cases, recall.
- [x] Greedy Algorithms: local-decision framing, interval scheduling, set-cover approximation, success/failure distinction, correctness reasoning, review.
- [x] Dynamic Programming: state-definition-first flow, 0/1 knapsack, transitions, reads/writes, reconstruction, substring vs. subsequence comparison, review.
- [x] K-Nearest Neighbors: feature-space intuition, distance ordering, classification, regression, changing k, validation, review.
- [x] Where to Go Next: BST search, inverted index, MapReduce mechanism, Bloom-filter false-positive intuition, deterministic tests.

Decorative push/pop animation is **not** a completion criterion. The current discrete state visualization is preferred where it is clearer, more testable, and more compatible with reduced-motion users.

---

## 4. Source-driven knowledge system

### Expanded syllabus

- [x] Ten connected tracks covering analysis/correctness, ADTs/representations, ordered structures, transforms/search, recursion/backtracking, graphs, greedy/DP/hardness, problem solving, and algorithm engineering.
- [x] Every syllabus module has a concrete lesson, lab, field-note, practice, or appropriate detail route through the module routing layer.
- [x] Prerequisite/dependency map is available separately from the linear track listing.
- [x] Content schema validation protects module IDs, titles, questions, outcomes, topics, sources, and routes.

### Ways of Solving

- [x] Original field notes for modeling, baselines, tiny/extreme cases, sorting as transformation, ADT-before-representation, invariants, special-case ladders, repertoire, variants/transfer, complexity constraints, and design logs/rejected approaches.
- [x] Embedded active workbenches are used where interaction changes a reasoning decision; prose remains prose where animation would be decorative.

### Canonical Problem Atlas

- [x] 400+ named, source-aware exercises/families across Goodrich, EPI, and Skiena.
- [x] Domain, level, tags, structural lens, search, and filtering.
- [x] Blind structural-recognition mode and randomized surprise mode.
- [x] Direct routing to interactive lessons when available and reasoning notebooks otherwise.
- [x] Cross-source structural family pages and related-problem navigation.
- [x] Spaced mixed-recognition sessions use atlas history.
- [x] Adaptive next-problem planner uses mastery, friction, recognition misses, difficulty calibration, diversity, and problem-independence evidence.

### Goodrich source workbook

- [x] All 15 chapters indexed.
- [x] All 758 `R` / `C` / `P` identifiers represented with chapter/tier metadata.
- [x] Every identifier routes to a reasoning workspace without copying the copyrighted exercise statement.
- [x] Bookmarks and custom problem sets are available locally.
- [x] Source IDs remain provenance/navigation metadata rather than reproduced source content.

---

## 5. Problem-solving workspaces

### Per-problem Reasoning Notebook

- [x] Understand.
- [x] Tiny / extreme examples.
- [x] Baseline.
- [x] Named waste.
- [x] Strategy / model.
- [x] Invariant.
- [x] Real cost analysis.
- [x] Variant / transfer.
- [x] Progressive structural lens gated behind baseline/waste work.
- [x] Local autosave.
- [x] Confidence reflection kept separate from mastery.
- [x] Copyable reasoning log.
- [x] Fresh-attempt workflow with durable attempt history.
- [x] Structured rejected-approach support through design/casebook workspaces.
- [x] Repeated-attempt comparison through attempt history and monotonic evidence summaries.

### Open Design a Solution workspace

- [x] Arbitrary problem description, input/output/scale, exact-vs-approximate requirement, tiny case, brute-force baseline, waste diagnosis, model candidates, special cases, candidate paradigms, invariant/correctness claim, complexity budget, and rejection log.
- [x] Multiple named/local design-session support and durable workspace persistence.
- [x] Markdown/data portability through the broader evidence portability surfaces.
- [x] Test-case / scenario scratch work is available through associated design and practice workbenches where appropriate.

---

## 6. Interactive design and analysis workbenches

The workbench layer is complete for the planned repository-local curriculum expansion. These are decision/proof tools, not animation galleries.

- [x] ADT Representation Workbench.
- [x] Invariant Workbench, including learner-authored invariant drafting and additional invariant scenarios.
- [x] Amortization Workbench, including grow/shrink hysteresis extensions.
- [x] Graph Modeling Workbench.
- [x] Heap / Priority Queue Workbench.
- [x] Backtracking & Pruning Workbench.
- [x] DP State Design Workbench.
- [x] Greedy Counterexample Workbench.
- [x] Input Transformation Workbench.
- [x] Special-case ladder and casebook workflows.
- [x] Optimization-strategy and project-design workspaces.
- [x] Balanced recursion-tree analysis integrated into Divide & Conquer.

---

## 7. Practice progression and adaptation

```text
Reinforce → Create → Build → Recognize → Vary → Retrieve
```

- [x] Source reinforcement through workbook identifiers.
- [x] Reasoning notebooks for canonical problems.
- [x] Reconstruction and repair exercises.
- [x] Direct transfer problems and model variants.
- [x] Mixed no-label recognition.
- [x] Delayed retrieval.
- [x] Learner-specific mixed sessions based on weak evidence and missed structural families.
- [x] Cross-topic model-selection practice.
- [x] Adaptive difficulty calibration with evidence-aware raise / hold / soften behavior.
- [x] Planner diversity across source, domain, and structural family.
- [x] Recommendation history prevents repetitive suggestion loops without becoming learning evidence.
- [x] Problem-level independence state influences the next proof requested from a learner.

---

## 8. Progress, review, and portability

- [x] Book Track evidence ledger.
- [x] Transfer Track evidence ledger.
- [x] Multi-dimensional mastery map.
- [x] Weakest-dimension guidance.
- [x] Technique-level mixed-recognition diagnosis.
- [x] Adaptive recall intervals.
- [x] Problem-solving/design evidence kept separate from mastery claims.
- [x] Problem-level seen/guided/solved/independent/transferred/recalled states.
- [x] Attempt history, strongest-vs-latest evidence, support reduction, and regression visibility.
- [x] Stage-aware design-skill profile.
- [x] Local bookmarks/custom review sets.
- [x] Evidence export/import and reset/portability controls.

---

## 9. Engineering and authoring contracts

Every new interactive topic must preserve these rules where applicable:

1. show the mental model before formal machinery;
2. require a meaningful prediction, choice, justification, manipulation, proof, reconstruction, transfer, or retrieval action;
3. every transition must answer “what changed?”;
4. state, explanation, and code must agree;
5. semantic trace behavior must not depend on displayed line numbers;
6. reusable renderer data must satisfy renderer contracts;
7. keyboard access and an accessible name must exist for interactive controls;
8. reduced-motion behavior must remain usable;
9. hints move one reasoning level rather than reveal the answer immediately;
10. self-confidence is context, not certification;
11. a later weak attempt cannot erase stronger objective evidence already demonstrated;
12. source books guide pedagogy/provenance but copyrighted statements, solution prose, and illustrations are not republished;
13. deterministic logic receives deterministic tests;
14. primary product routes remain covered by route/journey contracts;
15. authored datasets pass schema/content validation;
16. production assets stay within repository performance budgets;
17. CI must pass typecheck, tests, zero-warning lint, accessibility contracts, content validation, production build, and asset budgets.

### Browser-only hidden-test boundary

Hidden coding checks are a pedagogical UI boundary, **not a security boundary**. Because the exercise runtime is client-only, shipped test data can ultimately be inspected by a determined user. A truly secret grading system would require server-side execution, which is outside the current local-first product contract.

---

## 10. Current implementation boundary

At this reconciliation there is **no known unfinished repository-local milestone from the previous roadmap**. New product work should therefore begin from a new validated learning need rather than reopening stale checkboxes.

The following items are intentionally external/infrastructure-dependent and remain outside repository-local completion:

1. **Optional account/auth layer** — requires choosing and operating an identity/backend system.
2. **Cross-device evidence sync** — requires authenticated remote persistence, conflict semantics, migration/versioning, and privacy decisions.
3. **Server-backed bookmark/custom-set sync** — local sets already work; shared/cross-device sets depend on the same remote persistence layer.

These should not be implemented implicitly. When selected, they require an explicit backend architecture decision, data/privacy contract, migration strategy, and failure/offline behavior.

---

## 11. Definition of done for this roadmap

Repository-local completion is accepted only when the exact candidate commit passes the full CI quality job and that exact tested commit is fast-forwarded to `main`. A second push-triggered CI run on `main` must then pass before this reconciliation is considered final.
