# Source Synthesis — AgoCode Syllabus v3

AgoCode now uses four complementary perspectives rather than treating one book as the entire curriculum:

- **Grokking Algorithms** supplies the visual-first, concrete-to-formal learning backbone.
- **Data Structures and Algorithms in Python** (Goodrich, Tamassia, Goldwasser) supplies ADT depth, correctness habits, representation trade-offs, and layered practice.
- **Elements of Programming Interviews in Python** (Aziz, Lee, Prakash) supplies solution development, canonical problem repertoire, variants, and transfer pressure.
- **The Algorithm Design Manual** (Skiena) supplies modeling, design questions, strategy-vs-tactics thinking, problem catalogs, and the habit of recording why an approach fails.

AgoCode treats these works as pedagogical references, not content to reproduce. Short problem names, exercise identifiers, and provenance may be indexed; explanations, exercise statements, solutions, figures, and prose are rewritten from scratch.

## 1. The unified learning model

A learner should develop three layers of competence.

### Layer A — Mechanism

Understand what the data structure or algorithm does:

- state representation;
- legal operations;
- invariant;
- transition rule;
- time/space behavior;
- implementation.

### Layer B — Design

Understand why this mechanism is relevant:

- model the story as a computational problem;
- establish a simple correct baseline;
- identify the dominant repeated work;
- transform the input or use a more appropriate ADT;
- justify the improvement;
- understand when assumptions fail.

### Layer C — Transfer

Use the idea without labels:

- recognize a problem family from structural clues;
- compare multiple plausible approaches;
- solve a variant;
- handle scale or memory constraints;
- retrieve the reasoning after a delay.

The product loop remains:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

The expanded syllabus now makes **Model**, **Baseline**, **Invariant**, **Trade-off**, and **Variant** explicit activities rather than background prose.

## 2. Goodrich perspective: abstraction before representation

The key product implication is to separate an abstract data type from its implementation.

AgoCode should repeatedly ask:

- What behavior does the client actually require?
- Which operations dominate the workload?
- Which representation makes those operations cheap?
- What capability are we paying for but not using?

Examples include queue behavior vs array/circular-array/linked implementations, priority queue behavior vs lists/heaps, map behavior vs hash/search-tree implementations, and sequence behavior vs array/list representations.

The source also organizes exercises into **Reinforcement**, **Creativity**, and **Projects**, giving AgoCode a useful practice progression from executing a mechanism to designing and building with it.

### Product features from this perspective

- ADT/workload comparison tables;
- representation-switching labs;
- invariant checks during state transitions;
- empirical-vs-asymptotic complexity exercises;
- Reinforcement → Creativity → Project practice progression;
- complete source-workbook identifiers linked to original AgoCode reasoning notebooks.

## 3. EPI perspective: develop the solution, do not reveal it

A problem should not jump from statement to optimized code. AgoCode should make the learner expose the path:

1. understand the context;
2. restate the problem;
3. request only a small hint when stuck;
4. produce a simple correct baseline;
5. analyze why the baseline wastes work;
6. improve using discovered structure;
7. apply the method to a concrete case;
8. implement the key mechanism;
9. analyze time and space;
10. solve a nearby variant.

### Product features from this perspective

- progressive hint gating;
- persistent reasoning notebooks;
- baseline before technique hints;
- explicit “name the waste” prompts;
- blind recognition mode;
- surprise/interleaved practice;
- variants as a completion criterion;
- multiple-solution comparison instead of one hidden trick.

## 4. Skiena perspective: modeling is an algorithmic skill

AgoCode should train the question **“What problem is this, really?”** before “Which algorithm do I remember?”

The design workflow becomes:

1. specify inputs and outputs;
2. solve a tiny example by hand;
3. decide whether exact optimality is necessary;
4. estimate realistic scale and latency constraints;
5. consider multiple formulations;
6. find a simple exact algorithm or heuristic;
7. study special cases;
8. try standard paradigms and data structures;
9. recognize when hardness may be the issue;
10. revisit earlier answers after each failed attempt.

A rejected approach should be recorded as **“does not work because…”**, not merely discarded.

### Product features from this perspective

- design log embedded in each exercise;
- strategy-vs-tactics prompts;
- model sentence before implementation;
- problem-family catalog;
- special-case ladder;
- exact-vs-approximate decision prompts;
- future original casebook stories showing algorithms as subproblems in larger systems.

## 5. Practice is a progression, not a pile of questions

AgoCode combines these perspectives into six practice stages:

1. **Reinforce** — execute and explain a known mechanism.
2. **Create** — derive an approach from constraints.
3. **Build** — implement a larger artifact with interfaces and tests.
4. **Recognize** — diagnose a mixed problem without labels.
5. **Vary** — change one assumption and adapt the solution.
6. **Retrieve** — rebuild the reasoning after spacing.

This progression is now represented explicitly on `/syllabus` and shapes `/exercises`.

## 6. Canonical Problem Atlas

The Problem Atlas is a retrieval and recognition system, not a solution archive.

Each named entry stores only:

- short problem name or source exercise identifier;
- source/chapter provenance;
- broad domain;
- AgoCode-original structural lens;
- AgoCode-original tags;
- route to an original interactive lesson when available.

The atlas supports two modes:

- **Study mode** — structural lens and tags are visible.
- **Blind mode** — chapter/domain/tags/lens are hidden so the learner must recognize the structure.

A **Surprise me** action interleaves the currently filtered repertoire rather than encouraging chapter-by-chapter pattern guessing.

## 7. Goodrich workbook coverage

The source preface describes the exercise program as roughly 750 exercises. The supplied PDF contains **758 indexed `R`, `C`, and `P` references** across Chapters 1–15 using the identifiers extracted for this project. AgoCode preserves those identifiers while treating the discrepancy as a source-file/indexing detail rather than rewriting the book's own stated count.

AgoCode does not copy those prompts. Every identifier can open a reasoning notebook while the learner keeps their own copy of the source beside the site.

## 8. Persistent reasoning notebook

Every catalog problem can now use the same original eight-stage notebook:

1. Understand
2. Solve tiny/extreme cases
3. Establish a baseline
4. Name the waste
5. Choose strategy before tactics
6. Write the invariant
7. Analyze the real cost
8. Vary and transfer

The notebook autosaves locally, gates the structural hint until the learner has written a baseline and named the waste, records self-confidence, and can be copied as a design log.

## 9. Expanded syllabus

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

This adds missing foundations such as heaps, balanced trees, DFS/backtracking, string matching, MST/union-find, amortization, external memory, hardness, approximation, and concurrency without destroying the simplicity of the original entry path.

## 10. What to build next

After the current source expansion is stable:

1. capture reasoning-notebook evidence into the mastery engine;
2. add an open-ended Problem Design Canvas for arbitrary user problems;
3. connect syllabus modules to atlas entries automatically;
4. add original ADT workload-comparison labs;
5. add original casebook stories showing algorithms appearing inside larger systems;
6. draw mixed-recognition sessions from the full canonical atlas;
7. add project rubrics for the Goodrich-style Project tier;
8. add exact / heuristic / approximation branches for hard optimization problems.

## 11. Copyright transformation rule

For every source-derived feature, preserve the **learning objective and conceptual relationship**, not the expression.

Allowed transformation pattern:

> source idea → abstract teaching principle → original interaction / wording / example / illustration

Do not scan, trace, transcribe, or publish substantial source text, exercise statements, solutions, or illustrations unless appropriate permission exists.
