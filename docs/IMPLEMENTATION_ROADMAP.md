# Implementation Roadmap

## 1. Delivery strategy

AgoCode is built as a sequence of complete vertical slices, not as a large collection of half-finished pages.

The reference learning loop is:

```text
understand → predict → trace → implement → explain → transfer → recall
```

Binary Search is the reference slice. Chapter breadth should only expand when this loop remains coherent and testable.

## 2. Phase 0 — Repository and product foundations

### Deliverables
- [x] Next.js + TypeScript app scaffold
- [x] Tailwind configuration
- [ ] dedicated design-token module (tokens currently live in `app/globals.css`)
- [x] editorial + mono font setup
- [x] base route structure
- [ ] content directory / schema extraction from page components
- [x] lint / typecheck / deterministic unit-test setup
- [x] CI build check
- [x] accessibility baseline

### Quality gate
CI currently runs:

```text
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

The first deterministic tests cover Binary Search event/trace generation and interval behavior.

## 3. Phase 1 — Design foundation

- [x] page shell
- [x] chapter navigation
- [x] editorial heading system
- [x] prose system
- [x] margin-note component
- [x] buttons / inputs
- [x] exercise surface
- [x] code surface
- [x] responsive reading layout
- [x] Home / Continue learning screen
- [x] Roadmap
- [x] Binary Search Read mode
- [x] Binary Search Lab mode
- [x] Binary Search Practice mode

The design should continue to pass the “Interactive Algorithm Notebook” test: editorial hierarchy, original explanatory visuals, restrained red, no generic SaaS dashboard language.

## 4. Phase 2 — Visualization runtime

### Core primitives
- [x] array renderer
- [x] pointer labels
- [x] range highlight / discarded state
- [x] comparison annotation
- [x] state inspector
- [x] visited-history timeline scrubbing

### Engine
- [x] semantic event types
- [x] deterministic trace model
- [x] forward/backward stepping
- [x] prediction gates that prevent skipping unreasoned transitions
- [x] reduced-motion baseline
- [ ] shared deterministic reducer abstraction
- [ ] play/pause autoplay
- [ ] topic-independent timeline controller

### Acceptance criteria
A learner can step forward/backward, scrub through already-unlocked states, identify `low/mid/high`, see discarded regions, and read a textual explanation of every transition.

## 5. Phase 3 — Binary Search interactive lesson

### Intuition and mental model
- [x] original ordered-search illustration
- [x] one-by-one vs. midpoint number guessing
- [x] remaining-candidate visualization
- [x] halving / logarithm intuition
- [x] sorted-input counterexample

### Code connection
- [x] Python 3 reference implementation
- [x] current-line highlighting
- [x] variable-to-visual synchronization
- [x] prediction before important branch updates
- [x] custom sorted-array / target scenarios
- [x] visited-step timeline
- [ ] stable semantic code-line IDs independent of displayed source formatting

### Embedded reasoning
- [x] maximum-step question
- [x] doubled-input reasoning (continued in Running Time)
- [x] invariant explanation check
- [x] sorted-input explanation check
- [x] complexity explanation check

## 6. Phase 4 — Code execution and reconstruction

### Runtime
- [x] Pyodide isolated in a Web Worker
- [x] stdout/stderr capture
- [x] timeout / worker restart
- [x] visible tests
- [x] result summary
- [x] progressive hint ladder
- [x] Python-friendly Tab indentation
- [ ] hidden-test separation
- [ ] richer editor / Monaco decision after the learning UX is stable

### Learning tasks
- [x] minimally scaffolded rebuild
- [ ] missing-line completion mode
- [ ] completely blank implementation mode
- [ ] bug-repair mode

## 7. Phase 5 — Mastery and review

### Evidence already captured
- [x] rebuild completion
- [x] explanation / invariant completion
- [x] insertion-position transfer completion
- [x] first-occurrence transfer completion
- [x] Chapter 1 cumulative recap completion
- [x] local spaced-review queue derived from completion evidence

### Still needed
- [ ] persistent attempt history, not only completion flags
- [ ] explicit mastery dimensions with confidence/evidence strength
- [ ] hint-usage weighting
- [ ] prediction accuracy persistence
- [ ] review success/failure rescheduling
- [ ] due-review section on the Home page
- [ ] bug-repair recall tasks

The future mastery model should distinguish Understand, Trace, Implement, Analyze, Recognize, and Transfer instead of collapsing everything into one progress percentage.

## 8. Phase 6 — Binary Search transfer ladder

- [x] insertion position — direct transfer
- [x] first-occurrence boundary — variant transfer
- [x] rotated sorted array — pattern transfer with the technique hidden from the problem framing
- [ ] binary search on answer — mixed/abstract transfer

### UX
- [x] record the learner's first hypothesis before coding
- [x] give reasoning feedback rather than only accepted/rejected output
- [x] remove explicit Binary Search wording from later problem framing
- [ ] compare the learner's initial hypothesis with final solution evidence

Once search-on-answer is implemented, this first ladder will cover exact → boundary → structural-recognition → abstract-answer-space transfer.

## 9. Phase 7 — Chapter 1 completion

- [x] Binary Search
- [x] Running Time lesson
- [x] interactive linear-vs-logarithmic growth visualization
- [x] Big O lesson
- [x] common complexity-class comparison
- [x] worst-case reasoning checkpoint
- [x] Traveling Salesperson factorial-growth scene
- [x] original SVG route visualization
- [x] Chapter 1 recap
- [x] Chapter 1 cumulative retrieval check
- [x] chapter-level review evidence

### Acceptance criteria
Chapter 1 now forms one narrative:

```text
algorithm idea
→ scaling question
→ growth notation
→ common growth classes
→ factorial explosion
→ cumulative retrieval
```

Further work here is polish/evidence quality rather than missing core lesson coverage.

## 10. Phase 8 — Chapter 2: Memory, Arrays, Lists, Selection Sort

### New visualization capabilities
- [ ] memory-slot view
- [ ] linked-node / pointer renderer
- [ ] insertion/deletion animations
- [ ] physical swap animation

### Lessons
- [ ] memory model
- [ ] arrays vs. linked lists
- [ ] operation trade-offs
- [ ] selection sort
- [ ] Chapter 2 recap and recall

### Acceptance criteria
Learners should explain both how Selection Sort works and why data-structure trade-offs matter before implementation details are memorized.

## 11. Phase 9 — Recursion

### New primitives
- [ ] call-stack renderer
- [ ] recursion-tree renderer

### Lessons
- [ ] base case
- [ ] recursive case
- [ ] stack
- [ ] call stack
- [ ] recursive call stack

## 12. Phase 10 — Quicksort / Divide & Conquer

- [ ] partition visualization
- [ ] recursive subproblem view
- [ ] average vs. worst-case comparison
- [ ] merge-sort comparison where pedagogically useful

## 13. Phase 11 — Hash Tables

- [ ] key → bucket visualization
- [ ] hash-function intuition
- [ ] collisions
- [ ] load factor
- [ ] lookup / duplicate / cache examples

## 14. Phase 12 — Graph foundation / BFS

- [ ] graph renderer
- [ ] queue renderer
- [ ] visited-state visualization
- [ ] shortest-path level reasoning

## 15. Phase 13 — Dijkstra

- [ ] weighted graph
- [ ] priority queue
- [ ] distance labels
- [ ] relaxation history
- [ ] negative-edge counterexample

## 16. Phase 14 — Greedy

- [ ] local-decision visualization
- [ ] successful greedy example
- [ ] greedy-failure counterexample
- [ ] approximation intuition
- [ ] NP-complete recognition framing from the Book Track

## 17. Phase 15 — Dynamic Programming

- [ ] table/grid dependency renderer
- [ ] state definition before recurrence
- [ ] dependency arrows
- [ ] incremental filling
- [ ] reconstruction where relevant

## 18. Phase 16 — KNN and Chapter 11

KNN:
- [ ] 2D feature plot
- [ ] distance visualization
- [ ] neighborhood selection
- [ ] classification vs. regression

Chapter 11 can use lighter interactions because its role is exploration and further reading rather than the same depth as the core chapters.

## 19. Phase 17 — Extension Track

Only after the Book Track foundation is stable:

- [ ] two pointers
- [ ] sliding window
- [ ] prefix sum
- [ ] monotonic stack
- [ ] fast/slow pointers
- [x] binary-search boundary variants
- [x] rotated-array binary-search pattern
- [ ] binary search on answer
- [ ] tree patterns
- [ ] heap
- [ ] trie
- [ ] backtracking
- [ ] topological sort
- [ ] union find
- [ ] intervals
- [ ] advanced DP

## 20. Phase 18 — AI tutor

AI remains intentionally late.

First acceptable AI capabilities:
- [ ] classify misconception from a failed attempt
- [ ] ask one Socratic question
- [ ] generate a small counterexample
- [ ] explain an execution trace
- [ ] assess a learner explanation

Do not ship a default “solve this for me” interaction.

## 21. Current quality gates

A topic should not enter the primary learning path unless:

1. the mental model is clear,
2. interaction works without developer explanation,
3. visualization and code stay synchronized where appropriate,
4. mobile layout is usable,
5. keyboard access is preserved,
6. reduced-motion behavior exists,
7. exercises test reasoning rather than trivia,
8. implementation recall is possible when appropriate,
9. content and illustrations are original,
10. there is at least one transfer or delayed-recall task.

## 22. Next milestone

Before Chapter 2 becomes the main implementation focus, finish:

1. search-on-answer transfer,
2. stronger mastery/attempt evidence,
3. due-review guidance on Home,
4. blank implementation / bug-repair modes,
5. visualization reducer/tests extraction where reuse will matter in Chapter 2.

Then Chapter 2 should be implemented as the next complete Book Track slice rather than as isolated pages.
