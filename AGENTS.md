# AGENTS.md

This file defines implementation guardrails for coding agents and contributors working on AgoCode.

## 1. Product intent

AgoCode is a visual-first algorithm learning platform. The goal is durable understanding, independent implementation, and transfer to unfamiliar coding problems.

The core learning loop is:

```text
Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall
```

Do not optimize the product for content volume, streaks, or problem count at the expense of this loop.

## 2. Canonical source of truth

Read these documents before major implementation work:

1. `docs/PRODUCT_BLUEPRINT.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/LEARNING_CONTENT_SPEC.md`
4. `docs/TECHNICAL_ARCHITECTURE.md`
5. `docs/IMPLEMENTATION_ROADMAP.md`
6. `docs/CONTENT_COPYRIGHT_POLICY.md`

If implementation conflicts with these documents, prefer the documented product intent unless the task explicitly updates the specification.

## 3. Curriculum rule

The Book Track follows the progression of *Grokking Algorithms*.

Do not silently replace it with a NeetCode/LeetCode-first curriculum.

Interview patterns belong to the Extension Track or transfer layer.

## 4. Design non-negotiables

The interface should feel like an **Interactive Algorithm Notebook**.

Use:
- paper/ink editorial visual hierarchy,
- restrained dark red accent,
- original hand-drawn-style educational illustration,
- generous whitespace in Read mode,
- precise visualization in Lab mode,
- monospace for code and algorithm state.

Avoid:
- purple/blue AI gradients,
- generic SaaS dashboards,
- glassmorphism,
- neon glow,
- excessive rounded cards,
- decorative animation,
- arbitrary colors and radii,
- wrapping every content section in a card.

Use design tokens from the design system rather than one-off values.

## 5. Visualization architecture rule

Do not couple algorithm logic directly to DOM animation.

Preferred flow:

```text
algorithm engine
    ↓
semantic events
    ↓
execution trace
    ↓
visual state
    ↓
renderer + timeline + code sync
```

New algorithms should reuse visualization primitives where possible.

## 6. Semantic event rule

Prefer events such as:

```text
COMPARE
SWAP
SET_POINTER
SET_RANGE
VISIT_NODE
ENQUEUE
DEQUEUE
PUSH_STACK
POP_STACK
ENTER_CALL
EXIT_CALL
RELAX_EDGE
DP_READ
DP_WRITE
CODE_LINE
```

If a new event is needed, add it deliberately to the shared event model rather than inventing topic-specific animation state inside a component.

## 7. Learning-page rule

A lesson is not just prose.

Core algorithm lessons should include:
- concrete hook,
- interaction before heavy formalism,
- visual mental model,
- prediction/trace checkpoint,
- formal explanation,
- synchronized code,
- complexity reasoning,
- implementation task,
- recap,
- transfer task.

## 8. Code-learning rule

Do not make the final solution permanently visible beside every exercise.

Learners must eventually reconstruct algorithms from a blank or minimally scaffolded editor.

Hints must be progressive:
1. conceptual,
2. invariant/observation,
3. pseudocode,
4. skeleton,
5. full reveal.

## 9. Python rule

MVP is Python 3 only.

Do not add multi-language execution until the Python learning experience is stable and high quality.

## 10. AI tutor rule

AI is not part of the first critical path.

When AI is introduced, prefer:
- misconception detection,
- Socratic questions,
- counterexamples,
- trace explanation,
- explanation assessment.

Do not default to generating complete solutions.

## 11. Accessibility rule

Every interactive visualization must have:
- keyboard-usable controls,
- non-color state distinctions,
- readable labels,
- reduced-motion behavior,
- a textual description/change summary where needed.

Essential information must not depend on hover.

## 12. Responsive rule

Read mode:
- desktop may use annotation margins,
- mobile collapses notes inline.

Lab mode:
- desktop may use coordinated panes,
- mobile stacks visualization, state, and code without losing the learning sequence.

Never solve mobile overflow by shrinking text below comfortable reading sizes.

## 13. Content/copyright rule

The project is inspired by *Grokking Algorithms* but is not an authorized reproduction.

Do not commit:
- scanned pages,
- copied illustrations,
- long copied passages,
- copied answer keys,
- substantially identical page designs.

Create original prose, examples, illustrations, exercises, and interactive assets.

## 14. Initial implementation priority

Unless a task explicitly says otherwise, prioritize the Binary Search vertical slice in this order:

1. design tokens and page shell,
2. array/pointer visualization primitives,
3. semantic trace/timeline,
4. interactive Binary Search lesson,
5. code synchronization,
6. Python execution,
7. blank rebuild exercise,
8. mastery/review,
9. transfer problems.

Do not begin broad curriculum implementation before the Binary Search experience is coherent end-to-end.

## 15. Definition of done for a topic

A topic is not done when it has a page.

It is done when a learner can:
- understand the mental model,
- predict/trace fresh input,
- implement it independently where appropriate,
- explain complexity and constraints,
- apply it to at least one transfer problem,
- return later and recall it.

## 16. Engineering quality

Before merge:
- run lint/typecheck/tests,
- keep algorithm engines deterministic,
- add tests for event generation,
- test forward/backward timeline behavior,
- verify responsive layouts,
- verify keyboard access,
- avoid unnecessary dependencies,
- document any architectural deviation.
