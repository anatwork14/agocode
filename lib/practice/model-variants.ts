import { getCanonicalExercise } from "../knowledge/all-exercises.ts";
import {
  atlasPatterns,
  classifiedAtlasExercises,
  type AtlasPatternId,
} from "./atlas-recognition.ts";

export type ModelVariantDecision = "same-family" | "new-family" | "depends";
export type ModelVariantDifficulty = "easier" | "similar" | "harder";

export type ModelVariantTemplate = {
  id: string;
  title: string;
  changedAssumption: string;
  prompt: string;
  expectedDecision: ModelVariantDecision;
  explanation: string;
  nextQuestion: string;
  targetFamilyId?: AtlasPatternId;
  difficulty: ModelVariantDifficulty;
};

export type ModelVariant = ModelVariantTemplate & {
  exerciseId: string;
  exerciseTitle: string;
  sourceFamilyId: AtlasPatternId;
  sourceFamilyLabel: string;
  targetFamilyLabel?: string;
};

export const modelVariantTemplates: Record<AtlasPatternId, ModelVariantTemplate[]> = {
  "analysis-correctness": [
    {
      id: "stronger-postcondition",
      title: "Strengthen the required guarantee",
      changedAssumption: "The algorithm must now establish a stronger postcondition, not merely return the same kind of output.",
      prompt: "Keep the mechanism fixed, but require an additional correctness guarantee. Does this leave the problem in the same structural family?",
      expectedDecision: "same-family",
      explanation: "The main work is still stating and proving a claim about behavior. The invariant or proof obligation must become stronger, but the organizing family remains analysis and correctness.",
      nextQuestion: "Which invariant or induction hypothesis must be strengthened so the new postcondition follows at termination?",
      difficulty: "harder",
    },
    {
      id: "production-latency-budget",
      title: "Replace a proof-only goal with a systems budget",
      changedAssumption: "The dominant requirement becomes a hard memory/latency budget under a production workload.",
      prompt: "Correctness is still necessary, but resource constraints now dominate the design. Should the first organizing family change?",
      expectedDecision: "new-family",
      explanation: "The proof remains a supporting obligation, but the first modeling question is now about interfaces, memory, latency, and system constraints.",
      nextQuestion: "Which resource is actually binding, and what implementation or architecture choice controls it?",
      targetFamilyId: "engineering-design",
      difficulty: "harder",
    },
  ],
  representations: [
    {
      id: "edit-heavy-workload",
      title: "Make known-position edits dominate",
      changedAssumption: "Random access becomes rare while insertions and removals at already-known positions dominate the workload.",
      prompt: "The data is still a sequence, but the operation mix changes sharply. Does the same family still organize the problem?",
      expectedDecision: "same-family",
      explanation: "Yes. This is still a representation decision: the workload changed which representation is attractive, not the underlying family of reasoning.",
      nextQuestion: "Which sequence representation makes the dominant operation cheap without making required navigation unacceptable?",
      difficulty: "similar",
    },
    {
      id: "ordered-range-queries",
      title: "Add dynamic ordered range queries",
      changedAssumption: "The sequence must support frequent inserts plus predecessor/successor or range queries by key.",
      prompt: "The requirement is no longer mainly positional sequence access. Should the structural family change?",
      expectedDecision: "new-family",
      explanation: "Maintained key order and range structure now dominate. A search-tree family is a better first model than choosing among flat sequence representations.",
      nextQuestion: "Which ordering invariant must survive updates so predecessor or range queries stay efficient?",
      targetFamilyId: "tree-order",
      difficulty: "harder",
    },
  ],
  "linear-adts": [
    {
      id: "bounded-ring",
      title: "Bound the pending-work buffer",
      changedAssumption: "The queue has a fixed maximum capacity and must reuse storage without shifting elements.",
      prompt: "FIFO order is unchanged, but storage is bounded. Does the same structural family still fit?",
      expectedDecision: "same-family",
      explanation: "Yes. FIFO semantics still define the abstraction; the implementation should become a circular buffer or equivalent bounded queue representation.",
      nextQuestion: "Which indices and wraparound invariant make enqueue/dequeue constant time without moving existing items?",
      difficulty: "similar",
    },
    {
      id: "priority-replaces-arrival-order",
      title: "Replace FIFO with priority",
      changedAssumption: "The next item is chosen by minimum priority rather than earliest arrival time.",
      prompt: "Pending work still exists, but removal order is no longer FIFO/LIFO. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. The defining access rule changed. Repeated extreme-priority access points to a heap/priority-queue model rather than a linear ADT.",
      nextQuestion: "Do you need only the current minimum/maximum, or also full order and arbitrary-key updates?",
      targetFamilyId: "heap-priority",
      difficulty: "similar",
    },
  ],
  hashing: [
    {
      id: "many-exact-lookups",
      title: "Increase exact-key query volume",
      changedAssumption: "The same exact membership/key queries repeat many more times while ordering remains irrelevant.",
      prompt: "The workload gets larger but the query shape does not change. Does the family change?",
      expectedDecision: "same-family",
      explanation: "No. Repeated exact keyed access strengthens the case for hashing; scale alone does not create a new structural problem.",
      nextQuestion: "What key representation, load factor, and collision policy keep expected lookup efficient?",
      difficulty: "similar",
    },
    {
      id: "ordered-neighbors",
      title: "Require predecessor and range queries",
      changedAssumption: "Queries now ask for neighboring keys and ordered ranges, not just exact membership.",
      prompt: "A key still identifies data, but order becomes semantically important. Should the first family change?",
      expectedDecision: "new-family",
      explanation: "Yes. Hashing destroys useful order. Maintained ordered search structure is now central.",
      nextQuestion: "Which balanced ordering invariant supports both updates and the required ordered queries?",
      targetFamilyId: "tree-order",
      difficulty: "harder",
    },
  ],
  "search-selection": [
    {
      id: "boundary-not-any-hit",
      title: "Change any hit into a boundary",
      changedAssumption: "Instead of finding any matching item, the output must be the first feasible position or transition boundary.",
      prompt: "The returned object changes from an item to a boundary. Does the same structural family still apply?",
      expectedDecision: "same-family",
      explanation: "Yes. Search/selection still organizes the task, but the invariant must preserve a monotone boundary rather than stop at the first equality.",
      nextQuestion: "Which side remains feasible after each comparison, and what loop condition identifies the first boundary exactly?",
      difficulty: "harder",
    },
    {
      id: "frequent-updates-with-order",
      title: "Make the ordered collection highly dynamic",
      changedAssumption: "The data receives frequent inserts/deletes between queries, so rebuilding or re-sorting for each search is unacceptable.",
      prompt: "Search is still required, but maintaining order under updates becomes the dominant difficulty. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. A dynamic ordered search structure becomes the first model; the query itself is no longer the only important operation.",
      nextQuestion: "What balance/order invariant keeps both updates and searches efficient over a long operation sequence?",
      targetFamilyId: "tree-order",
      difficulty: "harder",
    },
  ],
  "sorting-transform": [
    {
      id: "many-batch-queries",
      title: "Reuse one ordering across many queries",
      changedAssumption: "The input is static and many later queries can benefit from one preprocessing pass.",
      prompt: "The same transformation becomes reusable rather than one-shot. Does the family change?",
      expectedDecision: "same-family",
      explanation: "No. Sorting or another preprocessing transform still exposes the useful relation; the amortized value of that transform simply increases.",
      nextQuestion: "What relationships become local or searchable once the ordering is built once and reused?",
      difficulty: "similar",
    },
    {
      id: "streaming-top-k",
      title: "Forbid full reordering and ask only for top-k",
      changedAssumption: "Items arrive as a stream, memory is limited, and only the current k best items are required.",
      prompt: "A complete sorted order is no longer needed or even convenient. Should the structural family change?",
      expectedDecision: "new-family",
      explanation: "Yes. Repeated access to a bounded extreme set is better modeled with a heap/priority queue than by repeatedly sorting the entire stream.",
      nextQuestion: "Which heap orientation lets you evict the least useful member of the current top-k efficiently?",
      targetFamilyId: "heap-priority",
      difficulty: "harder",
    },
  ],
  "tree-order": [
    {
      id: "range-heavy-updates",
      title: "Mix updates with ordered range queries",
      changedAssumption: "Exact lookup, inserts, deletes, predecessor/successor, and range queries all matter over time.",
      prompt: "The workload broadens but retained order remains essential. Does the same family still organize the solution?",
      expectedDecision: "same-family",
      explanation: "Yes. The case for a balanced ordered tree becomes stronger because it must preserve order while updates occur.",
      nextQuestion: "What balance property prevents a sequence of updates from degrading ordered operations toward linear time?",
      difficulty: "harder",
    },
    {
      id: "only-next-extreme",
      title: "Keep only repeated minimum extraction",
      changedAssumption: "Range queries and exact ordered search disappear; the only recurring query is insert plus remove-min.",
      prompt: "Maintaining total search-tree order now provides more structure than the workload uses. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. A priority queue maintains only the partial order needed for repeated extreme access and is the better first model.",
      nextQuestion: "Which operations must be fast, and is full key order providing any benefit the workload actually consumes?",
      targetFamilyId: "heap-priority",
      difficulty: "similar",
    },
  ],
  "heap-priority": [
    {
      id: "mutable-priorities",
      title: "Allow priorities to change",
      changedAssumption: "Items already inside the priority queue can receive improved priorities and must be repositioned efficiently.",
      prompt: "The operation set grows beyond insert and extract-min. Does the same family still fit?",
      expectedDecision: "same-family",
      explanation: "Yes. It is still priority-queue reasoning, but the representation must support decrease/increase-key or indexed handles safely.",
      nextQuestion: "What additional index or handle is required so a changed key can be located before restoring heap order?",
      difficulty: "harder",
    },
    {
      id: "iterate-complete-order",
      title: "Require repeated in-order range traversal",
      changedAssumption: "The consumer repeatedly needs predecessor/successor and ordered ranges, not merely the next extreme.",
      prompt: "The workload now consumes much more of the total order. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. A balanced search tree exposes ordered navigation and ranges directly; a heap only guarantees order along parent-child paths.",
      nextQuestion: "Which maintained ordering relation supports both point updates and ordered traversal without re-sorting?",
      targetFamilyId: "tree-order",
      difficulty: "harder",
    },
  ],
  "recursive-search": [
    {
      id: "stronger-pruning-bound",
      title: "Add a safe monotone pruning bound",
      changedAssumption: "A partial choice can now prove that every completion below it is infeasible or dominated.",
      prompt: "The decision tree is unchanged, but more branches can be ruled out early. Does the family change?",
      expectedDecision: "same-family",
      explanation: "No. This is still recursive/backtracking search; the new bound improves pruning without changing the organizing state-space model.",
      nextQuestion: "What statement proves a pruned branch cannot contain a valid or better completion?",
      difficulty: "similar",
    },
    {
      id: "overlapping-substates",
      title: "Make many branches revisit the same substate",
      changedAssumption: "Different decision paths repeatedly reach equivalent remaining subproblems whose answers can be reused.",
      prompt: "Enumeration is now dominated by recomputing equivalent substates. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Often yes. Once overlapping subproblems and reusable optimal/count answers dominate, dynamic programming becomes the stronger first model.",
      nextQuestion: "Can you name a compact state whose answer is independent of the path used to reach it?",
      targetFamilyId: "dynamic-programming",
      difficulty: "harder",
    },
  ],
  "graph-traversal": [
    {
      id: "multi-source-unweighted",
      title: "Start from several sources at once",
      changedAssumption: "Several vertices are distance zero and the objective is still minimum unweighted hop count.",
      prompt: "The start condition changes, but every edge still costs one. Does the family change?",
      expectedDecision: "same-family",
      explanation: "No. Multi-source BFS is still graph traversal by layers; initialize the queue with all zero-distance sources and preserve first-discovery distance.",
      nextQuestion: "What initialization makes every source part of layer zero without allowing duplicate rediscovery?",
      difficulty: "harder",
    },
    {
      id: "nonnegative-edge-costs",
      title: "Give edges unequal non-negative costs",
      changedAssumption: "Fewest edges is no longer the same as cheapest path because traversals have different non-negative costs.",
      prompt: "Reachability remains graph-shaped, but layer count no longer matches the objective. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. A weighted shortest-path model is required; ordinary BFS cannot safely finalize by hop layer when edge costs differ.",
      nextQuestion: "What quantity should determine the next vertex to finalize, and why do non-negative weights matter?",
      targetFamilyId: "weighted-graphs",
      difficulty: "harder",
    },
  ],
  "weighted-graphs": [
    {
      id: "negative-edge-appears",
      title: "Allow a negative edge",
      changedAssumption: "A path edge can have negative weight, though the graph objective remains minimum total path cost.",
      prompt: "A familiar algorithm may become invalid, but does the broad structural family itself change?",
      expectedDecision: "same-family",
      explanation: "The family remains weighted-path reasoning, but a Dijkstra-style finalization invariant breaks. The algorithm must change to one whose assumptions allow negative weights.",
      nextQuestion: "Which proof step fails when a supposedly finalized distance can later be improved through a negative edge?",
      difficulty: "harder",
    },
    {
      id: "discard-costs-for-reachability",
      title: "Discard weights and ask only reachability",
      changedAssumption: "Edge costs become irrelevant; the output only asks whether or at what unweighted layer a vertex is reachable.",
      prompt: "The graph is unchanged, but the optimization objective disappears. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. Once weights have no semantic role, traversal structure and discovery state are the simpler first model.",
      nextQuestion: "Do you need layers, depth, components, cycles, or dependency order once path cost is removed?",
      targetFamilyId: "graph-traversal",
      difficulty: "easier",
    },
  ],
  "dynamic-programming": [
    {
      id: "reconstruct-solution",
      title: "Require the decisions, not just the optimum value",
      changedAssumption: "The output must include one optimal construction in addition to the optimum score/count.",
      prompt: "The recurrence can still compute the objective. Does reconstruction require a new structural family?",
      expectedDecision: "same-family",
      explanation: "No. The DP state remains useful; you must additionally preserve predecessor/choice information or reconstruct decisions from neighboring states.",
      nextQuestion: "What choice information is sufficient to walk backward from the final state without storing unnecessary history?",
      difficulty: "harder",
    },
    {
      id: "exchange-property-emerges",
      title: "Introduce a provably safe local exchange rule",
      changedAssumption: "The constraints now guarantee that a locally best choice can always be exchanged into some global optimum.",
      prompt: "Overlapping states may still exist, but a safe one-way commitment is now provable. Should the first family change?",
      expectedDecision: "new-family",
      explanation: "Yes. If an exchange argument truly makes local commitment safe, greedy reasoning can remove the need to enumerate reusable DP states.",
      nextQuestion: "Can you state the exchange argument that converts any optimum into one containing the greedy choice?",
      targetFamilyId: "greedy-approximation",
      difficulty: "easier",
    },
  ],
  "greedy-approximation": [
    {
      id: "proof-boundary-tightens",
      title: "Restrict inputs until the exchange proof holds",
      changedAssumption: "Inputs satisfy an additional structural property that makes the local choice provably safe.",
      prompt: "The heuristic-looking rule gains a correctness proof under the new assumption. Does the family change?",
      expectedDecision: "same-family",
      explanation: "No. This is exactly greedy reasoning done correctly: the important change is that the assumption boundary now supports an invariant or exchange argument.",
      nextQuestion: "Which new property is used in the exchange proof, and can you build a counterexample when it is removed?",
      difficulty: "similar",
    },
    {
      id: "local-choice-fails-overlap-remains",
      title: "Break the local rule but retain reusable substates",
      changedAssumption: "A local commitment can block the optimum, while subproblems overlap and have manageable state dimensions.",
      prompt: "The greedy proof fails, but repeated smaller states remain reusable. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. This is a classic signal for dynamic programming: delay commitment and compare alternatives through reusable state values.",
      nextQuestion: "What minimal state captures the information needed to compare the choices the greedy rule can no longer commit to?",
      targetFamilyId: "dynamic-programming",
      difficulty: "harder",
    },
  ],
  "text-indexing": [
    {
      id: "many-prefix-queries",
      title: "Turn one lookup into many prefix queries",
      changedAssumption: "The same text/key collection receives many prefix lookups after preprocessing.",
      prompt: "Query volume and prefix structure increase. Does the same family still organize the solution?",
      expectedDecision: "same-family",
      explanation: "Yes. Text indexing becomes even more valuable; a trie or prefix-oriented index can make repeated prefix work explicit.",
      nextQuestion: "Which preprocessing structure stores shared prefixes once instead of rescanning strings for every query?",
      difficulty: "similar",
    },
    {
      id: "edit-distance-objective",
      title: "Replace exact matching with minimum edit cost",
      changedAssumption: "The output is the minimum insert/delete/substitute cost needed to transform one sequence into another.",
      prompt: "The input is still text, but the objective becomes an optimization over aligned prefixes. Should the family change?",
      expectedDecision: "new-family",
      explanation: "Yes. The decisive structure is reusable prefix-pair states and transitions, which is dynamic programming rather than an exact-match index.",
      nextQuestion: "What does state (i, j) mean, and which predecessor states correspond to insert, delete, and substitute/match?",
      targetFamilyId: "dynamic-programming",
      difficulty: "harder",
    },
  ],
  "hard-optimization": [
    {
      id: "small-parameter-exact",
      title: "Make one exponential dimension genuinely small",
      changedAssumption: "The general instance remains hard, but a parameter controlling the branching factor is guaranteed to be tiny.",
      prompt: "Worst-case hardness remains, yet exact enumeration may now fit the real constraints. Does the family necessarily change?",
      expectedDecision: "depends",
      explanation: "It depends on the parameter and required guarantee. The problem class can remain hard while a bounded parameter makes exact recursive search practical for this workload.",
      nextQuestion: "Which parameter controls the exponential part, and what concrete upper bound makes exact search acceptable?",
      targetFamilyId: "recursive-search",
      difficulty: "easier",
    },
    {
      id: "approximation-allowed",
      title: "Relax exact optimality",
      changedAssumption: "A solution within a stated quality bound is acceptable and scale is too large for exact search.",
      prompt: "The objective is still a hard optimization problem, but the quality requirement changes. Does the broad family change?",
      expectedDecision: "same-family",
      explanation: "No. The hard-optimization family explicitly includes choosing approximation or heuristics when exact optimality is not the right requirement.",
      nextQuestion: "What guarantee is actually required: optimal, bounded approximation, or only a useful feasible result under a time budget?",
      difficulty: "similar",
    },
  ],
  "engineering-design": [
    {
      id: "external-memory",
      title: "Move the working set beyond RAM",
      changedAssumption: "The data no longer fits comfortably in memory, so page/block transfers dominate fine-grained CPU operations.",
      prompt: "The logical task may be unchanged, but the resource model changes dramatically. Does the same family still organize the design?",
      expectedDecision: "same-family",
      explanation: "Yes. This is algorithm engineering: the cost model and representation must change around memory hierarchy while preserving the task contract.",
      nextQuestion: "Which operations cause random block transfers, and how can layout or batching turn them into sequential access?",
      difficulty: "harder",
    },
    {
      id: "dependency-graph-emerges",
      title: "Expose explicit task dependencies",
      changedAssumption: "The system work can be expressed as tasks with prerequisite edges and the main objective is finding a valid execution order.",
      prompt: "System constraints still matter, but a clean graph model now captures the dominant dependency question. Should the first family change?",
      expectedDecision: "new-family",
      explanation: "Yes for the dependency subproblem. Once tasks and prerequisites are explicit, graph traversal/topological-order reasoning should solve that core before broader engineering concerns are reintroduced.",
      nextQuestion: "What are the vertices and directed edges, and what does a cycle mean for feasibility?",
      targetFamilyId: "graph-traversal",
      difficulty: "similar",
    },
  ],
};

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRank(seed: string, id: string) {
  return hashSeed(`${seed}:${id}`) / 0xffffffff;
}

function familyLabel(id: AtlasPatternId | undefined) {
  return id ? atlasPatterns.find((pattern) => pattern.id === id)?.label : undefined;
}

export function buildModelVariants(exerciseId: string, limit = 4, seed = "default"): ModelVariant[] {
  const exercise = getCanonicalExercise(exerciseId);
  const classified = classifiedAtlasExercises.find((item) => item.exercise.id === exerciseId);
  if (!exercise || !classified) return [];

  const safeLimit = Math.max(1, Math.min(8, Math.floor(limit)));
  return [...modelVariantTemplates[classified.family.id]]
    .sort((a, b) => seededRank(seed, a.id) - seededRank(seed, b.id))
    .slice(0, safeLimit)
    .map((template) => ({
      ...template,
      exerciseId,
      exerciseTitle: exercise.title,
      sourceFamilyId: classified.family.id,
      sourceFamilyLabel: classified.family.label,
      targetFamilyLabel: familyLabel(template.targetFamilyId),
    }));
}

export function buildMixedModelVariantSession(seed: string, size = 10): ModelVariant[] {
  const safeSize = Math.max(4, Math.min(16, Math.floor(size)));
  const familyOrder = [...atlasPatterns]
    .sort((a, b) => seededRank(`${seed}:families`, a.id) - seededRank(`${seed}:families`, b.id));
  const result: ModelVariant[] = [];

  for (const family of familyOrder) {
    if (result.length >= safeSize) break;
    const candidates = classifiedAtlasExercises
      .filter((item) => item.family.id === family.id)
      .sort((a, b) => seededRank(`${seed}:${family.id}:exercise`, a.exercise.id) - seededRank(`${seed}:${family.id}:exercise`, b.exercise.id));
    const source = candidates[0];
    if (!source) continue;
    const variants = buildModelVariants(source.exercise.id, 1, `${seed}:${family.id}:variant`);
    if (variants[0]) result.push(variants[0]);
  }

  return result;
}
