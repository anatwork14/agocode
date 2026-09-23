# Implementation Roadmap

## 1. Delivery strategy

AgoCode should be built as a sequence of complete vertical slices, not as a large collection of half-finished pages.

The first objective is to prove that one learner can move through:

```text
understand → predict → trace → implement → explain → transfer → recall
```

for **Binary Search**.

Only after that loop feels excellent should the platform expand to many topics.

## 2. Phase 0 — Repository and product foundations

### Deliverables
- [ ] Next.js + TypeScript app scaffold
- [ ] Tailwind configuration
- [ ] design token file
- [ ] editorial + mono font setup
- [ ] base route structure
- [ ] content directory structure
- [ ] lint / format / test setup
- [ ] CI build check
- [ ] accessibility baseline

### Acceptance criteria
- App starts locally with one command.
- Design tokens are imported globally.
- No arbitrary product colors or typography in initial components.
- `/`, `/roadmap`, `/learn`, `/lab`, `/practice`, and `/review` route shells exist.

## 3. Phase 1 — Design foundation

### Build
- [ ] page shell
- [ ] chapter navigation
- [ ] editorial heading system
- [ ] prose system
- [ ] margin note component
- [ ] buttons / inputs
- [ ] exercise surface
- [ ] code block component
- [ ] responsive reading layout

### Prototype screens
- [ ] Home / Continue learning
- [ ] Roadmap
- [ ] Binary Search Read mode
- [ ] Binary Search Lab mode
- [ ] Binary Search Practice mode

### Acceptance criteria
- Visual identity is recognizably editorial/illustrated rather than generic SaaS.
- Screens work at mobile, tablet, and desktop widths.
- Content hierarchy works without wrapping every section in cards.

## 4. Phase 2 — Visualization runtime

### Core primitives
- [ ] array renderer
- [ ] pointer labels
- [ ] range highlight / discarded state
- [ ] comparison annotation
- [ ] state inspector
- [ ] playback timeline

### Engine
- [ ] semantic event types
- [ ] trace model
- [ ] deterministic reducer
- [ ] forward/backward step support
- [ ] play/pause
- [ ] reduced-motion mode

### Acceptance criteria
Given a predefined Binary Search trace, a user can:
- step forward,
- step backward,
- scrub,
- identify `low/mid/high`,
- see active/discarded intervals,
- read a textual description of each transition.

## 5. Phase 3 — Binary Search interactive lesson

### Scene 1 — Search intuition
- [ ] original ordered-search illustration
- [ ] choice between scanning and midpoint reasoning

### Scene 2 — Sequential number guessing
- [ ] 1–100 interaction
- [ ] attempt counter
- [ ] visual elimination of one candidate

### Scene 3 — Midpoint strategy
- [ ] half-range elimination
- [ ] animated candidate interval
- [ ] prediction prompts

### Scene 4 — Halving / logarithm intuition
- [ ] shrinking-size visualization
- [ ] step-count questions

### Scene 5 — Sorted-input requirement
- [ ] sorted example
- [ ] unsorted counterexample

### Scene 6 — Code sync
- [ ] Python 3 reference implementation
- [ ] stable code line IDs
- [ ] current line highlight
- [ ] variable-to-visual entity linking

### Scene 7 — Book-style embedded exercises
- [ ] maximum-step question
- [ ] doubled-input question
- [ ] growth-rate checks

### Acceptance criteria
The learner should never need to leave the page to understand the core algorithm.

## 6. Phase 4 — Code execution and reconstruction

### Build
- [ ] Monaco integration
- [ ] Pyodide worker
- [ ] stdout/stderr capture
- [ ] timeout/reset behavior
- [ ] visible tests
- [ ] hidden tests
- [ ] result summary

### Learning tasks
- [ ] missing-line completion
- [ ] code skeleton
- [ ] blank implementation

### Hint ladder
- [ ] conceptual hint
- [ ] invariant hint
- [ ] pseudocode hint
- [ ] skeleton reveal
- [ ] full solution reveal

### Acceptance criteria
Learner can implement Binary Search from a blank editor and pass edge cases without page reload.

## 7. Phase 5 — Mastery and review

### Build
- [ ] mastery model
- [ ] attempt persistence
- [ ] dimension updates
- [ ] review queue
- [ ] due-review home section

### First mastery dimensions
- [ ] Understand
- [ ] Trace
- [ ] Implement
- [ ] Analyze
- [ ] Recognize
- [ ] Transfer

### Review tasks
- [ ] fresh trace
- [ ] blank implementation
- [ ] complexity explanation
- [ ] bug repair

### Acceptance criteria
The site can recommend a review task based on actual learner evidence rather than only chapter completion.

## 8. Phase 6 — Transfer / LeetCode bridge

### Binary Search ladder
- [ ] direct exact search
- [ ] insertion position
- [ ] boundary search
- [ ] rotated array
- [ ] search-on-answer problem

### UX
- [ ] direct problems may show the topic
- [ ] later problems hide the topic
- [ ] learner records initial hypothesis
- [ ] post-attempt reflection explains pattern match/mismatch

### Acceptance criteria
A learner can attempt an unlabeled problem and receive feedback focused on recognition, not just accepted/rejected status.

## 9. Phase 7 — Chapter 1 completion

Add:
- [ ] Running Time lesson
- [ ] Big O lesson
- [ ] growth-rate visualization
- [ ] common complexity classes
- [ ] worst-case reasoning
- [ ] Traveling Salesperson complexity scene
- [ ] Chapter 1 recap
- [ ] Chapter 1 cumulative review

### Acceptance criteria
Chapter 1 feels like a coherent interactive chapter, not several unrelated mini-apps.

## 10. Phase 8 — Chapter 2: Memory, Arrays, Lists, Selection Sort

### New visualization capabilities
- [ ] memory-slot view
- [ ] linked nodes / pointers
- [ ] insertion/deletion animations
- [ ] swap movement

### Lessons
- [ ] memory model
- [ ] arrays vs. linked lists
- [ ] operation trade-offs
- [ ] selection sort

### Acceptance criteria
Learners can explain not only how selection sort works but why data-structure trade-offs matter.

## 11. Phase 9 — Recursion

### New primitives
- [ ] call stack renderer
- [ ] recursion tree renderer

### Lessons
- [ ] base case
- [ ] recursive case
- [ ] call stack
- [ ] recursive call stack

### Acceptance criteria
A learner can predict stack growth/unwinding and independently write a simple recursive function.

## 12. Phase 10 — Quicksort / Divide & Conquer

### Build
- [ ] partition visualization
- [ ] recursive subproblem view
- [ ] average/worst-case comparison

### Acceptance criteria
Learner understands divide-and-conquer structure before memorizing quicksort code.

## 13. Phase 11 — Hash Tables

### Build
- [ ] key → bucket visualization
- [ ] collisions
- [ ] load factor
- [ ] caching/duplicate examples

## 14. Phase 12 — Graph foundation / BFS

### New primitives
- [ ] graph renderer
- [ ] queue renderer
- [ ] visited-state visualization

### Acceptance criteria
Graph + queue + visited set remain synchronized throughout traversal.

## 15. Phase 13 — Dijkstra

### Build
- [ ] weighted graph
- [ ] priority queue
- [ ] distance labels
- [ ] relaxation history
- [ ] negative-edge counterexample

## 16. Phase 14 — Greedy

Focus on:
- [ ] local decision visualization
- [ ] greedy-success example
- [ ] greedy-failure counterexample
- [ ] approximation intuition

## 17. Phase 15 — Dynamic Programming

### New primitive
- [ ] table/grid dependency renderer

### Content requirements
- state definition before recurrence,
- dependency arrows,
- incremental filling,
- reconstruction where relevant.

## 18. Phase 16 — KNN and Chapter 11

KNN can introduce:
- [ ] 2D feature plot
- [ ] distance visualization
- [ ] neighborhood selection
- [ ] classification/regression distinction

Chapter 11 is more exploratory and may use lighter interactive depth than core chapters.

## 19. Phase 17 — Extension Track

Only after the core Book Track works well:

- [ ] two pointers
- [ ] sliding window
- [ ] prefix sum
- [ ] monotonic stack
- [ ] fast/slow pointers
- [ ] binary search boundaries
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

AI is intentionally late.

Introduce only after deterministic learning flows are proven.

First AI capabilities:
- [ ] classify misconception from a failed attempt
- [ ] ask one Socratic question
- [ ] generate a small counterexample
- [ ] explain an execution trace
- [ ] assess learner explanation

Do not ship a default “solve for me” button.

## 21. MVP scope boundary

### Must have
- Chapter 1 Binary Search vertical slice
- excellent Read mode
- excellent Lab mode
- Python 3 execution
- embedded checkpoints
- blank rebuild
- first transfer ladder
- basic review scheduling

### Should have
- roadmap
- local progress persistence
- accessibility polish
- responsive mobile lesson

### Not MVP
- multiple programming languages
- leaderboards
- public profiles
- social feed
- discussions
- company filters
- achievements economy
- elaborate streak system
- AI-generated lessons
- hundreds of problems

## 22. Quality gates

A new topic should not be merged into the primary learning path unless:

1. the mental model is clear,
2. the interaction works without explanation from the developer,
3. visualization and code stay synchronized,
4. mobile is usable,
5. keyboard navigation works,
6. reduced-motion behavior works,
7. exercises test reasoning rather than trivia,
8. blank implementation is possible when appropriate,
9. original content/illustrations pass copyright review,
10. there is at least one transfer task.

## 23. Reference milestone definition

The most important early milestone is:

> A learner completes Binary Search, leaves the site, returns several days later, writes it from scratch, explains the sorted-input requirement and `O(log n)` behavior, and recognizes it in an unlabeled transfer problem.

Until that experience is excellent, feature breadth is secondary.
