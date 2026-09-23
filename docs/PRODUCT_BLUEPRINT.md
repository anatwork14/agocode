# Product Blueprint

## 1. Vision

AgoCode is a visual-first learning environment for algorithms. Its primary objective is not exposure to more problems; it is durable algorithmic understanding.

A learner should be able to:

1. understand the idea behind an algorithm without memorizing syntax,
2. predict and trace its internal state,
3. re-implement it from a blank editor,
4. explain correctness, constraints, and complexity,
5. recognize when it applies to an unfamiliar problem,
6. retain the knowledge after days or weeks.

The canonical pedagogical backbone closely follows *Grokking Algorithms* by Aditya Bhargava. The book’s chapter progression and teaching philosophy are treated as the foundation. AgoCode adds interaction, execution, assessment, personalization, and transfer practice around that foundation.

## 2. Non-goals

AgoCode is not:

- a generic LeetCode clone,
- a static textbook reader,
- a passive animation gallery,
- an encyclopedia of every algorithm,
- an AI solution generator,
- a gamification-first streak product,
- a dashboard made of generic cards.

The product should remain focused on understanding and transfer.

## 3. Canonical learning loop

Every topic follows the same mastery loop:

### 3.1 See
Start with a concrete, intuitive problem. Avoid formal notation until the learner has a useful mental model.

### 3.2 Predict
Pause before important transitions and ask what happens next.

Examples:
- which half remains in binary search,
- which node enters a BFS queue,
- which stack frame is created in recursion,
- which DP cell is updated next.

### 3.3 Trace
Synchronize the visual state with code and variables. The learner should be able to scrub backward and forward through deterministic execution steps.

### 3.4 Rebuild
Hide the final implementation and require reconstruction from memory. Progress from partial scaffolding to a blank editor.

### 3.5 Explain
Require short explanations of invariants, preconditions, trade-offs, and time/space complexity.

### 3.6 Transfer
Apply the concept to progressively less-obvious problems. Later problems should hide the topic label.

### 3.7 Recall
Schedule retrieval after a delay. Re-test implementation and recognition rather than merely asking the learner to reread notes.

## 4. Book-faithful curriculum

The first curriculum track follows the book sequence.

### Chapter 1 — Introduction to Algorithms
- introduction to algorithms
- binary search
- running time
- Big O notation
- growth-rate intuition
- worst-case reasoning
- common Big O classes
- traveling salesperson as a complexity example

### Chapter 2 — Selection Sort
- memory model
- arrays and linked lists
- insertion/deletion trade-offs
- selection sort

### Chapter 3 — Recursion
- recursive and base cases
- stack
- call stack
- recursive call stack

### Chapter 4 — Quicksort
- divide and conquer
- quicksort
- Big O revisited
- merge sort vs. quicksort
- average vs. worst case

### Chapter 5 — Hash Tables
- hash functions
- lookup use cases
- duplicate prevention
- caching
- collisions
- performance
- load factor

### Chapter 6 — Breadth-First Search
- graph model
- BFS
- shortest path in unweighted graphs
- queue
- graph representation
- implementation
- running time

### Chapter 7 — Dijkstra’s Algorithm
- weighted shortest paths
- terminology
- relaxation intuition
- negative-weight limitation
- implementation

### Chapter 8 — Greedy Algorithms
- scheduling
- knapsack contrast
- set cover
- approximation
- NP-complete intuition

### Chapter 9 — Dynamic Programming
- knapsack
- recurrence and table construction
- state interpretation
- dependency reasoning
- longest common substring/subsequence

### Chapter 10 — K-Nearest Neighbors
- classification
- recommendation
- feature extraction
- regression
- feature quality
- introduction to ML applications

### Chapter 11 — Where to Go Next
- trees
- inverted indexes
- Fourier transform
- parallel algorithms
- MapReduce
- Bloom filters / HyperLogLog
- hashing/security-related topics
- locality-sensitive hashing
- Diffie-Hellman
- linear programming

## 5. Extension Track

The book track must remain clean and coherent. Interview-oriented techniques are layered afterward or linked as optional extensions.

Suggested extension topics:

- arrays & hashing patterns
- two pointers
- sliding window
- prefix sums
- stack / monotonic stack
- fast & slow pointers
- binary search boundaries
- binary search on answer
- tree DFS/BFS variants
- heap / priority queue
- trie
- backtracking
- topological sort
- union find
- minimum spanning tree
- intervals
- 1-D and 2-D DP patterns
- bit manipulation
- segment / Fenwick trees

## 6. Information architecture

### `/`
Today view. It answers: **What should I learn or review now?**

Primary content:
- continue current chapter,
- due-for-recall concepts,
- weakest mastery dimension,
- recent progress.

### `/roadmap`
Book-centered chapter map and prerequisite graph.

### `/learn/[chapter]/[topic]`
Editorial lesson experience.

### `/lab/[topic]`
Focused visualization/code environment.

### `/practice`
Mixed and unlabeled application problems.

### `/review`
Spaced retrieval queue.

### `/progress`
Mastery dimensions by topic.

### `/playground`
Free-form algorithm visualizer and custom input experimentation.

## 7. Product modes

### Read
Calm editorial layout with original illustration, analogy, prose, and embedded checks.

### Lab
High-information workspace containing:
- visualization,
- code,
- variable/state inspector,
- timeline controls.

### Practice
Minimal problem-solving environment:
- prompt,
- editor,
- tests,
- progressive hints.

### Review
Fast retrieval experience optimized for short sessions.

## 8. Lesson contract

Every core lesson must include the following sequence unless the concept clearly requires a variation:

1. **Concrete hook** — a relatable scenario.
2. **Manipulable example** — learner interacts before terminology.
3. **Visual mental model** — show what changes over time.
4. **Plain-language principle** — name the underlying idea.
5. **Formal terminology** — introduce algorithm/data-structure language.
6. **Code walkthrough** — annotate code and synchronize state.
7. **Checkpoint** — prediction or free-response question.
8. **Complexity** — derive from observed operations.
9. **Implementation task** — scaffolded or blank editor.
10. **Recap** — retrieval-oriented summary.
11. **Transfer** — related application problems.
12. **Review item generation** — schedule future recall.

## 9. Binary Search vertical slice

Binary Search is the first reference implementation for the entire platform.

### Scene A — Search analogy
Present a familiar ordered-search situation and let the learner choose between scanning from the start and opening near the middle.

### Scene B — Poor strategy
A 1–100 number game. The learner guesses sequentially and sees that each wrong guess removes only one candidate.

### Scene C — Better strategy
Encourage a midpoint guess. The candidate interval visibly halves after each response.

### Scene D — Derive the principle
Show the shrinking sequence visually and ask what happens to the search space after every step.

### Scene E — Logarithm intuition
Relate repeated halving to the number of steps required to reduce `n` candidates to one.

### Scene F — Preconditions
Make sorted input explicit. Include an experiment where unsorted input breaks the reasoning.

### Scene G — Code and state
Synchronize:
- array cells,
- indices,
- `low`, `mid`, `high`,
- current comparison,
- active code line.

### Scene H — Embedded exercises
Stop the lesson and require answers before moving through major conceptual transitions.

### Scene I — Blank rebuild
Ask the learner to implement binary search in Python 3 from an empty editor and pass edge-case tests.

### Scene J — Transfer
Suggested ladder:
- direct exact search,
- insertion position,
- first/last occurrence,
- rotated sorted array,
- binary search over a monotonic answer space.

## 10. Mastery model

Do not collapse knowledge into a single percentage. Track dimensions separately:

- **Understand** — can explain the idea and preconditions.
- **Trace** — can predict execution state.
- **Implement** — can code it independently.
- **Analyze** — can reason about complexity and trade-offs.
- **Recognize** — can identify the pattern without a topic label.
- **Transfer** — can solve a nontrivial variant.

Example state:

```text
Binary Search
Understand   4/4
Trace        4/4
Implement    3/4
Analyze      4/4
Recognize    2/4
Transfer     1/4
```

Recommendations should target the weakest dimension rather than simply repeating the topic.

## 11. Hint ladder

Never jump directly from confusion to a full solution.

1. Conceptual nudge
2. Invariant / observation
3. Pseudocode direction
4. Code skeleton
5. Full reveal

Hint usage reduces the confidence/mastery update for that attempt.

## 12. Practice ladder

Each topic should expose four levels:

1. **Direct** — almost the same as the learned algorithm.
2. **Variant** — same mechanism with changed details.
3. **Pattern** — requires recognition.
4. **Mixed** — multiple plausible approaches compete.

At higher levels, hide the topic name so recognition itself is practiced.

## 13. AI tutor role

AI should act as a Socratic tutor, not a default code generator.

Preferred actions:
- identify a misconception,
- ask a targeted question,
- generate a smaller counterexample,
- explain a failing trace,
- compare two approaches,
- assess a learner explanation,
- propose a new test case.

Discouraged default behavior:
- immediately producing complete code,
- revealing the pattern before the learner attempts classification,
- replacing the visualization with prose.

## 14. Success criteria

A topic is not considered successfully learned because the learner watched an animation or passed a multiple-choice quiz.

For a mature lesson, the learner should be able to return later and:

- explain the core idea,
- trace a fresh input,
- implement the algorithm from memory,
- state important constraints and complexity,
- recognize an unlabeled application,
- solve at least one transfer problem.

That outcome is the product’s primary measure of quality.
