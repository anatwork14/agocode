export type TransformationVerdict = "strong" | "viable" | "mismatch";

export type TransformationOption = {
  id: string;
  label: string;
  move: string;
  exposes: string;
  time: string;
  extraSpace: string;
  verdict: TransformationVerdict;
  explanation: string;
  transformed: string[];
};

export type TransformationScenario = {
  id: string;
  label: string;
  title: string;
  prompt: string;
  inputLabel: string;
  input: string[];
  goal: string;
  constraints: string[];
  baseline: {
    method: string;
    time: string;
    extraSpace: string;
    waste: string;
  };
  options: TransformationOption[];
  durableInsight: string;
  transferQuestion: string;
};

export const transformationScenarios: TransformationScenario[] = [
  {
    id: "closest-pair",
    label: "Adjacency after sorting",
    title: "Find the closest pair on a number line",
    prompt: "Given unsorted positions on a line, return the pair with the smallest absolute distance.",
    inputLabel: "positions",
    input: ["14", "3", "21", "8", "9", "31", "18"],
    goal: "Minimize |x - y| over all distinct pairs.",
    constraints: ["Only the pair values matter", "Original input order has no semantic meaning", "n may be large"],
    baseline: {
      method: "Compare every pair.",
      time: "O(n²)",
      extraSpace: "O(1)",
      waste: "Most comparisons are between values that are obviously far apart once order is known.",
    },
    options: [
      {
        id: "sort-scan",
        label: "Sort, then scan neighbors",
        move: "Sort values once and compare adjacent positions only.",
        exposes: "In one dimension, the globally closest pair must appear next to each other in sorted order.",
        time: "O(n log n)",
        extraSpace: "depends on sort",
        verdict: "strong",
        explanation: "Sorting converts a global all-pairs relationship into a local adjacency check. The scan after sorting is linear.",
        transformed: ["3", "8", "9", "14", "18", "21", "31"],
      },
      {
        id: "hash",
        label: "Hash every value",
        move: "Insert values into a hash set and probe nearby exact keys.",
        exposes: "Fast exact membership, but no natural notion of nearest numeric neighbor.",
        time: "Not enough by itself",
        extraSpace: "O(n)",
        verdict: "mismatch",
        explanation: "Hashing helps exact lookup. The goal depends on order and numeric proximity, so a plain hash set does not expose the needed relationship.",
        transformed: ["{3, 8, 9, 14, 18, 21, 31}", "exact membership is cheap", "nearest neighbor is still hidden"],
      },
      {
        id: "heap",
        label: "Put all values in a heap",
        move: "Build a min-heap and repeatedly remove the minimum.",
        exposes: "Values emerge in sorted order, but destructive extraction adds machinery that a direct sort does not need.",
        time: "O(n log n)",
        extraSpace: "O(n) or in-place variant",
        verdict: "viable",
        explanation: "A heap can reveal ascending order, so the idea can work, but it is less direct than sorting when all values are already available offline.",
        transformed: ["3 → 8 → 9 → 14 → 18 → 21 → 31", "compare consecutive removals"],
      },
    ],
    durableInsight: "Ask whether ordering turns a global relation into a local one. If yes, O(n log n) preprocessing can replace O(n²) comparison.",
    transferQuestion: "Would the same adjacency argument still be valid for closest points in two dimensions? Why or why not?",
  },
  {
    id: "pair-sum",
    label: "Sorted elimination vs hashing",
    title: "Decide whether two values sum to a target",
    prompt: "Given an unsorted array and target T, decide whether any two distinct values sum to T.",
    inputLabel: "values · T = 13",
    input: ["11", "2", "7", "4", "19", "6", "1"],
    goal: "Return whether a pair x + y = 13 exists.",
    constraints: ["Only existence matters", "Original order is irrelevant", "Time-memory trade-offs are allowed"],
    baseline: {
      method: "Try every pair and test its sum.",
      time: "O(n²)",
      extraSpace: "O(1)",
      waste: "The same values participate in many comparisons even after other information could rule them in or out.",
    },
    options: [
      {
        id: "sort-two-pointers",
        label: "Sort + two boundaries",
        move: "Sort, then move left/right according to whether the current sum is too small or too large.",
        exposes: "Sortedness gives a safe elimination rule for one endpoint after each comparison.",
        time: "O(n log n)",
        extraSpace: "depends on sort",
        verdict: "strong",
        explanation: "This spends preprocessing time to create an invariant: if the sum is too small, the left endpoint cannot work with any surviving partner; if too large, the right endpoint cannot work.",
        transformed: ["1", "2", "4", "6", "7", "11", "19"],
      },
      {
        id: "hash-complements",
        label: "Hash seen complements",
        move: "Scan once and ask whether T - x has already appeared.",
        exposes: "Each value becomes an O(1)-expected complement query.",
        time: "O(n) expected",
        extraSpace: "O(n)",
        verdict: "strong",
        explanation: "Hashing is a different strong transformation: trade memory for expected linear time. It does not need sorting because the query is exact membership.",
        transformed: ["see 11 → need 2", "see 2 → 11 already seen", "pair found"],
      },
      {
        id: "heap",
        label: "Use a priority queue",
        move: "Heapify values and repeatedly inspect extremes.",
        exposes: "Cheap extreme access but not the complement relation directly.",
        time: "Usually O(n log n)",
        extraSpace: "implementation-dependent",
        verdict: "viable",
        explanation: "You could engineer a solution around ordered extraction, but the heap abstraction is not aligned with the exact complement query as cleanly as sorting or hashing.",
        transformed: ["min = 1", "next min = 2", "...", "extremes available; complements remain indirect"],
      },
    ],
    durableInsight: "There may be more than one good transformation. Choose between time, memory, mutability, streaming, and order requirements rather than memorizing one canonical trick.",
    transferQuestion: "If the input arrived as an unbounded stream and you had limited memory, which assumptions would you revisit first?",
  },
  {
    id: "merge-intervals",
    label: "Sweep after ordering",
    title: "Merge overlapping time windows",
    prompt: "Given unsorted closed intervals, combine all overlaps into disjoint windows.",
    inputLabel: "intervals",
    input: ["[8,10]", "[1,4]", "[3,6]", "[12,15]", "[14,18]"],
    goal: "Return a minimal set of disjoint intervals covering the same points.",
    constraints: ["All intervals are available offline", "Output order may be sorted", "Intervals can nest"],
    baseline: {
      method: "Repeatedly compare intervals with every other interval until no overlap remains.",
      time: "O(n²) or worse with repeated rebuilding",
      extraSpace: "varies",
      waste: "Without order, we repeatedly search globally for the next interval that could overlap the current one.",
    },
    options: [
      {
        id: "sort-start",
        label: "Sort by start, then sweep",
        move: "Sort intervals by start time and maintain only the current merged interval.",
        exposes: "Any future overlap with the current merged interval must appear next in start-order before a permanent gap.",
        time: "O(n log n)",
        extraSpace: "O(n) output",
        verdict: "strong",
        explanation: "Ordering makes the relevant future candidate local. Once the next start is beyond the current end, the current interval is finished forever.",
        transformed: ["[1,4]", "[3,6]", "[8,10]", "[12,15]", "[14,18]"],
      },
      {
        id: "hash",
        label: "Hash intervals by endpoints",
        move: "Store start/end values in hash tables.",
        exposes: "Exact endpoint membership, not overlap order.",
        time: "Does not solve the ordering problem",
        extraSpace: "O(n)",
        verdict: "mismatch",
        explanation: "Overlap is an inequality/range relation. Exact membership is the wrong primitive unless the problem has additional discrete structure.",
        transformed: ["starts = {1,3,8,12,14}", "ends = {4,6,10,15,18}", "which interval comes next is still hidden"],
      },
      {
        id: "events",
        label: "Sort boundary events",
        move: "Convert intervals to start/end events and sweep an active-count timeline.",
        exposes: "Coverage count over ordered coordinates.",
        time: "O(n log n)",
        extraSpace: "O(n)",
        verdict: "viable",
        explanation: "This is a useful alternative when you need coverage counts or maximum overlap, but it is more machinery than needed for plain merging.",
        transformed: ["1:+", "3:+", "4:-", "6:-", "8:+", "10:-", "12:+", "14:+", "15:-", "18:-"],
      },
    ],
    durableInsight: "Sorting is often a sweep-line enabler: it converts repeated global search into one forward pass with compact state.",
    transferQuestion: "How would the state change if the goal were maximum simultaneous intervals instead of merged coverage?",
  },
  {
    id: "top-k-frequent",
    label: "Summarize, then prioritize",
    title: "Return the k most frequent values",
    prompt: "Given many repeated values, return the k values with highest frequency.",
    inputLabel: "values · k = 3",
    input: ["A", "C", "A", "B", "D", "A", "C", "B", "C", "E", "C", "B"],
    goal: "Return three values with the largest counts.",
    constraints: ["n can be much larger than the number of distinct values", "Only top k is required", "Exact result required"],
    baseline: {
      method: "For every distinct value, rescan the entire input to count it, then sort all counts.",
      time: "O(nu + u log u)",
      extraSpace: "O(u)",
      waste: "The raw input is rescanned for information that could be summarized once; sorting every distinct key also does more ordering than top k requires.",
    },
    options: [
      {
        id: "count-heap",
        label: "Frequency map + size-k heap",
        move: "Count once, then maintain only the best k frequencies in a min-heap.",
        exposes: "The raw sequence becomes a compact frequency table; the heap keeps the selection frontier small.",
        time: "O(n + u log k)",
        extraSpace: "O(u + k)",
        verdict: "strong",
        explanation: "This is a two-stage transformation. First summarize repeated raw data with hashing; then use the priority-queue contract because only the top k order statistics matter.",
        transformed: ["A:3", "B:3", "C:4", "D:1", "E:1", "heap keeps k = 3 candidates"],
      },
      {
        id: "count-sort-all",
        label: "Frequency map + sort all keys",
        move: "Count once, then sort every distinct key by frequency.",
        exposes: "A complete ranking of all distinct values.",
        time: "O(n + u log u)",
        extraSpace: "O(u)",
        verdict: "viable",
        explanation: "Simple and often practical. It becomes less attractive when u is huge and k is tiny because it computes an order you do not need.",
        transformed: ["C:4", "A:3", "B:3", "D:1", "E:1"],
      },
      {
        id: "sort-raw",
        label: "Sort the entire raw input first",
        move: "Sort all n values, compress equal runs, then take the largest counts.",
        exposes: "Equal values become adjacent runs.",
        time: "O(n log n)",
        extraSpace: "depends on sort",
        verdict: "viable",
        explanation: "Sorting does expose run lengths, but hashing can summarize in one expected-linear pass. The better choice depends on memory, key properties, and whether sorted order is useful elsewhere.",
        transformed: ["A A A", "B B B", "C C C C", "D", "E"],
      },
    ],
    durableInsight: "Transformations can be composed. Summarize first, then choose an ADT whose contract matches the remaining question.",
    transferQuestion: "If k were almost as large as the number of distinct values, when would sorting all counts become simpler than maintaining a heap?",
  },
];

export function getTransformationScenario(id: string) {
  return transformationScenarios.find((scenario) => scenario.id === id);
}
