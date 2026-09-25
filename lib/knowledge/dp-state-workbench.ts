export type DpChoice = {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
};

export type DpDependency = {
  rowDelta: number;
  colDelta: number;
  label: string;
};

export type DpStateScenario = {
  id: string;
  title: string;
  eyebrow: string;
  story: string;
  objective: string;
  stateChoices: DpChoice[];
  dimensionChoices: DpChoice[];
  dependencyChoices: DpChoice[];
  baseChoices: DpChoice[];
  orderChoices: DpChoice[];
  summary: {
    state: string;
    dimensions: string;
    dependencies: string;
    base: string;
    order: string;
    recurrence: string;
    complexity: string;
  };
  table: {
    rowLabels: string[];
    colLabels: string[];
    targetRow: number;
    targetCol: number;
    dependencies: DpDependency[];
  };
  transferQuestion: string;
};

export const dpStateScenarios: DpStateScenario[] = [
  {
    id: "knapsack",
    title: "Budgeted expedition pack",
    eyebrow: "Optimization · 2D state",
    story: "You have a set of indivisible expedition items. Each item has a weight and a usefulness score. A backpack has a fixed capacity, and each item may be taken at most once. Maximize total usefulness.",
    objective: "Find the best value achievable under a capacity limit without reusing an item.",
    stateChoices: [
      {
        id: "prefix-capacity",
        label: "dp[i][c] = best usefulness using only the first i items with capacity c",
        correct: true,
        feedback: "Yes. The state records both restrictions that matter to future choices: which items are still eligible and how much capacity is available.",
      },
      {
        id: "capacity-only",
        label: "dp[c] = best usefulness for capacity c, without saying which items are available",
        correct: false,
        feedback: "Too little information for the straightforward 0/1 recurrence. Without an item boundary, a transition can accidentally reuse the same item unless iteration order carries extra meaning.",
      },
      {
        id: "chosen-set",
        label: "dp[S][c] = best usefulness for every exact subset S and capacity c",
        correct: false,
        feedback: "This remembers far more history than the future needs. Enumerating subsets recreates exponential state rather than compressing it.",
      },
    ],
    dimensionChoices: [
      { id: "item-capacity", label: "item prefix × capacity", correct: true, feedback: "Yes. One axis controls eligibility; the other controls remaining resource." },
      { id: "item-value", label: "item prefix × accumulated value", correct: false, feedback: "Value is the quantity being optimized, not the natural resource bound in this formulation." },
      { id: "weight-value", label: "total weight × total value", correct: false, feedback: "This omits which items remain available and makes the transition ambiguous." },
    ],
    dependencyChoices: [
      { id: "skip-take", label: "same capacity in the previous item row; and capacity minus current weight in the previous row", correct: true, feedback: "Exactly. A state compares skipping the current item with taking it once and then relying on a smaller state that excludes that item." },
      { id: "same-row-left", label: "same row at c - weight only", correct: false, feedback: "That dependency is suitable for some unbounded variants, but in 0/1 knapsack it can permit repeated use of the current item." },
      { id: "diagonal-only", label: "only the previous row and previous capacity", correct: false, feedback: "The required capacity reduction depends on the current item's weight, not merely one column." },
    ],
    baseChoices: [
      { id: "zero-row-column", label: "zero items or zero capacity → value 0", correct: true, feedback: "Yes. With no eligible item or no capacity, no positive-weight item can contribute value." },
      { id: "minus-infinity", label: "zero capacity → −∞", correct: false, feedback: "Zero capacity is a valid subproblem with a feasible empty selection worth zero." },
      { id: "first-item", label: "the first item must always be taken", correct: false, feedback: "The first item may be too heavy or may not belong to the optimum." },
    ],
    orderChoices: [
      { id: "rows-forward", label: "fill item rows from 0 upward; capacities from 0 upward", correct: true, feedback: "Yes. Every transition reads only from the already completed previous row." },
      { id: "target-first", label: "start at the final cell and fill arbitrary missing cells later", correct: false, feedback: "A bottom-up table needs dependencies available before a state is evaluated." },
      { id: "rows-backward", label: "fill item rows from n downward", correct: false, feedback: "That order contradicts the chosen state definition and recurrence, which depend on smaller item prefixes." },
    ],
    summary: {
      state: "best value from the first i items under capacity c",
      dimensions: "i = eligible item prefix; c = capacity",
      dependencies: "dp[i−1][c] and, when the item fits, dp[i−1][c−wᵢ]",
      base: "dp[0][c] = 0 and dp[i][0] = 0",
      order: "increasing item prefix; capacities can be scanned left-to-right within each row",
      recurrence: "skip the item, or take it once and add its value to the best compatible previous-row state",
      complexity: "O(nC) table states; O(1) work per state in the direct formulation",
    },
    table: {
      rowLabels: ["0 items", "1 item", "2 items", "3 items", "4 items"],
      colLabels: ["0", "1", "2", "3", "4", "5"],
      targetRow: 3,
      targetCol: 5,
      dependencies: [
        { rowDelta: -1, colDelta: 0, label: "skip" },
        { rowDelta: -1, colDelta: -2, label: "take (w=2)" },
      ],
    },
    transferQuestion: "If items may be reused without limit, which dependency can move into the current row, and why does the iteration order now matter?",
  },
  {
    id: "lcs",
    title: "Sequence similarity",
    eyebrow: "Sequence DP · prefixes",
    story: "Two ordered event logs contain symbols recorded over time. You want the length of the longest sequence of symbols that appears in both logs in the same relative order, though not necessarily contiguously.",
    objective: "Measure the best common ordered subsequence between two sequences.",
    stateChoices: [
      {
        id: "prefix-prefix",
        label: "dp[i][j] = best answer for the first i symbols of A and first j symbols of B",
        correct: true,
        feedback: "Yes. The future decision depends only on how much of each sequence remains under consideration.",
      },
      {
        id: "positions-only",
        label: "dp[i] = best answer after reading i symbols of A",
        correct: false,
        feedback: "One index cannot tell us how much of sequence B is available, so the same A prefix would collapse distinct subproblems.",
      },
      {
        id: "subsequence-text",
        label: "dp[s] = answer for every subsequence string s we have built so far",
        correct: false,
        feedback: "This stores the history we are trying to avoid enumerating; the number of subsequences is exponential.",
      },
    ],
    dimensionChoices: [
      { id: "two-prefixes", label: "prefix length of A × prefix length of B", correct: true, feedback: "Yes. Each cell asks the same question on two smaller prefixes." },
      { id: "index-score", label: "position in A × current score", correct: false, feedback: "The score is an output of the subproblem, while the missing B boundary is essential input state." },
      { id: "char-char", label: "alphabet symbol × alphabet symbol", correct: false, feedback: "Equal symbols can occur at many different positions; the ordering information lives in prefix boundaries, not symbol identity alone." },
    ],
    dependencyChoices: [
      { id: "diag-or-up-left", label: "diagonal when the boundary symbols match; otherwise compare up and left", correct: true, feedback: "Yes. A match can extend a smaller prefix pair; a mismatch must exclude one boundary symbol and keep the better result." },
      { id: "diag-only", label: "always read the diagonal cell only", correct: false, feedback: "On a mismatch, the best subsequence may require dropping a symbol from only one sequence, so up/left alternatives matter." },
      { id: "entire-row", label: "scan every previous cell in the table for each state", correct: false, feedback: "The state definition gives a much smaller local dependency set; scanning the whole table adds unnecessary work." },
    ],
    baseChoices: [
      { id: "empty-prefix", label: "if either prefix is empty → answer 0", correct: true, feedback: "Yes. No non-empty common subsequence can be formed when one side has no symbols." },
      { id: "one", label: "empty prefix → answer 1", correct: false, feedback: "There is no symbol available to contribute a length of one." },
      { id: "unknown", label: "leave the first row and column undefined", correct: false, feedback: "Those boundary states are direct dependencies of the first non-empty prefix cells." },
    ],
    orderChoices: [
      { id: "prefix-forward", label: "fill increasing prefixes so up, left, and diagonal states already exist", correct: true, feedback: "Yes. Row-major or column-major traversal works as long as each cell's smaller-prefix dependencies are ready." },
      { id: "reverse", label: "fill from the bottom-right toward the top-left with this same recurrence", correct: false, feedback: "That would read states that have not been computed under this prefix formulation." },
      { id: "random", label: "visit table cells in random order", correct: false, feedback: "Dependency order is part of a bottom-up DP design; arbitrary order can read unresolved states." },
    ],
    summary: {
      state: "LCS length of prefixes A[:i] and B[:j]",
      dimensions: "i = prefix length of A; j = prefix length of B",
      dependencies: "diagonal for a match; otherwise up and left",
      base: "first row and first column are 0 because one prefix is empty",
      order: "increasing prefix lengths",
      recurrence: "matching boundary symbols extend the diagonal answer; otherwise keep the better answer after dropping one boundary symbol",
      complexity: "O(|A||B|) states and O(1) work per state",
    },
    table: {
      rowLabels: ["∅", "A₁", "A₂", "A₃", "A₄"],
      colLabels: ["∅", "B₁", "B₂", "B₃", "B₄"],
      targetRow: 3,
      targetCol: 3,
      dependencies: [
        { rowDelta: -1, colDelta: -1, label: "match / diagonal" },
        { rowDelta: -1, colDelta: 0, label: "drop A boundary" },
        { rowDelta: 0, colDelta: -1, label: "drop B boundary" },
      ],
    },
    transferQuestion: "If the task changes from subsequence to contiguous common substring, what additional meaning must the cell value encode when boundary symbols do not match?",
  },
  {
    id: "grid-paths",
    title: "Robot route counting",
    eyebrow: "Counting · spatial state",
    story: "A robot starts at the top-left of a rectangular floor and can move only right or down. Some cells may be blocked. Count how many legal routes reach each cell and ultimately the destination.",
    objective: "Count paths without enumerating every route explicitly.",
    stateChoices: [
      {
        id: "ways-cell",
        label: "dp[r][c] = number of legal routes from the start to cell (r, c)",
        correct: true,
        feedback: "Yes. Every route into a cell must end with one of the allowed incoming moves, so local path counts compose cleanly.",
      },
      {
        id: "route-list",
        label: "dp[r][c] = the full list of every route reaching (r, c)",
        correct: false,
        feedback: "The objective needs only a count. Storing every path loses the compression that makes DP useful.",
      },
      {
        id: "distance",
        label: "dp[r][c] = Manhattan distance from the start",
        correct: false,
        feedback: "Distance does not tell us how many distinct routes reach the cell, especially with obstacles." },
    ],
    dimensionChoices: [
      { id: "row-col", label: "row × column", correct: true, feedback: "Yes. Position completely identifies the subproblem because move rules are fixed." },
      { id: "step-count", label: "only total number of steps taken", correct: false, feedback: "Many different cells share the same step count but have different obstacle histories and future options." },
      { id: "visited-mask", label: "row × column × every visited-cell subset", correct: false, feedback: "With only right/down motion, cycles cannot occur; the visited set is unnecessary state." },
    ],
    dependencyChoices: [
      { id: "up-left", label: "routes from the cell above plus routes from the cell to the left", correct: true, feedback: "Yes. Those are the only legal predecessors under right/down movement." },
      { id: "all-neighbors", label: "sum all four neighboring cells", correct: false, feedback: "Downstream neighbors are not predecessors and would create circular dependencies." },
      { id: "diagonal", label: "read only the diagonal predecessor", correct: false, feedback: "Diagonal movement is not legal in the problem model." },
    ],
    baseChoices: [
      { id: "start-one-block-zero", label: "start cell → 1 route; blocked cells → 0 routes", correct: true, feedback: "Yes. The single empty route seeds the recurrence, while blocked cells contribute nothing." },
      { id: "start-zero", label: "start cell → 0 routes", correct: false, feedback: "Then every reachable count would remain zero; the recurrence needs one initial way to be at the start." },
      { id: "blocked-one", label: "blocked cells → 1 route", correct: false, feedback: "A blocked cell is unreachable and cannot contribute a path to later states." },
    ],
    orderChoices: [
      { id: "top-left", label: "scan from top-left toward bottom-right", correct: true, feedback: "Yes. Each cell's up and left dependencies have already been computed." },
      { id: "bottom-right", label: "scan bottom-right to top-left with the same state meaning", correct: false, feedback: "That order runs opposite the recurrence's predecessor direction." },
      { id: "spiral", label: "spiral inward from the boundary", correct: false, feedback: "A spiral does not guarantee both predecessor cells are available when needed." },
    ],
    summary: {
      state: "number of legal routes from the start to cell (r, c)",
      dimensions: "r = row; c = column",
      dependencies: "up and left predecessor cells",
      base: "start cell has one route; blocked cells have zero",
      order: "top-left toward bottom-right",
      recurrence: "for an open cell, sum route counts from legal predecessors",
      complexity: "O(RC) states and O(1) work per state",
    },
    table: {
      rowLabels: ["r0", "r1", "r2", "r3"],
      colLabels: ["c0", "c1", "c2", "c3", "c4"],
      targetRow: 2,
      targetCol: 3,
      dependencies: [
        { rowDelta: -1, colDelta: 0, label: "from above" },
        { rowDelta: 0, colDelta: -1, label: "from left" },
      ],
    },
    transferQuestion: "If diagonal moves are allowed too, what changes in the dependency set while the state dimensions stay the same?",
  },
  {
    id: "score-combinations",
    title: "Token score combinations",
    eyebrow: "Counting · choice boundary",
    story: "A game awards tokens worth 2, 5, or 7 points. Count combinations that total a target score, where order does not create a new combination.",
    objective: "Count unordered combinations rather than ordered scoring sequences.",
    stateChoices: [
      {
        id: "types-score",
        label: "dp[i][s] = number of combinations totaling s using only the first i token types",
        correct: true,
        feedback: "Yes. The token-type boundary prevents permutations of the same multiset from being counted as distinct combinations.",
      },
      {
        id: "score-only-naive",
        label: "dp[s] = number of sequences totaling s, adding any token next",
        correct: false,
        feedback: "That recurrence counts orderings, so 2+5 and 5+2 become different outcomes even though the objective says they are the same combination." },
      {
        id: "sequence",
        label: "dp[path] = whether an exact token sequence reaches the target",
        correct: false,
        feedback: "This enumerates sequences explicitly and makes duplicate orderings the dominant state." },
    ],
    dimensionChoices: [
      { id: "type-score", label: "allowed token types × target subtotal", correct: true, feedback: "Yes. One axis controls which choices may appear; the other is the subtotal being constructed." },
      { id: "score-score", label: "subtotal × final target", correct: false, feedback: "The final target is constant during one problem instance; this still omits the choice boundary needed to avoid permutation overcounting." },
      { id: "count-score", label: "number of tokens used × subtotal", correct: false, feedback: "The objective does not constrain token count, and this does not by itself prevent reordering duplicates." },
    ],
    dependencyChoices: [
      { id: "exclude-include", label: "exclude current token type, or include it and stay on the current type with a smaller subtotal", correct: true, feedback: "Yes. Staying on the same type permits repeated use while the type boundary keeps combination order canonical." },
      { id: "previous-row-only", label: "both branches must move to the previous token type", correct: false, feedback: "That would allow each token type at most once, changing the problem to a 0/1 variant." },
      { id: "all-orders", label: "from s, append every token in every possible order", correct: false, feedback: "That returns to sequence counting and duplicates combinations by permutation." },
    ],
    baseChoices: [
      { id: "zero-score-one", label: "subtotal 0 → one empty combination; no token types and positive subtotal → 0", correct: true, feedback: "Yes. The empty combination seeds counting, while a positive score cannot be built from no token types." },
      { id: "zero-score-zero", label: "subtotal 0 → zero combinations", correct: false, feedback: "Without the single empty combination, inclusion transitions have no valid base to build from." },
      { id: "no-types-one", label: "every subtotal with no token types → one combination", correct: false, feedback: "A positive subtotal cannot be produced without any available token value." },
    ],
    orderChoices: [
      { id: "types-then-score", label: "process token types in a fixed order and subtotals from small to large", correct: true, feedback: "Yes. The fixed type order avoids counting permutations, and increasing subtotals supports repeated use of the current type." },
      { id: "score-then-any-type", label: "for each subtotal, try every token type as the final step", correct: false, feedback: "That natural-looking loop counts ordered sequences unless additional structure removes permutations." },
      { id: "descending-score", label: "scan subtotals from target down to zero while allowing unlimited reuse", correct: false, feedback: "Descending order is useful for some 0/1 formulations; here it prevents same-row reuse of the current token type." },
    ],
    summary: {
      state: "number of combinations totaling s using only the first i token types",
      dimensions: "i = allowed token-type prefix; s = subtotal",
      dependencies: "exclude current type from previous row, or include it from a smaller subtotal in the same row",
      base: "one way to make subtotal 0; zero ways to make a positive subtotal with no token types",
      order: "token types in a fixed outer order; subtotals increasing",
      recurrence: "count combinations without the current type plus combinations that use at least one current token",
      complexity: "O(kS) states for k token types and target score S",
    },
    table: {
      rowLabels: ["0 types", "2", "2,5", "2,5,7"],
      colLabels: ["0", "1", "2", "3", "4", "5", "6", "7"],
      targetRow: 3,
      targetCol: 7,
      dependencies: [
        { rowDelta: -1, colDelta: 0, label: "exclude 7" },
        { rowDelta: 0, colDelta: -7, label: "include 7" },
      ],
    },
    transferQuestion: "If order should count, so 2+5 and 5+2 are different, which state dimension can disappear and how would the recurrence change?",
  },
];

export function getDpStateScenario(id: string) {
  return dpStateScenarios.find((scenario) => scenario.id === id);
}
