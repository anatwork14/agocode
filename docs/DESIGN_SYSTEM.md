# Design System

## 1. Design direction: Interactive Algorithm Notebook

AgoCode should feel like a carefully typeset technical book transformed into an interactive programmer's notebook.

The visual language should be recognizably different from:

- generic SaaS dashboards,
- LeetCode clones,
- dark IDE-only products,
- purple-gradient AI products,
- card-grid-heavy learning platforms.

The product takes inspiration from the pedagogical visual character of *Grokking Algorithms*: editorial typography, black-ink illustrations, restrained red accents, handwritten-style annotations, generous whitespace, and diagrams that carry explanatory meaning. AgoCode must create **original** illustrations and interfaces rather than reproducing the book's assets.

## 2. Design principles

### 2.1 Learning before decoration
Every visual element must help one of these tasks:
- understand,
- compare,
- predict,
- trace,
- remember,
- navigate.

Decorative motion, gradients, glassmorphism, and visual noise should be avoided.

### 2.2 Concrete before abstract
Use visual progression:

```text
real-world analogy
      ↓
visual mental model
      ↓
precise algorithm state
      ↓
code / complexity
```

### 2.3 Flow, not cards
Normal reading content should flow like an editorial page. Cards are reserved for objects with clear boundaries, such as exercises, runnable labs, warnings, or independent practice items.

### 2.4 Motion explains state change
Animation must answer: **what changed and why?**

### 2.5 One symbolic grammar
Pointers, selected nodes, discarded regions, queue/stack movement, code-line highlights, and state labels should behave consistently across topics.

## 3. Color tokens

Use semantic tokens only. Components must not invent arbitrary colors.

```css
:root {
  --paper: #fcfbf7;
  --surface: #ffffff;
  --ink: #171717;
  --ink-secondary: #55524d;
  --muted: #817d76;
  --border: #ddd9d0;
  --note: #eeedea;

  --accent: #a62424;
  --accent-soft: #f4e8e6;

  --state-current: #a62424;
  --state-candidate: #315b78;
  --state-visited: #64745c;
  --state-discarded: #b4b0a8;
  --state-success: #426a4a;
  --state-warning: #a06a32;
}
```

### Accent rules
The dark editorial red is the signature accent. Use it for:
- current lesson,
- active execution line,
- selected algorithm object,
- important annotation,
- active navigation,
- key terms.

Do not use it as a large decorative background.

### Accessibility
Color must never be the only carrier of meaning. Combine it with:
- labels,
- border styles,
- patterns,
- icons,
- opacity,
- spatial position.

## 4. Typography

Three typographic voices are required.

### 4.1 Editorial display
Recommended: `Fraunces`.

Use for:
- chapter numbers,
- lesson titles,
- large conceptual headings.

### 4.2 UI / reading
Recommended: `Geist` or `Source Sans 3`.

Use for:
- body prose,
- controls,
- navigation,
- metadata.

### 4.3 Code / state
Recommended: `JetBrains Mono`.

Use for:
- code,
- variable names,
- complexity notation,
- state inspectors,
- pointer labels,
- algorithm events.

### Reading metrics
- prose max width: approximately 68–72 characters,
- body line-height: 1.65–1.75,
- avoid overly small secondary text,
- code must remain legible at mobile widths.

## 5. Spacing system

Use a 4px base rhythm:

```text
4, 8, 12, 16, 24, 32, 48, 64, 96, 128
```

No arbitrary one-off spacing values without a documented reason.

## 6. Shape system

Avoid excessive rounded cards.

Recommended radii:

```text
small detail     4px
control          6px
panel            10px
```

Avoid defaulting to `rounded-2xl` or pill shapes.

Shadows should be rare. Prefer borders, whitespace, and typography for hierarchy.

## 7. Illustration system

### 7.1 Purpose
Illustrations exist to introduce or reinforce a mental model.

### 7.2 Visual style
Original illustrations may use:
- black imperfect strokes,
- off-white fills,
- little/no gradient shading,
- occasional red annotation,
- simple expressive characters and objects,
- handwritten annotation style for informal notes.

### 7.3 Reusable motif library
Build a consistent original library for:
- person / learner,
- books / dictionary,
- drawers / memory,
- nodes and roads,
- bags / grouping,
- store / lookup,
- maps,
- queue / stack metaphors,
- table / grid,
- computer / program.

Do not reuse scanned or copied illustrations from the source book.

## 8. Editorial page anatomy

A Read-mode lesson should generally support:

```text
chapter eyebrow
large editorial title
short concept framing
illustration or interactive analogy
body explanation
margin annotation / note
prediction checkpoint
formalization
code or lab entry point
exercise
recap
```

Desktop may use margin notes. Mobile collapses margin notes inline at the point they apply.

## 9. Margin annotations

Margin annotations are a signature component.

Examples:

```text
NOTE
Binary search requires sorted input.
```

```text
WHY?
What does `high` represent in this implementation?
```

```text
WATCH
Changing the interval convention changes the loop condition.
```

Design:
- narrow width,
- smaller typography,
- restrained border/rule,
- no floating tooltip dependency,
- must remain accessible on touch devices.

## 10. Control system

Primary control labels should be direct:
- Continue →
- Run
- Step
- Back
- Reset
- Check answer
- Show hint
- Try again

Default button:
- white/paper surface,
- 1px ink/border,
- 6px radius.

Primary action:
- ink background,
- paper text.

Learning accent action:
- red text or red rule rather than large red fill.

## 11. Visualization grammar

### 11.1 Array

```text
┌────┬────┬────┬────┬────┐
│  3 │  5 │  7 │  9 │ 13 │
└────┴────┴────┴────┴────┘
  0    1    2    3    4
```

### 11.2 Pointer

```text
      low
       ↓
┌────┬────┬────┬────┐
```

### 11.3 Current value
Use stronger outline + label, not only a fill color.

### 11.4 Discarded region
Reduce opacity and optionally apply a subtle hatch/pattern.

### 11.5 Comparison
Always render the actual comparison in state form, for example:

```text
7 < 12
```

### 11.6 State transition
Show the semantic update explicitly:

```text
high = mid - 1
```

## 12. Topic-specific motion

### Binary search
- candidate interval contracts,
- discarded values fade and/or hatch,
- `mid` moves to the new center.

### Sorting
Elements physically exchange positions. Do not communicate swaps only by recoloring.

### Queue
Insertion enters at the back; removal exits from the front.

### Stack
Push/pop should visibly reinforce LIFO ordering.

### Recursion
New frames appear as nested/call-stack structure with clear caller/callee relation.

### Dijkstra
Distance labels transition from old to improved values while the relaxed edge is visibly emphasized.

### Dynamic programming
Cell update should highlight source dependencies before writing the new result.

## 13. Product modes

### Read mode
- dominant whitespace,
- editorial typography,
- illustrations and prose,
- inline interactions.

### Lab mode
- denser layout,
- visualization + code + state + timeline,
- still uses paper/ink palette.

### Practice mode
- minimal visual noise,
- problem and editor dominate,
- hints hidden until requested.

### Review mode
- compact retrieval tasks,
- fast transitions,
- no unnecessary reading.

## 14. Responsive behavior

Desktop:
- reading column + optional annotation margin,
- lab can use two/three coordinated panes.

Tablet:
- collapse annotation margin,
- preserve visualization beside code when practical.

Mobile:
- single-column lesson flow,
- visualizer becomes full-width,
- code follows visual state,
- state inspector becomes a compact expandable section,
- timeline controls remain thumb-friendly.

Never depend on hover for essential information.

## 15. Dark mode

Dark mode is optional for early MVP. The canonical visual identity is paper/ink and should be perfected first.

If introduced later, it must preserve the semantic hierarchy rather than simply invert colors.

## 16. Forbidden design patterns

Do not introduce without explicit design review:
- purple/blue AI gradients,
- glassmorphism,
- neon glow,
- decorative 3D blobs,
- excessive drop shadows,
- huge border radii,
- card wrapping around every paragraph,
- motion unrelated to state changes,
- color-only algorithm states,
- tiny unreadable code,
- generic dashboard home page.

## 17. Design acceptance checklist

Before accepting a screen:

- Does the hierarchy work without cards?
- Is the important learning object visually dominant?
- Does every animation explain state change?
- Are the visual states understandable without color alone?
- Are prose line lengths readable?
- Is the book/editorial identity recognizable?
- Is code visually linked to algorithm state?
- Does mobile preserve the learning sequence?
- Are illustrations original?
- Are arbitrary colors/radii/shadows absent?
