export type StuckStateId =
  | "model"
  | "baseline"
  | "representation"
  | "correctness"
  | "greedy"
  | "dp-state"
  | "graph-model"
  | "complexity"
  | "debugging"
  | "transfer";

export type StuckAction = {
  label: string;
  href: string;
  kind: "read" | "workbench" | "practice" | "workspace";
};

export type StuckDiagnosis = {
  id: StuckStateId;
  label: string;
  symptom: string;
  diagnosis: string;
  firstMove: string;
  fieldNoteSlug: string;
  syllabusModuleId: string;
  actions: StuckAction[];
  questions: string[];
};

export const stuckDiagnoses: readonly StuckDiagnosis[] = [
  {
    id: "model",
    label: "I cannot model the problem",
    symptom: "The story has many nouns and rules, but I cannot say what the algorithm should operate on.",
    diagnosis: "The obstacle is still strategic. Naming an algorithm now would be premature because the objects, relationships, objective, or constraints are not yet stable.",
    firstMove: "Write one sentence for the input, one for the required output, then draw the smallest nontrivial example. Only after that choose a representation.",
    fieldNoteSlug: "model-before-optimize",
    syllabusModuleId: "understand-model",
    actions: [
      { label: "Read: Model before you optimize", href: "/blog/model-before-optimize", kind: "read" },
      { label: "Open the design workspace", href: "/solve", kind: "workspace" },
      { label: "Practice graph modeling", href: "/lab/graph-modeling", kind: "workbench" },
    ],
    questions: [
      "What are the actual inputs and outputs?",
      "Which nouns are entities and which are merely story decoration?",
      "What relationship or constraint connects the entities?",
    ],
  },
  {
    id: "baseline",
    label: "My brute force is too slow",
    symptom: "I have a correct procedure, but it repeatedly scans, recomputes, enumerates, or compares too much.",
    diagnosis: "This is a refinement problem. Keep the baseline because it is your correctness oracle, then name the repeated work before choosing an optimization.",
    firstMove: "Underline the operation performed most often. Ask whether sorting, indexing, caching, pruning, or a different representation can remove that exact repetition.",
    fieldNoteSlug: "brute-force-baseline",
    syllabusModuleId: "baseline-refine",
    actions: [
      { label: "Read: Brute force is a baseline", href: "/blog/brute-force-baseline", kind: "read" },
      { label: "Use the special-case ladder", href: "/lab/special-cases", kind: "workbench" },
      { label: "Open a canonical problem", href: "/exercises", kind: "practice" },
    ],
    questions: [
      "Which work is repeated?",
      "Can an answer be cached or a lookup be indexed?",
      "Would sorting make the expensive relationship local?",
    ],
  },
  {
    id: "representation",
    label: "I do not know which data structure to use",
    symptom: "Several containers look plausible and I am choosing by familiarity rather than by the workload.",
    diagnosis: "The missing step is separating the abstract behavior from its representation. A useful structure is defined by the operations you need and how often you need them.",
    firstMove: "List the required operations and rank them by frequency. Choose the ADT first, then compare representations by the cost of those operations.",
    fieldNoteSlug: "adt-before-representation",
    syllabusModuleId: "sequence-representations",
    actions: [
      { label: "Read: Choose the ADT first", href: "/blog/adt-before-representation", kind: "read" },
      { label: "Compare representations", href: "/lab/adt-workbench", kind: "workbench" },
      { label: "Browse structure problems", href: "/exercises", kind: "practice" },
    ],
    questions: [
      "What behavior must the client receive?",
      "Which operation dominates the workload?",
      "What capability are you paying for but never using?",
    ],
  },
  {
    id: "correctness",
    label: "I have an algorithm but cannot prove it",
    symptom: "The code seems to work on examples, but I cannot explain why every state transition preserves the answer.",
    diagnosis: "The implementation is ahead of the argument. You need a state promise that is true before the loop or recursion, remains true after one step, and implies the result at termination.",
    firstMove: "Write the invariant in plain language before touching the code again. Then test each update against that sentence.",
    fieldNoteSlug: "invariants-as-guardrails",
    syllabusModuleId: "correctness",
    actions: [
      { label: "Read: Invariants as guardrails", href: "/blog/invariants-as-guardrails", kind: "read" },
      { label: "Open the invariant workbench", href: "/lab/invariants", kind: "workbench" },
      { label: "Try mixed recognition", href: "/practice/atlas", kind: "practice" },
    ],
    questions: [
      "What remains true before and after every step?",
      "Why does the next transition preserve it?",
      "What does the invariant imply when the algorithm stops?",
    ],
  },
  {
    id: "greedy",
    label: "Greedy feels right, but I do not trust it",
    symptom: "A local choice looks attractive, yet I cannot tell whether committing now can destroy the global optimum.",
    diagnosis: "Greedy success needs structural justification, not confidence. Search for an exchange argument or invariant, and actively try to build the smallest counterexample.",
    firstMove: "State the local rule precisely, then attempt to break it with four or five items. If it survives, ask what exchange would transform an optimal solution into one using your first choice.",
    fieldNoteSlug: "invariants-as-guardrails",
    syllabusModuleId: "greedy-invariant",
    actions: [
      { label: "Read the counterexample section", href: "/blog/invariants-as-guardrails", kind: "read" },
      { label: "Revisit greedy boundaries", href: "/learn/greedy", kind: "workbench" },
      { label: "Compare optimization strategies", href: "/lab/optimization-strategies", kind: "practice" },
    ],
    questions: [
      "What exactly is the local choice?",
      "Can the smallest counterexample break it?",
      "What exchange argument would make the choice safe?",
    ],
  },
  {
    id: "dp-state",
    label: "I suspect DP, but cannot define the state",
    symptom: "Subproblems overlap, but my recurrence is vague or I keep adding dimensions without knowing what each cell means.",
    diagnosis: "Dynamic programming starts with semantics, not a table. The state must be a sentence describing one reusable smaller question whose answer is sufficient for larger states.",
    firstMove: "Complete the sentence: ‘dp[...] means the best/count/feasible answer for ___.’ Do not write the transition until that sentence is unambiguous.",
    fieldNoteSlug: "special-cases-ladder",
    syllabusModuleId: "dynamic-programming",
    actions: [
      { label: "Read: Special cases as a ladder", href: "/blog/special-cases-ladder", kind: "read" },
      { label: "Design a DP state", href: "/lab/dp-state-design", kind: "workbench" },
      { label: "Revisit Dynamic Programming", href: "/learn/dynamic-programming", kind: "practice" },
    ],
    questions: [
      "What does one state mean in a complete sentence?",
      "Which smaller states are sufficient to compute it?",
      "Which information from the history is truly necessary?",
    ],
  },
  {
    id: "graph-model",
    label: "This looks like a graph, but the graph is unclear",
    symptom: "I can sense relationships, yet I do not know what should be a vertex, what an edge means, or whether direction and weight belong on it.",
    diagnosis: "Traversal choice is downstream of graph construction. A perfect BFS or Dijkstra implementation cannot repair the wrong vertices or edges.",
    firstMove: "Write a vertex sentence and an edge sentence. Then decide directed/undirected and weighted/unweighted from the meaning of the relationship, not from the algorithm you hope to use.",
    fieldNoteSlug: "model-before-optimize",
    syllabusModuleId: "graph-representation",
    actions: [
      { label: "Read the modeling field note", href: "/blog/model-before-optimize", kind: "read" },
      { label: "Open graph modeling", href: "/lab/graph-modeling", kind: "workbench" },
      { label: "Practice Atlas recognition", href: "/practice/atlas", kind: "practice" },
    ],
    questions: [
      "What real thing becomes one vertex?",
      "What exact fact causes an edge to exist?",
      "Does direction or weight encode a real asymmetry or cost?",
    ],
  },
  {
    id: "complexity",
    label: "The constraints make every obvious solution impossible",
    symptom: "The straightforward exact approach explodes in time or memory, and optimizing constants will not change the outcome.",
    diagnosis: "The complexity bound is telling you to change strategy: exploit a special case, reduce the state space, accept approximation, prune search, or question whether exact optimality is required.",
    firstMove: "Estimate the operation budget from n. Then identify whether the barrier is polynomial degree, exponential branching, or memory volume before searching for a different algorithmic class.",
    fieldNoteSlug: "complexity-as-constraint",
    syllabusModuleId: "hardness",
    actions: [
      { label: "Read: Complexity is a constraint", href: "/blog/complexity-as-constraint", kind: "read" },
      { label: "Compare optimization strategies", href: "/lab/optimization-strategies", kind: "workbench" },
      { label: "Use the special-case ladder", href: "/lab/special-cases", kind: "practice" },
    ],
    questions: [
      "What scale must the solution actually survive?",
      "Is the explosion polynomial, exponential, or memory-bound?",
      "Can the requirement be restricted, approximated, or decomposed?",
    ],
  },
  {
    id: "debugging",
    label: "The idea is right, but edge cases keep breaking it",
    symptom: "The overall algorithm is plausible, yet boundaries, duplicates, empty inputs, ordering, or state updates fail.",
    diagnosis: "This is often an invariant or representation mismatch disguised as a coding bug. Random patching makes the failure harder to reason about.",
    firstMove: "Shrink the failing case until one transition is visibly wrong. Write what should have remained true immediately before that transition.",
    fieldNoteSlug: "tiny-and-extreme-cases",
    syllabusModuleId: "correctness",
    actions: [
      { label: "Read: Tiny and extreme cases", href: "/blog/tiny-and-extreme-cases", kind: "read" },
      { label: "Use the invariant workbench", href: "/lab/invariants", kind: "workbench" },
      { label: "Practice boundary bug repair", href: "/practice/binary-search/bug-repair", kind: "practice" },
    ],
    questions: [
      "What is the smallest failing input?",
      "Which state changed immediately before the answer became impossible?",
      "Which invariant or boundary condition did that update violate?",
    ],
  },
  {
    id: "transfer",
    label: "I solved it once, but cannot recognize variants",
    symptom: "I can reproduce a familiar solution under its chapter heading, but a changed story or constraint makes the method disappear.",
    diagnosis: "The stored memory is too tied to surface wording. Transfer improves when you retain structural clues, invariants, assumptions, and failure modes instead of a finished code listing.",
    firstMove: "Write the solved problem as signal → model → invariant → technique → assumptions. Then change one axis and solve again without the original chapter label.",
    fieldNoteSlug: "repertoire-not-memorization",
    syllabusModuleId: "pattern-repertoire",
    actions: [
      { label: "Read: Build a repertoire", href: "/blog/repertoire-not-memorization", kind: "read" },
      { label: "Run Atlas mixed recognition", href: "/practice/atlas", kind: "practice" },
      { label: "Browse transfer neighbors", href: "/exercises", kind: "workspace" },
    ],
    questions: [
      "Which clue should retrieve the technique without the chapter name?",
      "Which invariant survives a changed surface story?",
      "Which assumption would force a different technique?",
    ],
  },
];

export function getStuckDiagnosis(id: string) {
  return stuckDiagnoses.find((item) => item.id === id);
}

export function getDiagnosesForFieldNote(slug: string) {
  return stuckDiagnoses.filter((item) => item.fieldNoteSlug === slug);
}
