# Implementation Roadmap

## 1. Delivery strategy

AgoCode is built as complete learning slices, not as a large collection of half-finished pages.

The reference loop is:

```text
understand → predict → trace → implement → explain → transfer → recall
```

The Book Track follows the chapter progression of *Grokking Algorithms*. Every chapter should preserve the book's concrete-before-formal teaching order while adding original interactive visuals, execution, retrieval, and transfer.

## 2. Product / repository foundation

- [x] Next.js + TypeScript application
- [x] canonical paper / ink / AgoCode-red visual language
- [x] editorial, reading, and monospace typography roles
- [x] SVG-first AgoCode brand system
- [x] responsive Book / Roadmap / Lab / Practice / Review routes
- [x] Python execution in an isolated Web Worker
- [x] typecheck / lint / tests / production build in CI
- [x] reduced-motion and keyboard-access baseline
- [ ] extract design tokens from `app/globals.css` into a dedicated token module
- [ ] extract lesson content into a structured content schema where page-level JSX is becoming repetitive

CI gates:

```text
pnpm typecheck
pnpm test
pnpm lint
pnpm build
```

## 3. Shared learning runtime

### Visualization
- [x] semantic Binary Search event model
- [x] deterministic trace generation across multiple algorithms
- [x] forward / backward stepping
- [x] visited-history scrubbing
- [x] prediction gates before important transitions
- [x] shared deterministic timeline reducer
- [x] reusable timeline reducer tests
- [x] reusable stack / call-frame renderer
- [ ] topic-independent autoplay controller
- [ ] stable semantic code-line IDs independent of displayed source formatting
- [ ] reusable renderer contracts for array / linked-node / queue / graph / table views
- [ ] purposeful push/pop motion for stack transitions; reduced-motion fallback must remain explicit

### Python exercises
- [x] Pyodide worker
- [x] stdout / stderr capture
- [x] timeout + worker restart
- [x] visible tests
- [x] progressive hint ladder
- [x] Python-friendly Tab indentation
- [x] guided reconstruction
- [x] blank Binary Search reconstruction
- [x] Binary Search bug-repair mode
- [x] Selection Sort reconstruction
- [x] recursive factorial reconstruction
- [x] divide-and-conquer recursive-sum reconstruction
- [x] Quicksort reconstruction
- [ ] hidden-test separation
- [ ] decide whether Monaco materially improves learning UX before adding its weight

### Learning evidence
- [x] backward-compatible completion records
- [x] attempt-history persistence for Python exercises
- [x] best passed-test count
- [x] hint-count capture
- [x] first successful completion time preserved across later attempts
- [x] bounded local history
- [x] Home next-step routing through Chapters 1–4
- [x] delayed review entries through Chapter 4
- [ ] persistent prediction accuracy
- [ ] explicit mastery dimensions: Understand / Trace / Implement / Analyze / Recognize / Transfer
- [ ] evidence-strength weighting
- [ ] review success/failure rescheduling
- [ ] cross-device persistence/account layer

## 4. Chapter 1 — Introduction to Algorithms

### Binary Search
- [x] concrete ordered-search intuition
- [x] one-by-one vs. midpoint guessing
- [x] remaining-candidate visualization
- [x] logarithmic halving intuition
- [x] sorted-input counterexample
- [x] synchronized Python trace
- [x] custom sorted-array scenarios
- [x] prediction gates
- [x] invariant / sorted-input / complexity explanation check
- [x] guided reconstruction
- [x] blank reconstruction
- [x] boundary bug repair

### Transfer ladder
- [x] insertion position — direct transfer
- [x] first occurrence — boundary variant
- [x] rotated sorted array — structural pattern recognition
- [x] monotonic answer space — abstract/mixed transfer

### Running time / Big O / TSP
- [x] linear-vs-logarithmic growth interaction
- [x] doubled-input reasoning
- [x] Big O notation lesson
- [x] common growth classes
- [x] worst-case reasoning
- [x] factorial-growth / Traveling Salesperson scene
- [x] original route visualization
- [x] Chapter 1 cumulative retrieval check
- [x] Chapter 1 review evidence

Chapter 1 forms one connected narrative:

```text
algorithm idea
→ scaling question
→ growth notation
→ common growth classes
→ factorial explosion
→ cumulative retrieval
```

## 5. Chapter 2 — Memory, Arrays, Linked Lists, Selection Sort

The chapter follows the book's sequence closely: memory locations first, then arrays/lists and their trade-offs, then a first sorting algorithm.

### Memory model
- [x] addressed-slot visualization
- [x] single-value storage scene
- [x] contiguous array allocation scene
- [x] blocked-adjacent-slot / relocation scene
- [x] lesson completion evidence

### Arrays and linked lists
- [x] contiguous array representation
- [x] scattered linked-node representation
- [x] direct-index read comparison
- [x] middle insertion comparison
- [x] deletion comparison
- [x] explicit caveat that linked-list O(1) insert/delete assumes the relevant node/location is already known
- [x] lesson completion evidence
- [ ] richer pointer-rewiring animation rather than static state emphasis
- [ ] dedicated exercise that asks the learner to choose a structure from workload characteristics

### Selection Sort
- [x] deterministic semantic trace generator
- [x] repeated-smallest selection visualization
- [x] prediction at the start of each pass
- [x] shrinking unsorted list + growing sorted output
- [x] O(n²) scan-length explanation
- [x] Python reconstruction exercise
- [x] deterministic unit tests
- [x] Chapter 2 cumulative recap
- [x] review scheduling for Selection Sort / Chapter 2
- [ ] dedicated transfer problem beyond reproducing the sorting routine
- [ ] optional physical move animation for selected values

## 6. Chapter 3 — Recursion

The chapter follows the book's conceptual sequence: recursion as a clearer way to express nested work, base and recursive cases, ordinary call stacks, then recursive call-stack behavior.

### Visual/runtime primitives
- [x] reusable stack renderer
- [x] reusable call-frame renderer
- [x] ordinary function-call stack visualization
- [x] recursive call-stack visualization
- [x] visited-history timeline on recursive execution
- [x] trace prediction before recursive execution advances
- [ ] explicit push/pop spatial motion
- [ ] recursion-tree view for algorithms where branching is the core mental model
- [ ] fully synchronized source-line highlighting for recursive calls

### Lessons and recall
- [x] concrete nested-search analogy
- [x] loop/work-stack vs. recursive-call comparison
- [x] base case
- [x] recursive case and progress toward the base case
- [x] ordinary call stack / paused caller state
- [x] recursive factorial stack growth and unwinding
- [x] factorial Python reconstruction
- [x] deterministic factorial trace tests
- [x] Chapter 3 cumulative recap
- [x] Chapter 3 delayed review entry

Acceptance criterion: a learner can predict stack growth and unwinding, identify the base case, explain why every recursive call must make progress, and independently write a small recursive function rather than merely recognizing recursive syntax.

## 7. Chapter 4 — Divide & Conquer / Quicksort

This chapter builds directly on Chapter 3. It first makes the D&C reduction rule explicit, then uses Quicksort to show recursive partitioning and the effect of recursion shape on running time.

### Divide & Conquer
- [x] two-question D&C mental model: base case + smaller same problem
- [x] original rectangle / square reduction interaction
- [x] recursive-sum call-stack visualization
- [x] editable recursive-sum scenarios
- [x] recursive-sum Python reconstruction
- [x] deterministic recursive-sum tests
- [x] delayed recall entry

### Quicksort
- [x] base case for 0/1-item arrays
- [x] deterministic recursive trace generator
- [x] pivot + less/greater partition visualization
- [x] prediction gate on partition membership
- [x] recursive stack visualization
- [x] sorted-left + pivot + sorted-right combine explanation
- [x] editable input scenarios
- [x] first-item vs. middle-item pivot comparison on sorted input
- [x] balanced vs. lopsided recursion-depth visualization
- [x] O(n log n) average / O(n²) worst-case reasoning
- [x] Python reconstruction
- [x] deterministic Quicksort tests
- [x] Chapter 4 cumulative recap
- [x] Chapter 4 review scheduling
- [ ] optional recursion-tree view to complement the call-stack view
- [ ] merge-sort comparison if it adds learning value without interrupting the book-first sequence

## 8. Review and Home guidance

- [x] Home chooses the next learning action from local evidence
- [x] Home surfaces due-review count
- [x] Review queue through Chapter 4
- [x] blank-rebuild and bug-repair reviews
- [x] cumulative chapter recalls for Chapters 1–4
- [ ] review attempts should reschedule based on recall success, not only original completion date
- [ ] Home should surface the weakest mastery dimension, not only the next unfinished item

## 9. Chapter 5 — Hash Tables (next Book Track milestone)

Follow the book's order: hash-function intuition and useful applications first, then collisions/performance/load factor internals.

### Planned learning slice
- [ ] key → bucket visualization
- [ ] consistency / deterministic hash-function exercise
- [ ] lookup example
- [ ] duplicate-prevention example
- [ ] cache example
- [ ] collision visualization
- [ ] average vs. worst-case performance comparison
- [ ] load-factor interaction
- [ ] resize / rehash scene
- [ ] good-distribution intuition
- [ ] Chapter 5 cumulative recap / delayed recall

Acceptance criterion: a learner can explain why a hash table supports fast average-case lookup, identify the role of a deterministic hash function, explain collisions and load factor, and recognize lookup / duplicate-filtering / cache use cases.

## 10. Chapter 6 — Breadth-First Search

- [ ] graph renderer
- [ ] queue renderer
- [ ] visited-state visualization
- [ ] shortest-path level reasoning
- [ ] synchronized graph / queue / code trace

## 11. Chapter 7 — Dijkstra

- [ ] weighted graph
- [ ] priority queue
- [ ] distance labels
- [ ] relaxation history
- [ ] negative-edge counterexample

## 12. Chapter 8 — Greedy Algorithms

- [ ] local-decision visualization
- [ ] successful greedy example
- [ ] greedy-failure counterexample
- [ ] approximation intuition
- [ ] NP-complete recognition framing

## 13. Chapter 9 — Dynamic Programming

- [ ] table / grid renderer
- [ ] state-definition-first lesson flow
- [ ] dependency arrows
- [ ] incremental filling
- [ ] reconstruction where relevant

## 14. Chapter 10 — KNN

- [ ] 2D feature plot
- [ ] distance visualization
- [ ] neighborhood selection
- [ ] classification vs. regression

## 15. Chapter 11 — Where to Go Next

This chapter is exploratory and can use lighter interactions than the core algorithm chapters while preserving the book's role as a map toward further study.

## 16. Extension Track

Only after the Book Track foundation is stable enough to support transfer:

- [ ] two pointers
- [ ] sliding window
- [ ] prefix sum
- [ ] monotonic stack
- [ ] fast/slow pointers
- [x] binary-search boundary variants
- [x] rotated-array binary-search pattern
- [x] binary search on answer
- [ ] tree patterns
- [ ] heap
- [ ] trie
- [ ] backtracking
- [ ] topological sort
- [ ] union find
- [ ] intervals
- [ ] advanced DP

## 17. AI tutor

AI remains intentionally late. The deterministic learning loop must remain useful without it.

First acceptable AI capabilities:
- [ ] classify misconception from a failed attempt
- [ ] ask one Socratic question
- [ ] generate a small counterexample
- [ ] explain an execution trace
- [ ] assess a learner explanation

Do not ship a default “solve this for me” interaction.

## 18. Quality gate for every new topic

A topic should not enter the primary Book Track unless:

1. the mental model is clear before formal notation,
2. interaction works without developer explanation,
3. visual state and code remain synchronized when code is relevant,
4. mobile layout is usable,
5. keyboard access is preserved,
6. reduced-motion behavior exists,
7. exercises test reasoning rather than trivia,
8. implementation recall is possible when appropriate,
9. content and illustrations are original,
10. there is at least one delayed-recall or transfer task,
11. deterministic logic is covered by tests where practical.

## 19. Next milestone

The next substantial Book Track slice is **Chapter 5: Hash Tables**. Start with key→bucket and real use cases before exposing collisions, load factor, and resizing. In parallel, strengthen the learning engine by persisting prediction evidence and making review intervals respond to actual recall outcomes.
