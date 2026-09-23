# Learning & Content Specification

## 1. Purpose

This document defines how AgoCode lessons are authored, assessed, and connected to practice. It is the content contract for curriculum authors, designers, and implementation agents.

The core curriculum should stay close to the pedagogical sequence of *Grokking Algorithms*: concrete examples first, visual explanation, short exercises, code execution, trade-offs, and recap. AgoCode adds interaction and retrieval without rewriting the sequence into a generic interview-prep curriculum.

## 2. Source hierarchy

For the Book Track:

1. *Grokking Algorithms* chapter structure is the canonical topic sequence.
2. The book's pedagogical intent guides lesson order and pacing.
3. AgoCode creates original wording, diagrams, illustrations, examples, exercises, and implementations where necessary.
4. Python 2.7 syntax from the book should be adapted to modern Python 3 while preserving the underlying algorithmic idea.
5. Additional interview-specific material is clearly labeled as extension content.

## 3. Lesson schema

Every lesson should be representable by structured content similar to:

```ts
interface Lesson {
  id: string
  chapterId: string
  slug: string
  title: string
  kind: 'concept' | 'algorithm' | 'data-structure' | 'application'
  prerequisites: string[]
  sourceReference?: {
    book: 'grokking-algorithms'
    chapter: number
    section?: string
  }
  objectives: LearningObjective[]
  sections: LessonSection[]
  visualScenarios: VisualScenario[]
  traceQuestions: TraceQuestion[]
  implementation?: ImplementationSpec
  exercises: Exercise[]
  recap: RecallPrompt[]
  transfer: TransferProblem[]
  reviewTemplates: ReviewTemplate[]
}
```

Content should be stored as data/MDX rather than hard-coded page markup where practical.

## 4. Required lesson sequence

### 4.1 Concrete hook
Begin with a scenario that makes the problem understandable before terminology.

Requirements:
- short,
- visualizable,
- relevant to the algorithm,
- no premature formulas.

### 4.2 Manipulable example
The learner should change something, choose an action, or make a prediction.

A lesson should not contain more than a few minutes of passive reading before the first interaction.

### 4.3 Mental model
Make the algorithm's changing state visible.

Examples:
- shrinking interval,
- moving pointers,
- queue contents,
- call stack,
- visited set,
- distance estimates,
- DP dependencies.

### 4.4 Plain-language principle
After the learner has seen the behavior, name the underlying idea.

### 4.5 Formalization
Introduce:
- terminology,
- invariants,
- preconditions,
- data structures,
- complexity notation.

### 4.6 Code synchronization
Code must be connected to the visual state. Avoid static code dumps.

### 4.7 Embedded checkpoint
Ask a prediction, short answer, trace, or state question before continuing.

### 4.8 Complexity derivation
Whenever possible, derive complexity from observed behavior instead of presenting a memorized result first.

### 4.9 Reimplementation
Require the learner to write code.

### 4.10 Recap
Use retrieval prompts, not only a summary paragraph.

### 4.11 Transfer
Apply the concept to a less-obvious problem.

### 4.12 Review generation
Create future retrieval items from the learner's mistakes and hint usage.

## 5. Interaction types

Supported learning interactions should include:

### Prediction
Learner chooses or types the next state.

### Trace
Learner manually updates variables/state for one or more steps.

### Ordering
Learner arranges operations in the correct sequence.

### Free response
Learner explains why a condition or invariant is necessary.

### Code completion
Learner fills selected missing lines.

### Skeleton implementation
Function signature and tests are given; logic is blank.

### Blank implementation
Only the problem contract and tests are visible.

### Counterexample
Learner supplies or evaluates an input that breaks an incorrect claim.

## 6. Exercise design

Exercises should occur at conceptual boundaries rather than being isolated in one large quiz page.

Preferred exercise types:
- compute the next state,
- estimate number of steps,
- explain a precondition,
- compare two approaches,
- classify complexity,
- identify a bug,
- write a tiny function,
- predict an edge-case result.

Multiple choice is acceptable when distractors encode meaningful misconceptions, but free response or trace tasks are preferred for core understanding.

## 7. Hint policy

Hints are progressive.

### Level 1 — Conceptual nudge
Remind the learner what property matters.

### Level 2 — Invariant / observation
Expose the central reasoning without code.

### Level 3 — Pseudocode
Show structural steps.

### Level 4 — Code skeleton
Reveal control structure and key variables.

### Level 5 — Full reveal
Show the solution only after explicit learner request.

Mastery scoring should account for hint depth.

## 8. Recap design

A recap should include prompts such as:
- What problem does this algorithm solve?
- What preconditions does it require?
- What state changes each step?
- What remains invariant?
- What is the time complexity and why?
- What common bug should you watch for?
- When should you not use this algorithm?

For algorithms, end with a short from-memory implementation task whenever feasible.

## 9. Mastery dimensions

### Understand
Evidence:
- explains idea in own words,
- identifies preconditions,
- distinguishes the algorithm from a similar approach.

### Trace
Evidence:
- predicts state changes,
- follows execution on unseen inputs.

### Implement
Evidence:
- writes working code from a blank or low-scaffold environment,
- handles edge cases.

### Analyze
Evidence:
- derives time/space complexity,
- explains trade-offs.

### Recognize
Evidence:
- detects the pattern without labels.

### Transfer
Evidence:
- solves a variant or mixed problem independently.

## 10. Review scheduling

Review should prioritize retrieval, not rereading.

Potential review items:
- implement from blank,
- answer one invariant question,
- trace a fresh input,
- identify a pattern from a problem statement,
- repair a bugged implementation.

A simple MVP scheduler can use intervals based on:
- correctness,
- latency,
- hint depth,
- number of retries,
- age of last successful recall.

Do not over-engineer spaced repetition before the core lesson experience works.

## 11. Transfer problem specification

Each transfer problem should have metadata:

```ts
interface TransferProblem {
  id: string
  title: string
  source: 'internal' | 'leetcode'
  sourceUrl?: string
  difficulty: 'direct' | 'variant' | 'pattern' | 'mixed'
  primaryConcepts: string[]
  prerequisites: string[]
  topicLabelVisibility: 'shown' | 'hidden'
  hints: Hint[]
  tests?: TestCase[]
}
```

Later-stage problems should hide `primaryConcepts` during the attempt.

## 12. Binary Search content contract

The first lesson is the reference implementation.

### Learning objectives
Learner can:
- explain why sorted input matters,
- describe repeated halving,
- trace `low`, `mid`, and `high`,
- implement a correct search loop,
- explain logarithmic growth,
- recognize common binary-search variants.

### Required interactive scenes

#### Scene 1 — Ordered search intuition
Learner chooses where to begin searching within an ordered collection.

#### Scene 2 — Sequential guessing
Learner experiences eliminating one candidate at a time.

#### Scene 3 — Midpoint guessing
Learner experiences eliminating half of the remaining candidates.

#### Scene 4 — Shrink sequence
Show candidate counts decreasing by repeated halving.

#### Scene 5 — Step-count reasoning
Learner predicts how many halvings are required for selected list sizes.

#### Scene 6 — Sorted-input experiment
Learner sees why interval elimination is invalid on unsorted input.

#### Scene 7 — Code/state synchronization
Render:
- `low`,
- `mid`,
- `high`,
- `guess`,
- target,
- active range,
- current code line.

#### Scene 8 — Edge cases
Include:
- empty list,
- one item,
- target first,
- target last,
- missing target,
- even/odd lengths,
- duplicate values as an extension discussion.

### Implementation target
Use modern Python 3:

```python
def binary_search(values: list[int], target: int) -> int | None:
    low = 0
    high = len(values) - 1

    while low <= high:
        mid = (low + high) // 2
        guess = values[mid]

        if guess == target:
            return mid
        if guess > target:
            high = mid - 1
        else:
            low = mid + 1

    return None
```

This is reference behavior, not content that should always be visible to the learner.

### Common misconceptions to detect
- binary search works on unsorted data,
- `high` should stay at `mid` under an inclusive interval without careful loop changes,
- using `/` instead of integer division,
- wrong loop condition,
- forgetting the not-found result,
- confusing `O(log n)` with a fixed number of steps.

## 13. Chapter authoring notes

### Arrays vs. linked lists
Visualize memory arrangement and operation trade-offs. Use an original analogy rather than reproducing book artwork.

### Recursion
Do not teach recursion only through self-calling syntax. Make base case, recursive case, and call-stack growth visible.

### Quicksort
Emphasize divide-and-conquer reasoning before implementation details.

### Hash tables
Teach the lookup mental model first, then collisions/load factor/performance.

### BFS
Show graph, queue, visited state, and discovered depth together.

### Dijkstra
Make relaxation the central operation. Explicitly distinguish it from unweighted BFS and show why negative edges are a limitation.

### Greedy
Use counterexamples so learners understand that local choice is not universally optimal.

### Dynamic programming
Force learners to define what the DP state means before filling a table.

### KNN
Keep the focus on similarity, feature choice, classification/regression intuition, and practical limitations.

## 14. Content quality checklist

A lesson is not ready unless:

- it preserves the intended topic order,
- it begins concretely,
- it contains a meaningful visual model,
- the learner interacts early,
- code is synchronized to state where relevant,
- there is at least one prediction/trace checkpoint,
- the learner must implement or manipulate something,
- complexity is explained rather than merely stated,
- recap uses retrieval,
- transfer problems exist,
- all illustrations and wording are original,
- no copyrighted page artwork or long text is reproduced.
