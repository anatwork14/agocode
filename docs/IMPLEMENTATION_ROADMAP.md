# AgoCode Implementation Roadmap

This roadmap is a **current-state delivery map**, not the original launch plan. AgoCode has moved beyond the first Binary Search vertical slice: the complete 11-chapter Book Track is interactive, the source-driven syllabus and problem system are live, and the next phase is about deepening algorithm-design judgment rather than adding pages for their own sake.

## 1. Product contract

AgoCode is built around two connected loops.

### Mastery loop

```text
Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall
```

### Problem-solving loop

```text
Understand → Model → Baseline → Transform → Choose structure
→ Prove → Analyze → Implement → Vary → Recall
```

A feature earns a place in the primary product only when it strengthens one or more of these steps and produces inspectable learner evidence.

---

## 2. Current platform status

### Foundation

- [x] Next.js + React + TypeScript application
- [x] paper / ink / editorial-red visual system
- [x] SVG-first AgoCode brand
- [x] responsive Book / Syllabus / Lab / Problems / Solve / Ways / Practice / Review / Progress routes
- [x] reusable editorial layouts and algorithm-state visual language
- [x] keyboard-access baseline
- [x] reduced-motion baseline
- [x] CI gates for typecheck, tests, lint, and production build
- [x] deterministic Node tests for algorithm and learning logic
- [ ] extract global design tokens into a dedicated token module
- [ ] reduce page-level CSS duplication by promoting stable layout primitives
- [ ] add automated accessibility checks to CI
- [ ] add route-level smoke tests for primary learner journeys

### Learning runtime

- [x] deterministic semantic traces across the Book Track
- [x] forward / backward timeline stepping
- [x] visited-history scrubbing
- [x] prediction gates before important transitions
- [x] reusable array, stack, queue, graph, weighted-graph, table, grid, and state-inspector views
- [x] in-browser Python execution in a Web Worker
- [x] timeout protection and worker restart
- [x] stdout / stderr capture
- [x] visible tests
- [x] progressive hint ladders
- [x] reconstruction and repair exercises
- [ ] stable semantic code-line IDs independent of displayed formatting
- [ ] topic-independent autoplay controller
- [ ] formalize renderer contracts so new algorithms can be authored without bespoke glue
- [ ] hidden-test separation for coding exercises
- [ ] decide whether Monaco improves learning enough to justify bundle and interaction cost

### Learning evidence

- [x] persistent local coding-attempt history
- [x] best passed-test count
- [x] hint-use evidence
- [x] prediction evidence
- [x] explanation evidence
- [x] mixed-recognition evidence by technique
- [x] delayed-recall outcomes
- [x] review rescheduling based on recall outcome
- [x] seven-dimension mastery view: Understand / Trace / Predict / Rebuild / Explain / Transfer / Recall
- [x] problem-solving notebook evidence kept separate from mastery claims
- [ ] connect source-workbook reasoning evidence to a richer design-skill model
- [ ] add evidence export/import
- [ ] cross-device persistence / account layer
- [ ] learner-controlled data reset and portability controls

---

## 3. Original 11-chapter Book Track

The Book Track remains the low-friction visual entry path. Its sequence is preserved even though AgoCode now has a much broader syllabus.

### Chapter 1 — Introduction to Algorithms

- [x] Binary Search intuition and trace
- [x] sorted-input prerequisite and counterexample
- [x] logarithmic halving intuition
- [x] synchronized state and Python
- [x] custom scenarios and prediction gates
- [x] invariant / complexity explanation
- [x] reconstruction and bug repair
- [x] Running Time and Big O
- [x] common growth classes
- [x] Traveling Salesperson / factorial-growth intuition
- [x] direct and abstract Binary Search transfer ladder
- [x] delayed recall

### Chapter 2 — Selection Sort

- [x] memory-slot mental model
- [x] arrays vs. linked structures
- [x] operation trade-offs and linked-list caveats
- [x] Selection Sort semantic trace
- [x] shrinking unsorted region / growing sorted output
- [x] O(n²) reasoning
- [x] reconstruction and recall
- [x] ADT Representation Workbench now extends the chapter beyond one array-vs-list comparison

### Chapter 3 — Recursion

- [x] base case and progress rule
- [x] ordinary call stack
- [x] recursive stack growth and unwind
- [x] factorial trace and reconstruction
- [x] prediction and delayed recall
- [ ] optional recursion-tree renderer for branching recursion
- [ ] richer push/pop spatial motion where it materially improves comprehension

### Chapter 4 — Quicksort / Divide & Conquer

- [x] divide-and-conquer mental model
- [x] recursive-sum trace
- [x] Quicksort partition trace
- [x] pivot / partition prediction
- [x] recursion stack
- [x] balanced vs. lopsided recursion reasoning
- [x] average vs. worst-case complexity
- [x] reconstruction and delayed recall
- [ ] optional recursion-tree comparison with merge sort

### Chapter 5 — Hash Tables

- [x] key → bucket intuition
- [x] deterministic hash behavior
- [x] lookup and duplicate-prevention use cases
- [x] collision visualization
- [x] load-factor and rehashing behavior
- [x] average vs. worst-case reasoning
- [x] deterministic tests
- [x] chapter recap / review

### Chapter 6 — Breadth-First Search

- [x] graph representation
- [x] queue state
- [x] visited/discovered state
- [x] level-order shortest-path reasoning
- [x] synchronized traversal trace
- [x] cyclic-graph and unreachable-target tests
- [x] chapter recall

### Chapter 7 — Dijkstra

- [x] weighted graph visualization
- [x] tentative/final distance state
- [x] relaxation history
- [x] parent/path reconstruction
- [x] processed-order invariant
- [x] negative-edge rejection / assumption boundary
- [x] zero-weight and unreachable cases
- [x] chapter recall

### Chapter 8 — Greedy Algorithms

- [x] local-decision framing
- [x] interval-scheduling example
- [x] set-cover approximation example
- [x] greedy success vs. greedy failure distinction
- [x] explicit requirement for a correctness reason rather than “it seems locally best”
- [x] deterministic tests and review

### Chapter 9 — Dynamic Programming

- [x] state-definition-first lesson flow
- [x] 0/1 knapsack table
- [x] DP reads / writes
- [x] state transitions and reconstruction reasoning
- [x] sequence-DP comparison: substring vs. subsequence
- [x] deterministic tests and review

### Chapter 10 — K-Nearest Neighbors

- [x] feature-space / distance intuition
- [x] nearest-neighbor ordering
- [x] classification
- [x] regression
- [x] effect of changing k
- [x] validation of k and feature dimensions
- [x] deterministic tests and review

### Chapter 11 — Where to Go Next

- [x] further-topic bridge beyond the Book Track
- [x] BST search
- [x] inverted index
- [x] MapReduce word-count mechanism
- [x] Bloom-filter intuition and deliberate false-positive example
- [x] deterministic tests

---

## 4. Source-driven knowledge expansion

AgoCode uses the supplied books as pedagogical references while keeping public product content original.

### Expanded Syllabus

- [x] 10 connected tracks
- [x] analysis and correctness
- [x] ADTs vs. representations
- [x] trees, heaps, and ordered structures
- [x] sorting / searching / text as input transformation
- [x] recursive decomposition and backtracking
- [x] graph modeling
- [x] greedy / DP / hardness
- [x] repeatable problem-solving process
- [x] algorithm engineering and systems constraints
- [ ] add direct routes from every syllabus module to either a lesson, lab, field note, or practice surface
- [ ] visualize prerequisite dependencies between modules instead of only listing tracks

### Ways of Solving

- [x] original field notes on modeling
- [x] brute-force baselines
- [x] tiny and extreme cases
- [x] sorting as a transformation
- [x] ADT-before-representation
- [x] invariants
- [x] special-case ladders
- [x] repertoire vs. memorization
- [x] variants and transfer
- [x] complexity as a design constraint
- [x] design logs / rejected approaches
- [x] 12 total source-inspired, original notes
- [ ] add embedded mini-interactions to the strongest notes where interaction adds reasoning value

### Canonical Problem Atlas

- [x] 400+ named source-aware problems / families
- [x] Goodrich / EPI / Skiena provenance
- [x] domain, level, tags, and AgoCode reasoning lens
- [x] search and filtering
- [x] blind-recognition mode
- [x] randomized “Surprise me” mode
- [x] direct links to existing interactive learning slices
- [x] catalog-only entries route to a reasoning notebook
- [x] EPI domain-specific Chapters 20–23 represented
- [ ] normalize overlapping canonical names across books into cross-source problem-family pages
- [ ] add “related problems” by structural similarity rather than same chapter
- [ ] add spaced mixed-recognition sessions drawn from atlas history

### Goodrich Source Workbook

- [x] all 15 chapters indexed
- [x] 758 `R` / `C` / `P` exercise identifiers represented
- [x] chapter and pedagogical-tier metadata
- [x] every identifier routes to a reasoning workspace
- [x] no copyrighted exercise statement is copied into AgoCode
- [ ] add learner bookmarks / custom sets for source-workbook exercises
- [ ] add optional manual completion link back to the learner's own source notes

---

## 5. Problem-solving workspaces

### Per-problem Reasoning Notebook

- [x] Understand
- [x] tiny / extreme examples
- [x] baseline
- [x] named waste
- [x] strategy / model
- [x] invariant
- [x] complexity analysis
- [x] variant / transfer
- [x] progressive structural lens
- [x] local autosave
- [x] confidence reflection
- [x] copyable reasoning log
- [ ] record rejected approaches as structured entries rather than free text only
- [ ] let learners compare two attempts on the same problem over time

### Open “Design a Solution” workspace

- [x] arbitrary problem description
- [x] input / output / scale
- [x] exact vs. approximate requirement
- [x] tiny case
- [x] brute-force baseline
- [x] waste diagnosis
- [x] model candidates
- [x] special cases
- [x] candidate paradigms
- [x] invariant / correctness claim
- [x] complexity budget
- [x] “no, because…” rejection log
- [ ] export a design session as Markdown
- [ ] save multiple named design sessions
- [ ] optional test-case scratchpad

---

## 6. Interactive design and analysis workbenches

Workbenches are not animation galleries. Each exposes a decision or proof obligation that changes when the learner changes assumptions.

### ADT Representation Workbench

- [x] keep abstract contract fixed
- [x] vary workload weights
- [x] vary representative collection size
- [x] compare multiple representations
- [x] expose operation-cost table
- [x] show caveats and transfer question
- [x] deterministic model tests

### Invariant Workbench

- [x] Binary Search invariant scenario
- [x] Selection Sort invariant scenario
- [x] sorted two-pointer elimination scenario
- [x] plausible-but-wrong invariant distractors
- [x] initialization / preservation / termination proof stages
- [x] manual state-transition trace
- [x] counterexample reveal
- [x] transfer question requiring invariant rewrite
- [x] authoring-contract tests
- [ ] add graph-traversal invariant scenario
- [ ] add Dijkstra finalization invariant scenario
- [ ] let learners write their own invariant before seeing candidate statements

### Amortization Workbench

- [x] dynamic-array append simulator
- [x] doubling policy
- [x] 25% geometric-growth policy
- [x] fixed-increment policy
- [x] actual-cost spike visualization
- [x] cumulative average cost
- [x] per-append resize inspector
- [x] time / spare-capacity comparison
- [x] deterministic tests contrasting geometric and arithmetic growth
- [ ] add grow/shrink hysteresis scenario
- [ ] add accounting/potential-method explanation mode
- [ ] connect the workbench directly from the syllabus amortization module

### Next workbench candidates

Prioritize conceptual gaps that are hard to learn from static prose:

1. **Graph Modeling Workbench** — turn entities/relations into directed/undirected, weighted/unweighted graphs before choosing BFS, Dijkstra, MST, or flow.
2. **Heap / Priority Queue Workbench** — keep the priority-queue contract fixed and compare sorted list, unsorted list, and heap under changing workloads.
3. **Backtracking & Pruning Workbench** — visualize search-tree branching, constraints, and why a branch becomes impossible.
4. **DP State Design Workbench** — compare candidate state definitions before any recurrence is shown.
5. **Greedy Counterexample Workbench** — let learners propose local rules and attack them with small adversarial instances.

---

## 7. Practice progression

AgoCode practice should gradually remove scaffolding.

```text
Reinforce → Create → Build → Recognize → Vary → Retrieve
```

- [x] source reinforcement through Goodrich workbook identifiers
- [x] reasoning notebooks for canonical problems
- [x] reconstruction exercises
- [x] direct transfer problems
- [x] mixed no-label recognition
- [x] delayed retrieval
- [ ] generate mixed sessions from learner-specific weak techniques
- [ ] add explicit variant-generation exercises for more topics
- [ ] add cross-topic “choose the model first” sets where several techniques are plausible

---

## 8. Progress and review

- [x] Book Track evidence ledger
- [x] Transfer Track evidence ledger
- [x] multi-dimensional mastery map
- [x] weakest-dimension guidance
- [x] technique-level mixed-recognition diagnosis
- [x] adaptive recall intervals
- [x] separate problem-solving / design evidence summary
- [ ] unify recent source-workbook activity with named problem titles where available
- [ ] add history views showing improvement over repeated attempts
- [ ] distinguish “seen”, “guided”, “independent”, and “recalled after delay” at the problem level
- [ ] allow a learner to build a custom review set from bookmarks and weak evidence

---

## 9. Content and copyright rules

Every implementation agent must preserve these constraints:

- use source books for pedagogy, organization, terminology, canonical names, and problem provenance;
- do not republish full copyrighted exercise statements;
- do not copy published solution prose;
- do not trace or reuse book illustrations;
- create original examples, wording, SVGs, interactions, hints, tests, and explanations;
- short source identifiers and canonical problem names may be used for navigation/provenance;
- when a source problem is not rewritten as an original AgoCode exercise, keep the learner's source copy beside the reasoning workspace.

---

## 10. Quality gate for every new interactive topic

A topic is not complete because a page renders. It should satisfy the following where applicable:

1. the mental model appears before formal machinery;
2. the learner must predict, choose, justify, or manipulate something meaningful;
3. every animation or transition answers “what changed?”;
4. state, explanation, and code agree;
5. mobile layout remains usable;
6. keyboard access is preserved;
7. reduced-motion behavior exists;
8. hints move one reasoning level rather than reveal the full answer immediately;
9. there is a reconstruction, proof, transfer, or retrieval demand beyond recognition;
10. content and visuals are original;
11. deterministic logic is tested;
12. CI passes typecheck, tests, lint, and production build.

---

## 11. Near-term execution order

### Milestone A — connect the expanded knowledge map

- [ ] route every syllabus module to a concrete AgoCode surface
- [ ] add structural “related problems” links between atlas entries
- [ ] add bookmarks / custom problem sets

### Milestone B — deepen design judgment

- [x] ADT Representation Workbench
- [x] Invariant Workbench
- [x] Amortization Workbench
- [ ] Graph Modeling Workbench
- [ ] DP State Design Workbench
- [ ] Greedy Counterexample Workbench

### Milestone C — learner-specific practice

- [ ] build mixed sessions from weak mastery dimensions and missed atlas families
- [ ] add problem-level independence states
- [ ] add attempt comparison over time
- [ ] export/import evidence before account infrastructure

### Milestone D — persistence and scale

- [ ] optional account layer
- [ ] cross-device evidence sync
- [ ] server-backed bookmarks / custom sets
- [ ] content authoring pipeline and schema validation
- [ ] performance budget for increasingly rich labs

---

## 12. AI tutor — intentionally later

The deterministic learning system must remain valuable without AI.

First acceptable AI capabilities:

- [ ] classify a misconception from learner evidence
- [ ] ask one Socratic question tied to the current reasoning stage
- [ ] generate a small counterexample to a learner-authored claim
- [ ] explain an existing execution trace without replacing the exercise
- [ ] evaluate an explanation against an explicit rubric
- [ ] propose a transfer variant after demonstrated competence

Do **not** make “solve this for me” the default interaction.

---

## 13. Current next milestone

The next high-value feature is **Graph Modeling Workbench**.

The learner should receive an application story and decide:

```text
entities → vertices
relationships → edges
edge direction?
edge weight?
what question are we asking?
```

Only after the model is explicit should AgoCode compare BFS, DFS, Dijkstra, MST, topological ordering, or flow. The goal is to train the strategic decision that happens before an algorithm name becomes obvious.
