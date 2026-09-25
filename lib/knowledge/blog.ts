export type FieldNote = {
  slug: string;
  number: string;
  title: string;
  thesis: string;
  sources: string[];
  readingMinutes: number;
  sections: { heading: string; body: string[] }[];
  questions: string[];
};

export const fieldNotes: FieldNote[] = [
  {
    slug: "model-before-optimize",
    number: "01",
    title: "Model before you optimize",
    thesis: "The biggest algorithmic leap is often deciding what the problem really is, not choosing a faster implementation of the first formulation that came to mind.",
    sources: ["Skiena", "EPI"],
    readingMinutes: 6,
    sections: [
      {
        heading: "Translate the story into objects and relationships",
        body: [
          "A problem statement arrives wrapped in nouns from a domain: cities, users, files, meetings, prices. Before naming an algorithm, strip the story down to the things that can change and the relationships that constrain them.",
          "Several formulations may be valid. A route can be a graph path; a schedule can be an interval set; repeated membership can be a dictionary problem. The useful formulation is the one whose operations line up with a structure or algorithm we already understand.",
        ],
      },
      {
        heading: "Strategy comes before tactics",
        body: [
          "Choosing an adjacency list instead of a matrix is a tactical decision. Deciding that the application is a shortest-path problem is strategic. Tactical optimization cannot rescue a wrong model.",
          "AgoCode therefore asks for a model sentence before code: ‘I will represent ___ as ___ because the operation I need most is ___.’ That sentence is deliberately falsifiable; later evidence can force you to change it.",
        ],
      },
      {
        heading: "Make scale part of the model",
        body: [
          "Ten items, ten thousand items, and ten billion items are not the same problem. Exactness, latency, memory, update frequency, and implementation budget all influence which model is useful.",
        ],
      },
    ],
    questions: ["What are the actual inputs and outputs?", "What relationship is hidden by the story?", "Could this be modeled in two different ways?", "Which formulation makes the dominant operation easiest?"],
  },
  {
    slug: "brute-force-baseline",
    number: "02",
    title: "Brute force is a baseline, not an embarrassment",
    thesis: "A slow correct solution exposes the search space, gives you a correctness reference, and tells you exactly what work an optimization must eliminate.",
    sources: ["EPI", "Skiena"],
    readingMinutes: 5,
    sections: [
      {
        heading: "First make the problem executable",
        body: [
          "When the optimized solution is unclear, write down the most literal correct procedure. Enumerate choices, scan every pair, recompute every subproblem—whatever makes correctness obvious.",
          "The baseline is useful even when you never ship it. It establishes shared meaning, gives test cases an oracle, and turns the vague request ‘make it faster’ into a concrete question: which repeated work dominates?",
        ],
      },
      {
        heading: "Optimize a named waste",
        body: [
          "Do not jump from O(n²) to a memorized O(n) pattern. Name the waste: repeated membership checks, repeated minimum extraction, repeated overlapping subproblems, scanning a region whose order already proves it irrelevant.",
          "Only then choose the transformation: sort, hash, heap, cache, partition, or change the model entirely.",
        ],
      },
    ],
    questions: ["What is the simplest obviously correct algorithm?", "What work does it repeat?", "Can that work be cached, indexed, sorted, or ruled out?", "Does the optimized version preserve the same answer on tiny cases?"],
  },
  {
    slug: "tiny-and-extreme-cases",
    number: "03",
    title: "Solve tiny and extreme cases by hand",
    thesis: "Small cases reveal mechanics; extreme cases reveal false assumptions. Together they are one of the fastest ways to discover structure before coding.",
    sources: ["EPI", "Skiena", "Goodrich"],
    readingMinutes: 4,
    sections: [
      {
        heading: "Tiny cases expose the mechanism",
        body: [
          "Use the smallest nontrivial input that still contains the difficulty. Draw it, mutate it, and record every decision. If you cannot explain the answer for five nodes or six array elements, a general implementation will hide rather than fix the confusion.",
        ],
      },
      {
        heading: "Extremes attack assumptions",
        body: [
          "Try empty input, one item, all equal values, already sorted input, reverse order, a line-shaped tree, a complete graph, zero capacity, and maximum duplication. These cases often reveal which invariant the algorithm actually depends on.",
        ],
      },
    ],
    questions: ["What is the smallest case containing the hard part?", "What happens when every value is equal?", "What happens when the structure is maximally unbalanced?", "Which assumption failed first?"],
  },
  {
    slug: "sort-to-see-structure",
    number: "04",
    title: "Ask what becomes easy after sorting",
    thesis: "Sorting is often a change of representation: it turns global relationships into local adjacency, enables binary search, and exposes runs, duplicates, intervals, and ranks.",
    sources: ["Skiena", "EPI", "Goodrich"],
    readingMinutes: 5,
    sections: [
      {
        heading: "Order can be an algorithmic primitive",
        body: [
          "After sorting, the closest pair in one dimension becomes adjacent, duplicates become runs, rank becomes position, and many interval operations become a single sweep. The O(n log n) preprocessing cost can buy a much simpler problem.",
          "This is why ‘Can I sort it?’ belongs near the beginning of a problem-solving checklist rather than being reserved for sorting questions.",
        ],
      },
      {
        heading: "But sort with intent",
        body: [
          "Ask whether original order carries meaning, whether stability matters, whether keys have a small range, whether data is already nearly sorted, and whether the dataset fits in memory. Those facts determine whether sorting is a harmless transformation or destroys information you need.",
        ],
      },
    ],
    questions: ["What becomes adjacent after sorting?", "Can a scan replace pairwise comparison?", "Can binary search replace repeated lookup?", "Does sorting destroy a required notion of original order?"],
  },
  {
    slug: "adt-before-representation",
    number: "05",
    title: "Choose the ADT before the representation",
    thesis: "A stack, queue, map, priority queue, or sequence is a behavioral contract. Arrays, linked nodes, heaps, and hash tables are competing ways to realize that contract.",
    sources: ["Goodrich"],
    readingMinutes: 6,
    sections: [
      {
        heading: "Separate what from how",
        body: [
          "If a problem only needs ‘insert an item and repeatedly remove the smallest,’ the essential abstraction is a priority queue. Whether it is backed by a sorted list, unsorted list, or binary heap is a second question governed by workload.",
          "This separation makes trade-offs visible. A linked representation can make insertion at a known position constant time while sacrificing direct indexing and locality. An array makes index access immediate but may shift many elements for interior edits.",
        ],
      },
      {
        heading: "Start from the operation budget",
        body: [
          "Write the operations and their expected frequencies before picking the representation. A structure is not ‘fast’ in the abstract; it is fast for a particular mix of operations under particular memory and ordering constraints.",
        ],
      },
    ],
    questions: ["What behavior does the client actually require?", "Which operations dominate?", "Which representation makes those operations cheap?", "What capability are you paying for but not using?"],
  },
  {
    slug: "invariants-as-guardrails",
    number: "06",
    title: "An invariant is a guardrail for every state change",
    thesis: "The most useful correctness statement is often not about the final answer; it is about what must remain true after each operation.",
    sources: ["Goodrich", "EPI"],
    readingMinutes: 5,
    sections: [
      {
        heading: "State the promise before the loop",
        body: [
          "Binary search is easier to reason about when the promise is explicit: if the target exists, its index remains inside the candidate interval. Dijkstra is easier when processed vertices have final shortest distances under its assumptions. A heap is easier when every update preserves heap order.",
          "Once the promise is visible, each line can be judged by one question: does this transition preserve the invariant?",
        ],
      },
      {
        heading: "Counterexamples are design tools",
        body: [
          "If a greedy rule feels right, try to construct the smallest case that breaks its claimed invariant. A counterexample is not merely a proof technique; it is a fast way to kill a bad design before code makes it expensive.",
        ],
      },
    ],
    questions: ["What is true before the first iteration?", "Why does one step preserve it?", "What does it imply at termination?", "What is the smallest input that would violate the claim?"],
  },
  {
    slug: "special-cases-ladder",
    number: "07",
    title: "Use special cases as a ladder to the general solution",
    thesis: "When the full problem is opaque, deliberately remove one source of difficulty, solve the simpler case exactly, then ask what blocks generalization.",
    sources: ["Skiena"],
    readingMinutes: 4,
    sections: [
      {
        heading: "Simplify one dimension at a time",
        body: [
          "Set a parameter to zero or one. Assume all weights are equal. Assume the graph is a tree. Assume the array is sorted. Assume intervals do not overlap. The simplified problem may reveal a known algorithm or an invariant hidden by the full statement.",
        ],
      },
      {
        heading: "Generalize by naming the obstruction",
        body: [
          "The useful follow-up is not ‘the special case works.’ It is ‘the general case fails because ___.’ That obstruction tells you whether you need an extra state dimension, a stronger data structure, backtracking, or a completely different model.",
        ],
      },
    ],
    questions: ["Which parameter can be removed?", "What if every weight is one?", "What if the structure is a tree?", "Exactly what new difficulty appears when the restriction is lifted?"],
  },
  {
    slug: "repertoire-not-memorization",
    number: "08",
    title: "Build a repertoire, not a bag of memorized answers",
    thesis: "The goal of canonical problems is recognition: know what a problem family is called, which structural clues point to it, and which assumptions make its algorithms valid.",
    sources: ["Skiena", "EPI"],
    readingMinutes: 6,
    sections: [
      {
        heading: "Names are retrieval keys",
        body: [
          "Knowing terms such as interval scheduling, connected components, topological sorting, edit distance, maximum flow, nearest neighbor, or set cover lets you connect an unfamiliar story to a body of known techniques and trade-offs.",
          "The useful memory is not a finished code listing. It is a compact map: signal → model → candidate technique → assumptions → failure modes.",
        ],
      },
      {
        heading: "Interleave the surface stories",
        body: [
          "Practicing ten binary-search problems under a ‘Binary Search’ heading tests implementation memory. Mixing them among heap, hash, graph, and DP problems tests whether you can recognize the structure without the label giving away the technique.",
        ],
      },
    ],
    questions: ["What is this problem family usually called?", "Which clues point to that family?", "Which assumption would invalidate the standard algorithm?", "Can you solve a variant after the chapter label disappears?"],
  },
  {
    slug: "variants-prove-transfer",
    number: "09",
    title: "Variants prove transfer",
    thesis: "A solution you can only reproduce in its original wording is fragile. Variants force you to separate the reusable invariant from incidental details.",
    sources: ["EPI", "AgoCode"],
    readingMinutes: 4,
    sections: [
      {
        heading: "Change one axis",
        body: [
          "After solving a problem, change exactly one thing: first occurrence instead of any occurrence, weighted edges instead of unit edges, online arrival instead of a fixed array, reconstruction instead of only the score, limited memory instead of full storage.",
          "The delta between the original and variant reveals which part of your reasoning is general and which part was accidental.",
        ],
      },
    ],
    questions: ["Which invariant survives the variant?", "Which data structure stops working?", "Can the same complexity be preserved?", "What new state or assumption is required?"],
  },
  {
    slug: "complexity-as-constraint",
    number: "10",
    title: "Complexity is a design constraint, not a decoration",
    thesis: "Time and space analysis should eliminate impossible approaches before implementation, not merely annotate code after it is finished.",
    sources: ["Goodrich", "Skiena", "EPI"],
    readingMinutes: 5,
    sections: [
      {
        heading: "Start with the input scale",
        body: [
          "If n is twenty, exponential search may be perfectly reasonable. If n is ten million, an extra full copy may be the real bottleneck. Complexity only becomes meaningful when attached to an expected scale and resource budget.",
        ],
      },
      {
        heading: "Analyze operations, not syntax",
        body: [
          "A short loop can hide an expensive list insertion; a recursive function can consume implicit stack space; a dictionary lookup can depend on hashing and collision behavior. Follow the cost model of the operations the algorithm performs.",
        ],
      },
    ],
    questions: ["What is the realistic n?", "Which operation dominates?", "What memory does the runtime or call stack hide?", "Would a theoretically better method be too complex to implement safely for this scale?"],
  },
  {
    slug: "multiple-solution-paths",
    number: "11",
    title: "Prefer problems with multiple solution paths",
    thesis: "The richest practice problem supports a baseline, one or more improvements, and a discussion of trade-offs instead of depending on a single trick.",
    sources: ["EPI"],
    readingMinutes: 4,
    sections: [
      {
        heading: "A problem should reveal reasoning even before the optimum",
        body: [
          "A learner should be able to produce a correct slow solution, identify why it is slow, and improve part of it. If the exercise is pass/fail on one hidden insight, it trains recognition of a trick more than algorithm design.",
          "AgoCode therefore treats alternative approaches as evidence: brute force, greedy-but-wrong, correct dynamic programming, or two data-structure choices can all reveal useful reasoning when their trade-offs are explicit.",
        ],
      },
    ],
    questions: ["What is the simplest correct solution?", "Is there a plausible but wrong greedy solution?", "Can two data structures solve it with different trade-offs?", "What can still be learned if the optimal insight is missed?"],
  },
  {
    slug: "design-log",
    number: "12",
    title: "Keep a design log: never stop at ‘no’",
    thesis: "Writing why an approach fails converts dead ends into reusable knowledge and prevents the same unexamined assumption from returning later.",
    sources: ["Skiena"],
    readingMinutes: 4,
    sections: [
      {
        heading: "Record rejected approaches with reasons",
        body: [
          "‘Heap does not work’ is almost useless. ‘A heap exposes the current minimum, but this problem also needs deletion by arbitrary key and stable rank queries’ is reusable knowledge.",
          "A design log turns problem solving into an inspectable chain of decisions: model attempted, evidence, failure reason, revised constraint, next hypothesis.",
        ],
      },
      {
        heading: "Re-run the questions after learning something",
        body: [
          "A failed attempt changes what you know. Return to the beginning: has the input model changed, did a special case become clear, or did the failure reveal a repeated operation that suggests a data structure? Iteration is part of the method, not a sign that the first attempt was wasted.",
        ],
      },
    ],
    questions: ["What did you try?", "Why exactly did it fail?", "What new fact did the failure expose?", "Which earlier assumption should now be revisited?"],
  },
];

export function getFieldNote(slug: string) {
  return fieldNotes.find((post) => post.slug === slug);
}
