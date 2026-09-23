# Technical Architecture

## 1. Architecture goals

AgoCode's implementation should optimize for:

- deterministic algorithm visualization,
- synchronized code and state,
- easy authoring of new lessons,
- safe executable practice,
- responsive interaction,
- clear separation between pedagogy and rendering,
- incremental complexity.

The most important architectural decision is to represent algorithm execution as a sequence of **semantic events**, not as bespoke animation code.

## 2. Proposed stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS for layout/utilities
- CSS design tokens for the visual system

### Editor
- Monaco Editor

### Visualization
- SVG for most algorithm/data-structure scenes
- Canvas only when scale/performance clearly requires it
- D3 for layout/math helpers where beneficial, not as the primary component framework

### Execution
MVP:
- Python 3 in-browser using Pyodide
- Web Worker isolation to keep the UI responsive

Later:
- remote sandbox for C++/Java/Go or stronger resource isolation

### Persistence
- PostgreSQL / Supabase
- authentication can be added after local learning loop is stable

### Content
- MDX and/or structured TypeScript/JSON lesson definitions
- content data separated from visual components

## 3. High-level architecture

```text
Lesson Content
     │
     ├── prose / annotations
     ├── exercises
     ├── visual scenarios
     └── implementation tests
     │
     ▼
Learning Runtime
     │
     ├── lesson state
     ├── mastery state
     ├── hint state
     └── review scheduling
     │
     ├───────────────┐
     ▼               ▼
Algorithm Engine   Code Runner
     │               │
     ▼               ▼
Semantic Events   Test Results
     │
     ▼
Visualization Runtime
     │
     ├── renderer
     ├── state inspector
     ├── timeline
     └── code-line sync
```

## 4. Semantic event model

Avoid writing animation logic directly inside every algorithm component.

Algorithms should emit events such as:

```ts
type AlgorithmEvent =
  | { type: 'COMPARE'; left: ValueRef; right: ValueRef; result: number }
  | { type: 'SWAP'; a: IndexRef; b: IndexRef }
  | { type: 'SET_POINTER'; name: string; index: number }
  | { type: 'SET_RANGE'; low: number; high: number }
  | { type: 'VISIT_NODE'; nodeId: string }
  | { type: 'ENQUEUE'; queue: string; value: unknown }
  | { type: 'DEQUEUE'; queue: string; value: unknown }
  | { type: 'PUSH_STACK'; stack: string; value: unknown }
  | { type: 'POP_STACK'; stack: string; value: unknown }
  | { type: 'ENTER_CALL'; frame: CallFrame }
  | { type: 'EXIT_CALL'; frameId: string; returnValue?: unknown }
  | { type: 'RELAX_EDGE'; edgeId: string; oldDistance: number; newDistance: number }
  | { type: 'DP_READ'; cell: CellRef }
  | { type: 'DP_WRITE'; cell: CellRef; value: unknown }
  | { type: 'CODE_LINE'; lineId: string }
  | { type: 'ANNOTATION'; messageId: string }
```

Events should be serializable and deterministic.

## 5. Event trace

A run produces a trace:

```ts
interface ExecutionTrace {
  algorithmId: string
  input: unknown
  initialState: VisualState
  steps: TraceStep[]
}

interface TraceStep {
  index: number
  event: AlgorithmEvent
  stateAfter: VisualState
  explanation?: string
  codeLineId?: string
}
```

For MVP, storing `stateAfter` for each step is acceptable and simplifies backward scrubbing. Later, optimize with snapshots + event replay if traces become large.

## 6. Visualization primitives

Build reusable primitives before topic-specific scenes.

### Array renderer
Used by:
- binary search,
- sorting,
- two pointers,
- sliding window,
- prefix sums.

Capabilities:
- indices,
- range highlighting,
- pointers,
- comparisons,
- swaps,
- discarded state.

### Node/pointer renderer
Used by linked lists.

### Stack renderer
Used by recursion, DFS, expression problems.

### Queue renderer
Used by BFS.

### Tree renderer
Used by recursion trees, BSTs, heaps.

### Graph renderer
Used by BFS, Dijkstra, MST, topological concepts.

### Grid renderer
Used by matrix traversal and pathfinding.

### Table renderer
Used by dynamic programming.

### State inspector
Generic variable/value panel.

### Timeline
Generic playback controller:
- start,
- previous,
- play/pause,
- next,
- end,
- speed,
- scrubber.

## 7. Renderer contract

```ts
interface VisualizerProps {
  trace: ExecutionTrace
  stepIndex: number
  selectedEntity?: EntityRef
  onSelectEntity?: (entity: EntityRef) => void
}
```

Rendering must be a pure function of trace + selected step where practical. This makes playback, testing, screenshots, and debugging much easier.

## 8. Code synchronization

Source lines used for instructional code should carry stable IDs:

```ts
interface CodeLine {
  id: string
  source: string
}
```

Semantic events may reference `codeLineId`. The editor/viewer highlights the active line while the visualizer shows the corresponding state transition.

Selecting a variable in code should be able to highlight the matching visual entity through shared IDs.

## 9. Binary Search engine example

Input:

```ts
{
  values: [3, 5, 7, 9, 13, 18, 23],
  target: 13
}
```

Possible events:

```text
SET_RANGE(0, 6)
SET_POINTER(low, 0)
SET_POINTER(high, 6)
SET_POINTER(mid, 3)
COMPARE(9, 13)
SET_POINTER(low, 4)
SET_RANGE(4, 6)
SET_POINTER(mid, 5)
COMPARE(18, 13)
SET_POINTER(high, 4)
SET_RANGE(4, 4)
SET_POINTER(mid, 4)
COMPARE(13, 13)
FOUND(4)
```

The visualizer should not know how binary search computes these events; it only knows how to render the semantic state.

## 10. Lesson content architecture

Suggested repository structure:

```text
src/
  app/
    page.tsx
    roadmap/
    learn/[chapter]/[topic]/
    lab/[topic]/
    practice/
    review/
    progress/
  components/
    editorial/
    exercises/
    editor/
    visualization/
      primitives/
      timeline/
      state-inspector/
  algorithms/
    binary-search/
      engine.ts
      trace.ts
      tests.ts
    selection-sort/
    recursion/
  content/
    chapters/
      01-introduction/
        binary-search.mdx
        big-o.mdx
  lib/
    mastery/
    review/
    runner/
    content/
  styles/
    tokens.css
```

## 11. Content/visual scenario contract

A visual scene should be declarative where possible:

```ts
interface VisualScenario {
  id: string
  renderer: 'array' | 'graph' | 'tree' | 'stack' | 'queue' | 'grid' | 'table' | 'custom'
  input: unknown
  expectedConcepts: string[]
  checkpoints?: ScenarioCheckpoint[]
}
```

This lets content authors assemble lessons without editing low-level visualization code for every scene.

## 12. Exercise engine

```ts
type Exercise =
  | MultipleChoiceExercise
  | NumericExercise
  | ShortTextExercise
  | TraceExercise
  | CodeExercise
  | OrderingExercise
```

Every attempt should capture:

```ts
interface ExerciseAttempt {
  exerciseId: string
  startedAt: string
  submittedAt: string
  correct: boolean
  attempts: number
  hintsUsed: number[]
  response: unknown
}
```

## 13. Mastery state

```ts
interface TopicMastery {
  topicId: string
  understand: MasteryDimension
  trace: MasteryDimension
  implement: MasteryDimension
  analyze: MasteryDimension
  recognize: MasteryDimension
  transfer: MasteryDimension
}

interface MasteryDimension {
  level: 0 | 1 | 2 | 3 | 4
  confidence: number
  lastEvidenceAt?: string
  nextReviewAt?: string
}
```

Do not expose `confidence` as a fake-precision percentage to learners. Use it internally for recommendations.

## 14. Review scheduler

MVP recommendation score may be based on:

```text
priority =
  time_since_last_recall
  × uncertainty
  × importance
  × recent_error_factor
  × hint_dependency_factor
```

Keep the first version understandable and testable. Advanced spaced-repetition algorithms can come later.

## 15. Python execution

### MVP
Use Pyodide in a Web Worker.

Requirements:
- execution timeout,
- captured stdout/stderr,
- deterministic tests,
- reset worker after problematic execution,
- no network access from learner code,
- clear test summaries.

### Security note
Browser-side execution still needs resource limits. Never execute arbitrary learner Python on the server without isolation.

## 16. Test model

Code challenges need visible and hidden tests.

Binary Search examples:
- empty input,
- one-item hit,
- one-item miss,
- first element,
- last element,
- middle element,
- absent target,
- larger sorted input.

The test harness should report behavior without revealing every hidden test immediately.

## 17. State persistence

Minimum entities:

```text
User
ChapterProgress
LessonProgress
ExerciseAttempt
CodeAttempt
TopicMastery
ReviewItem
PracticeAttempt
```

Do not build social or leaderboard data models in MVP.

## 18. Performance principles

- visualization playback should stay on the client,
- avoid server round trips for every step,
- use memoized/pure render state,
- keep trace sizes bounded,
- use Web Workers for code execution,
- lazy-load Monaco and heavy visualization dependencies,
- keep Read mode lightweight.

## 19. Accessibility

Technical requirements:
- keyboard-accessible playback controls,
- non-color state labels,
- semantic buttons/forms,
- reduced-motion mode,
- text alternative/description for visual scenes,
- focus management after exercise submission,
- readable code zoom/scaling.

For users who reduce motion, state transitions should remain understandable through immediate visual updates and textual change summaries.

## 20. Testing strategy

### Unit tests
- algorithm event generation,
- reducer/state transitions,
- mastery calculations,
- review scheduler,
- lesson schema validation.

### Component tests
- visual primitive states,
- timeline behavior,
- exercise submission,
- hint ladder.

### Integration tests
- lesson → checkpoint → lab → code attempt → mastery update.

### End-to-end
The first E2E scenario should be Binary Search from lesson start through successful blank reimplementation.

## 21. Architectural non-negotiables

- Do not tie algorithm logic directly to animation DOM mutations.
- Do not hard-code lesson prose inside generic UI components.
- Do not create a bespoke playback system for every topic.
- Do not make visualization state depend on animation timing.
- Do not require a backend round trip for normal step playback.
- Do not introduce multi-language execution before Python 3 is excellent.
- Do not add AI into the critical learning path before deterministic pedagogy works.
