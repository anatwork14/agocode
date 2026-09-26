# AgoCode Implementation Roadmap

This document is the **current-state delivery map** for AgoCode. It replaces the earlier backlog that was written while many of the systems below were still planned.

The deterministic local-first learning core is now complete enough to stand on its own. Future work must not re-implement completed features or weaken the evidence boundaries described here.

## 1. Product contract

AgoCode connects two loops:

### Mastery loop

```text
Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall
```

### Problem-solving loop

```text
Understand → Model → Baseline → Transform → Choose structure
→ Prove → Analyze → Implement → Vary → Recall
```

A feature belongs in the core only when it strengthens one or more of these steps and produces or consumes inspectable learner evidence.

## 2. Core v1 status

### Foundation and quality

- [x] Next.js + React + TypeScript application
- [x] paper / ink / editorial visual system and SVG-first brand
- [x] responsive Book / Syllabus / Lab / Problems / Solve / Ways / Practice / Sets / Review / Progress surfaces
- [x] keyboard-access and reduced-motion baselines
- [x] deterministic Node test suite
- [x] route-integrity tests for data-driven and core learner journeys
- [x] CI gates for typecheck, tests, lint, and production build
- [x] reusable visualization renderer contracts
- [x] hidden-test separation for Python coding exercises

### Book Track

- [x] all 11 original visual-first chapters are live
- [x] prediction, trace, reconstruction, explanation, transfer, and delayed-recall demands across the track
- [x] chapter-level cumulative recall
- [x] algorithm assumption boundaries and counterexamples where applicable

### Expanded knowledge map

- [x] 10 connected syllabus tracks
- [x] every syllabus module routes to a concrete AgoCode surface
- [x] prerequisite graph / syllabus map
- [x] 12 original Ways of Solving field notes
- [x] 400+ source-aware canonical problem entries
- [x] complete Goodrich `R/C/P` identifier index
- [x] broad EPI and Skiena source coverage
- [x] cross-source structural-family pages
- [x] related problems by structural similarity rather than chapter proximity alone
- [x] copyright boundary enforced: provenance and short identifiers are indexed without republishing source prompts or solutions

### Problem-solving workspaces

- [x] persistent per-problem Reasoning Notebook
- [x] Understand / examples / baseline / waste / strategy / invariant / cost / variant stages
- [x] progressive structural lens
- [x] explicit finalized-attempt lifecycle
- [x] structured rejected approaches
- [x] attempt history and best-vs-latest comparison
- [x] support-reduction tracking and time-to-independence
- [x] open Design a Solution workspace
- [x] named design sessions
- [x] Markdown export
- [x] test-case scratchpad
- [x] Goodrich Project-tier workspace

### Interactive design workbenches

- [x] ADT Representation
- [x] Invariant — including graph traversal, Dijkstra finalization, and learner-authored claims
- [x] Amortization — including growth/shrink hysteresis and explanatory modes
- [x] Graph Modeling
- [x] DP State Design
- [x] Priority Queue / Heap representation trade-offs
- [x] Backtracking & Pruning
- [x] Greedy Counterexample
- [x] Input Transformation
- [x] Special-Case Ladder
- [x] Optimization Strategy

### Practice progression

AgoCode progressively removes labels and support:

```text
Reinforce → Create → Build → Recognize → Vary → Retrieve
```

- [x] source-workbook reinforcement
- [x] canonical-problem reasoning notebooks
- [x] reconstruction and repair exercises
- [x] direct transfer problems
- [x] no-label Atlas recognition
- [x] model-first variant practice
- [x] adaptive mixed sessions driven by learner evidence
- [x] deterministic adaptive next-problem planner

### Learning evidence

- [x] coding attempts, passed-test counts, hint use, runtime errors
- [x] prediction evidence
- [x] explanation evidence
- [x] mixed-recognition evidence by technique
- [x] seven-dimension mastery model
- [x] problem-solving/design evidence kept separate from mastery claims
- [x] difficulty calibration cross-checked against objective attempt evidence
- [x] problem-level evidence ladder:

```text
Seen → Guided → Solved → Independent → Transferred → Recalled
```

- [x] finalized reasoning-attempt ledger
- [x] monotonic best-ever objective evidence
- [x] weaker later attempts remain diagnostic without erasing earned independence
- [x] transfer requires an independently solved structural neighbor across changed source/domain
- [x] recall requires delayed first-try blind recognition

### Retrieval scheduling

Historical proof and retrieval freshness are deliberately separate:

```text
proof:      Independent → Transferred → Recalled
freshness:  Fresh → Due soon → Due → Overdue
```

- [x] initial spacing depends on evidence stage
- [x] successful retrieval expands intervals
- [x] needs-work retrieval contracts interval to one day
- [x] blind Atlas recognition updates spacing objectively
- [x] later finalized reasoning attempts update spacing objectively
- [x] the attempt that first established independence does not count as its own retrieval
- [x] duplicate attempt events are deduplicated
- [x] canonical classified problems have a closed-loop objective retrieval surface
- [x] legacy/source-workbook manual outcomes affect scheduling only, never mastery
- [x] retrieval freshness feeds adaptive recommendation scoring

### Learner control and portability

- [x] bookmarks
- [x] named custom problem sets
- [x] custom study-set management
- [x] export learning data
- [x] import learning data
- [x] learner-controlled reset / portability controls
- [x] local-first operation without requiring an account

## 3. Non-negotiable evidence boundaries

1. Self-confidence is reflection, not mastery.
2. Difficulty ratings affect sequencing only after objective cross-checking.
3. Recommendation history is not learning evidence.
4. A later weak retry does not demote stronger historical proof.
5. Time does not erase independence; staleness changes only retrieval priority.
6. Manual Remembered / Needs work controls affect scheduling only.
7. Transfer and recall claims require observable behavior, not a checkbox.
8. The deterministic system must remain useful without AI or cloud infrastructure.

## 4. Quality gate for new interactive content

A new topic is complete only when applicable requirements are satisfied:

1. mental model before formal machinery;
2. meaningful prediction, choice, justification, or manipulation;
3. every transition answers “what changed?”;
4. state, explanation, and code agree;
5. mobile layout remains usable;
6. keyboard access is preserved;
7. reduced-motion behavior is preserved;
8. hints move one reasoning level rather than expose the full solution;
9. reconstruction, proof, transfer, variation, or retrieval goes beyond recognition;
10. content and visuals are original;
11. deterministic logic is tested;
12. data-driven links resolve to real product routes;
13. CI passes typecheck, tests, lint, and production build.

## 5. Content and copyright guardrail

- use source books for pedagogy, organization, terminology, canonical names, and problem provenance;
- never republish full copyrighted exercise statements;
- never copy published solution prose;
- never trace or reuse book illustrations;
- create original examples, interactions, hints, tests, explanations, and visuals;
- short source identifiers and canonical problem names may be used for navigation/provenance;
- when a source problem is not rewritten as an original AgoCode exercise, keep the learner's source copy beside the reasoning workspace.

## 6. Core-complete boundary

The local-first deterministic product is considered **core v1 complete** when the following remain true together:

```text
learn
  ↓
predict / trace / rebuild
  ↓
reason and finalize an attempt
  ↓
solve independently
  ↓
transfer across surface changes
  ↓
retrieve after delay
  ↓
objective evidence updates spacing
  ↓
adaptive next problem / mixed session
  ↺
```

That loop is implemented today.

## 7. Intentionally deferred — post-core, not missing features

These items should not be implemented merely to increase feature count.

### Production hardening

- [ ] automated browser-level accessibility audit in CI
- [ ] broader performance budgets as richer labs increase bundle/runtime cost
- [ ] further CSS/design-token consolidation where it reduces maintenance without changing pedagogy
- [ ] optional topic-independent autoplay abstraction if enough future traces justify it
- [ ] additional semantic code-line identity abstractions only where formatting-independent highlighting is required

### Persistence and collaboration

- [ ] optional account layer
- [ ] cross-device synchronization
- [ ] server-backed shared sets or collaborative learning only with a clear learner need

Local export/import must remain available even if accounts are added later.

### AI tutor — intentionally later

The deterministic learning system must remain complete without AI.

Acceptable future AI roles:

- [ ] classify a misconception from existing learner evidence;
- [ ] ask one Socratic question tied to the current reasoning stage;
- [ ] generate a small counterexample to a learner-authored claim;
- [ ] explain an existing execution trace without replacing the exercise;
- [ ] evaluate an explanation against an explicit rubric;
- [ ] propose a transfer variant after demonstrated competence.

Do **not** make “solve this for me” the default AgoCode interaction.

## 8. Maintenance rule for future agents

Before implementing a roadmap item:

1. inspect current `main`;
2. search for an existing module, route, component, and test;
3. verify the feature is genuinely missing rather than merely unchecked in documentation;
4. preserve evidence boundaries;
5. add deterministic regression coverage;
6. run the full CI gate before declaring the checkpoint complete.

The roadmap should be updated when a capability lands so future work is based on repository reality rather than an obsolete checklist.
