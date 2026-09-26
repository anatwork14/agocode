# AgoCode

AgoCode is a visual-first algorithm learning platform for **understanding algorithms, modeling unfamiliar problems, rebuilding mechanisms from memory, and transferring that understanding across contexts**.

The original Book Track follows the pedagogical progression of *Grokking Algorithms*. The broader syllabus synthesizes teaching perspectives from *Data Structures & Algorithms in Python* (Goodrich, Tamassia, Goldwasser), *Elements of Programming Interviews in Python* (Aziz, Lee, Prakash), and *The Algorithm Design Manual* (Skiena) into original AgoCode lessons, workbenches, problem families, reasoning tools, and practice systems.

AgoCode does **not** reproduce those books. Source material is used for pedagogy, provenance, terminology, and canonical problem names while AgoCode creates original explanations, examples, interactions, tests, hints, and visuals.

## Product principle

Problem-solving loop:

> Understand → Model → Baseline → Transform → Choose structure → Prove → Analyze → Implement → Vary → Recall

Mastery loop:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

The platform is intentionally evidence-first: confidence, ratings, recommendation clicks, and elapsed time do not become mastery by themselves.

## Core v1 status

The deterministic local-first learning loop is complete end-to-end:

```text
Learn
  ↓
Predict / trace / rebuild
  ↓
Reason and finalize attempts
  ↓
Solve independently
  ↓
Transfer across surface changes
  ↓
Retrieve after delay
  ↓
Objective evidence updates spacing
  ↓
Adaptive next problem / mixed session
  ↺
```

### Learning and knowledge architecture

- complete 11-chapter visual-first Book Track
- expanded 10-track syllabus with concrete routes for every module
- prerequisite/dependency syllabus map
- 12 original Ways of Solving field notes
- 400+ source-aware canonical problem entries
- complete Goodrich `R/C/P` reference index from the supplied edition
- broad EPI and Skiena canonical problem coverage
- cross-source structural-family pages and related-problem links
- copyright-safe source indexing without republishing full prompts or published solutions

### Interactive runtime

- deterministic semantic traces
- forward/backward timeline navigation and prediction gates
- reusable array, stack, queue, graph, weighted-graph, table, grid, and inspector renderers
- formalized renderer contracts for reusable visualizations
- in-browser Python execution in a Web Worker
- timeout protection and worker restart
- stdout/stderr capture
- visible and hidden test separation
- progressive hints, reconstruction, and bug-repair exercises

### Algorithm-design workbenches

- ADT Representation
- Invariant, including learner-authored claims and graph/Dijkstra scenarios
- Amortization, including grow/shrink hysteresis
- Graph Modeling
- DP State Design
- Priority Queue / Heap trade-offs
- Backtracking & Pruning
- Greedy Counterexample
- Input Transformation
- Special-Case Ladder
- Optimization Strategy

These workbenches train the decision or proof obligation **before** an algorithm name becomes obvious.

### Problem-solving workspaces

Per-problem Reasoning Notebook:

- understand the problem
- solve tiny/extreme cases
- establish a baseline
- name the waste
- choose a strategy/model
- write an invariant
- analyze real cost
- vary one assumption
- reveal a structural lens only after baseline work
- record structured rejected approaches
- finalize immutable attempt snapshots

Open **Design a Solution** workspace:

- arbitrary problem descriptions
- exact vs approximate requirement
- scale and constraints
- candidate models/paradigms
- rejection log
- invariant/correctness claim
- complexity budget
- test-case scratchpad
- named saved sessions
- Markdown export

### Practice system

Practice progressively removes scaffolding:

> Reinforce → Create → Build → Recognize → Vary → Retrieve

Implemented modes include:

- source-workbook reinforcement
- canonical reasoning notebooks
- direct transfer exercises
- reconstruction and repair
- blind/no-label Atlas recognition
- model-first variant practice
- adaptive mixed sessions
- deterministic adaptive next-problem planning

The planner combines weakest mastery dimension, repeated friction, difficulty calibration, finalized attempt history, problem independence, retrieval freshness, blind-recognition misses, and source/domain/family diversity. Every recommendation exposes reasons rather than hiding them behind an opaque score.

### Attempt history and problem independence

Finalized reasoning attempts are stored separately from the editable notebook.

AgoCode derives a monotonic evidence ladder:

> Seen → Guided → Solved → Independent → Transferred → Recalled

Key boundaries:

- later weak retries remain diagnostic but do not erase stronger prior proof;
- independence requires substantial completed reasoning without the structural lens;
- transfer requires an independently solved structural neighbor across a changed source or domain;
- recall requires delayed first-try blind structural recognition;
- self-confidence and difficulty ratings never advance this ladder alone.

Attempt summaries expose latest vs best attempt, support removal, attempts-to-independence, time-to-independence, and below-peak retries.

### Retrieval scheduling

Historical proof and memory freshness are separate:

```text
proof:      Independent → Transferred → Recalled
freshness:  Fresh → Due soon → Due → Overdue
```

AgoCode schedules problem retrieval using deterministic spacing:

- stronger evidence can start with a longer initial interval;
- successful retrieval expands the interval up to a bounded maximum;
- needs-work retrieval contracts the interval;
- first-try blind Atlas recognition updates spacing objectively;
- later finalized reasoning attempts also update spacing objectively;
- the attempt that first established independence cannot count as its own retrieval;
- canonical classified problems have a closed-loop objective retrieval route;
- manual review outcomes remain scheduling-only fallbacks for source-workbook items without reliable structural classification.

Staleness never demotes an earned independence state. It changes only retrieval priority.

### Learner control

- bookmarks
- named custom problem sets
- Sets workspace
- local evidence export
- import with schema validation/migration rules
- learner-controlled reset/data portability
- no account required for the deterministic core

## Core product modes

- **Book** — guided visual intuition in the original chapter order
- **Syllabus** — expanded dependency map across the broader DSA curriculum
- **Lab** — trace labs plus algorithm-design workbenches
- **Problems** — canonical repertoire, source references, structural families, and reasoning workspaces
- **Solve** — open-ended design canvas for unfamiliar problems
- **Ways** — original problem-solving field notes
- **Casebook** — progressive application stories that preserve modeling pivots and rejected approaches
- **Practice** — next-problem planning, mixed sessions, variants, reconstruction, and blind recognition
- **Sets** — bookmarks and named learner-defined study groups
- **Review** — adaptive spaced retrieval and objective problem-review sessions
- **Progress** — mastery, independence, attempt progression, retrieval freshness, and friction evidence

## Evidence boundaries

AgoCode deliberately distinguishes data that **guides sequencing** from data that can **support a learning claim**.

- confidence → reflection only
- difficulty rating → sequencing only, after objective cross-checking
- recommendation history → diversity/recency only
- manual recall outcome → scheduling only
- finalized reasoning attempts → objective problem-solving evidence
- delayed first-try blind recognition → recall evidence
- time elapsed → retrieval priority, never mastery decay

## Copyright boundary

The source books are pedagogical references. AgoCode may index short problem titles, chapter/topic names, exercise identifiers, and source provenance, but it does not republish full copyrighted exercise statements, published solutions, or book illustrations.

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

CI requires all four gates to pass.

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

## Intentionally deferred post-core work

The local deterministic product must remain useful without these additions:

- optional account / cross-device synchronization;
- server-backed collaboration where a concrete learner need justifies it;
- broader browser-level accessibility/performance automation as the surface grows;
- constrained AI tutoring for misconception diagnosis, Socratic prompts, counterexamples, rubric-based explanation feedback, and transfer variants.

AI should not make “solve this for me” the default AgoCode interaction.

## Reference milestone

A learning slice succeeds when a learner can leave, return after a delay, rebuild the mechanism, explain why it works, diagnose a plausible bug, recognize the same structure after the surface story changes, justify why the selected representation or algorithm fits the real constraints, and identify which changed assumption would force the design to change.
