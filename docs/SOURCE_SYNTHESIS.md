# Source Synthesis — AgoCode Syllabus v4

AgoCode uses four complementary perspectives rather than treating one book as the entire curriculum:

- **Grokking Algorithms** supplies the visual-first, concrete-to-formal learning backbone.
- **Data Structures and Algorithms in Python** (Goodrich, Tamassia, Goldwasser) supplies ADT depth, correctness habits, representation trade-offs, amortized analysis, and layered Reinforcement / Creativity / Project practice.
- **Elements of Programming Interviews in Python** (Aziz, Lee, Prakash) supplies solution development, canonical problem repertoire, variants, invariants, and transfer pressure.
- **The Algorithm Design Manual** (Skiena) supplies modeling, strategy-vs-tactics thinking, special-case reasoning, problem catalogs, case-study design traces, hardness awareness, and the habit of recording why an approach fails.

AgoCode treats these works as pedagogical references, not content to reproduce. Short problem names, exercise identifiers, chapter/topic names, and provenance may be indexed; explanations, prompts, solutions, figures, examples, and interactions are written as original AgoCode material.

## 1. Unified competence model

A learner develops three connected layers.

### Layer A — Mechanism

Understand what a data structure or algorithm does:

- state representation;
- legal operations;
- invariant;
- transition rule;
- time/space behavior;
- implementation.

### Layer B — Design

Understand why a mechanism is relevant:

- model the application story as a computational problem;
- establish a simple correct baseline;
- identify repeated or unnecessary work;
- transform the input or choose a better ADT;
- identify the invariant or proof obligation;
- compare exact, approximate, and heuristic strategies when appropriate;
- explain why a plausible alternative fails.

### Layer C — Transfer

Use the idea without chapter labels:

- recognize a problem family from structural clues;
- compare multiple plausible approaches;
- solve a nearby variant;
- react to changed scale, memory, update model, or exactness requirements;
- retrieve the reasoning after a delay.

The learning loop remains:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

The broader design loop is:

> Model → Baseline → Name the waste → Transform → Choose structure → Prove → Analyze → Vary

## 2. Goodrich perspective: abstraction before representation

The central product implication is to separate an abstract data type from its implementation.

AgoCode repeatedly asks:

- What behavior does the client actually require?
- Which operations dominate the workload?
- Which representation makes those operations cheap?
- What capability are we paying for but not using?
- What invariant must every update preserve?

The source's Reinforcement, Creativity, and Project tiers also motivate distinct forms of practice rather than one undifferentiated question bank.

### Implemented features from this perspective

- `/lab/adt-workbench` — compare representations under changing operation frequencies and collection sizes;
- `/lab/invariants` — state, preserve, terminate, and attack an invariant with counterexamples;
- `/lab/amortization` — compare dynamic-array growth rules and sequence-level cost rather than judging one expensive operation in isolation;
- complete Goodrich Chapters 1–15 source-workbook index with **758 extracted R/C/P identifiers**;
- every indexed problem opens an original persistent reasoning notebook without republishing the prompt;
- Project-tier (`P`) references additionally open a persistent engineering workspace for contract, interfaces, invariants, milestones, tests, complexity budgets, empirical validation, failure logs, and transfer retrospectives.

## 3. EPI perspective: develop the solution, do not reveal it

A problem should not jump from statement to optimized code. AgoCode makes the learner expose the path:

1. understand and restate the problem;
2. solve a tiny example;
3. produce a simple correct baseline;
4. name the baseline's repeated work;
5. improve using discovered structure;
6. state an invariant or safety argument;
7. implement the key mechanism;
8. analyze time and space;
9. compare another plausible approach;
10. solve a nearby variant.

### Implemented features from this perspective

- progressive hint gating;
- persistent eight-stage reasoning notebooks;
- baseline-before-technique prompts;
- explicit “name the waste” fields;
- blind recognition mode and randomized “Surprise me” practice;
- multiple-strategy comparison rather than one hidden trick;
- `/lab/transformations` for sorting, hashing, heaps, and staged preprocessing;
- source-aware EPI atlas coverage across **every problem chapter 4–24** in the supplied edition.

## 4. Skiena perspective: modeling is an algorithmic skill

AgoCode trains the question **“What problem is this, really?”** before “Which algorithm do I remember?”

The design workflow is:

1. specify inputs and outputs;
2. solve a tiny case by hand;
3. estimate realistic scale;
4. decide whether exact optimality is required;
5. consider multiple formulations;
6. find a simple exact baseline or heuristic;
7. study special cases;
8. try standard paradigms and data structures;
9. recognize when hardness may be the issue;
10. preserve rejected approaches as **“no, because…”** evidence.

### Implemented features from this perspective

- `/solve` open-ended Problem Design Canvas;
- `/lab/graph-modeling` for translating application stories into graph semantics before choosing an algorithm;
- `/lab/special-cases` for restrict → solve → lift one assumption → name the obstruction;
- `/lab/optimization-strategies` for exact / approximation / heuristic requirement negotiation;
- `/casebook` original application stories that progressively reveal request → baseline → model → rejected approach → pivot → design → verification → postmortem;
- complete representation of the supplied **75-problem Algorithm Design Manual catalog**, grouped by its catalog sections;
- design logs that preserve failed approaches and the evidence that invalidated them.

## 5. Cross-source workbenches

The Lab is not an animation gallery. Each workbench makes one kind of reasoning inspectable:

1. **Binary Search Trace Lab** — synchronized algorithm state and code.
2. **ADT Representation Workbench** — contract vs implementation and workload-dependent trade-offs.
3. **Invariant Workbench** — initialization, preservation, termination, and counterexample pressure.
4. **Amortization Workbench** — costly individual events vs aggregate sequence cost.
5. **Graph Modeling Workbench** — vertices, edges, direction, weights, objective, then algorithm family.
6. **DP State Design Workbench** — subproblem meaning, dimensions, dependencies, base cases, then recurrence.
7. **Input Transformation Workbench** — baseline waste, preprocessing move, newly exposed relationship, time/space trade-off.
8. **Special-Case Ladder** — solve a restricted case and identify exactly what breaks as assumptions are removed.
9. **Optimization Strategy Workbench** — exactness, scale, approximation guarantee, heuristic budget, and tiny exact oracle.

Relevant syllabus modules route directly into these workbenches so the syllabus is increasingly executable rather than a static topic list.

## 6. Practice is a progression, not a pile of questions

AgoCode combines the source perspectives into six stages:

1. **Reinforce** — execute and explain a known mechanism.
2. **Create** — derive an approach from constraints.
3. **Build** — implement a larger artifact with interfaces, invariants, tests, and measurements.
4. **Recognize** — diagnose a mixed problem without labels.
5. **Vary** — change one assumption and adapt the solution.
6. **Retrieve** — rebuild the reasoning after spacing.

The Goodrich Project-tier engineering workspace now makes the **Build** stage materially different from a normal exercise notebook.

## 7. Canonical Problem Atlas and coverage ledger

The Problem Atlas is a retrieval and recognition system, not a solution archive.

Each named entry stores only:

- short problem name or source exercise identifier;
- source/chapter provenance;
- broad domain;
- AgoCode-original structural lens;
- AgoCode-original tags;
- route to an original interactive lesson when available.

The `/exercises` page now surfaces source coverage explicitly:

- Goodrich: 758 indexed R/C/P references across Chapters 1–15 in the supplied PDF;
- EPI: named problem/design coverage across Chapters 4–24;
- Skiena: all 75 catalog problems from the supplied catalog.

Automated tests lock these coverage boundaries so future refactors cannot silently delete source areas.

## 8. Persistent problem-design artifacts

### Reasoning Notebook

Every canonical or source-workbook entry can use the same original eight-stage notebook:

1. Understand
2. Tiny/extreme cases
3. Baseline
4. Name the waste
5. Strategy before tactics
6. Invariant
7. Real cost
8. Variant / transfer

The notebook autosaves locally and gates the structural hint until some reasoning has been written.

### Project Workspace

Goodrich `P` references add a second artifact for engineering-scale work:

1. artifact contract;
2. public interfaces;
3. representation invariants;
4. verifiable milestones;
5. test matrix;
6. operation/complexity budget;
7. empirical validation plan;
8. failure log;
9. transfer retrospective;
10. quality-gate checklist.

This keeps “build a project” from degenerating into “paste a large final answer.”

## 9. Original casebook

`/casebook` currently contains original AgoCode application stories rather than retellings of the source books:

- campus shuttle routing — graph objective, shortest path vs MST, Dijkstra and priority queues;
- duplicate report triage — keyed aggregation then top-k prioritization;
- room-booking capacity — interval transformation, sweep state, and optional room assignment;
- dependency build order — DAG modeling, topological ordering, cycle detection, and parallel frontier.

Each case requires a strategic prediction before the next design decision is revealed and keeps rejected approaches in the visible reasoning trace.

## 10. Expanded syllabus

The 11-chapter visual Book Track remains intact. It is surrounded by ten broader tracks:

0. Visual-first foundation
1. Measure and justify
2. Abstract data types before implementations
3. Ordered and hierarchical structures
4. Transform the input before solving
5. Recursive decomposition and search
6. Graph modeling as a change of language
7. Optimization: greedy, DP, and approximation
8. A repeatable way to solve unfamiliar problems
9. Algorithm engineering and real constraints

This adds heaps, balanced trees, DFS/backtracking, string matching, MST/union-find, amortization, external memory, hardness, approximation, concurrency, modeling, and engineering evidence without replacing the simpler visual entry path.

## 11. Next high-value work

The source expansion is no longer primarily a content-indexing task. The next work should deepen learning evidence and cross-link the implemented system:

1. record reasoning-notebook and Project Workspace evidence inside the mastery engine rather than only browser-local workspace summaries;
2. automatically surface canonical Atlas problems from each syllabus module, not only the module's lab;
3. build full interleaved mixed-recognition sessions sampled from the source-aware Atlas;
4. add executable project checkpoints/tests for selected original Project-tier adaptations rather than only planning rubrics;
5. add cross-device persistence/account synchronization after the local evidence model stabilizes;
6. expand the original Casebook only when each new story demonstrates a genuinely different design failure or modeling pivot.

## 12. Copyright transformation rule

For every source-derived feature, preserve the **learning objective and conceptual relationship**, not the expression.

Allowed transformation pattern:

> source idea → abstract teaching principle → original interaction / wording / example / illustration

Do not scan, trace, transcribe, or publish substantial source text, exercise statements, published solutions, or book illustrations unless appropriate permission exists.
