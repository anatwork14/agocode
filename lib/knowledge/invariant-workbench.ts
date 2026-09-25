export type InvariantClaim = {
  id: string;
  text: string;
  valid: boolean;
  feedback: string;
};

export type InvariantFrame = {
  step: string;
  state: string[];
  transition: string;
  reason: string;
};

export type InvariantScenario = {
  id: string;
  label: string;
  algorithm: string;
  question: string;
  claims: InvariantClaim[];
  proof: {
    initialization: string;
    preservation: string;
    termination: string;
  };
  frames: InvariantFrame[];
  counterexample: {
    weakClaim: string;
    state: string[];
    explanation: string;
  };
  transferQuestion: string;
};

export const invariantScenarios: InvariantScenario[] = [
  {
    id: "binary-search",
    label: "Binary search",
    algorithm: "Repeatedly compare the target with the midpoint of a sorted candidate interval.",
    question: "Which statement is strong enough to justify discarding half of the remaining search space?",
    claims: [
      {
        id: "candidate-survives",
        text: "If the target occurs in the array, at least one occurrence remains inside the current [low, high] interval.",
        valid: true,
        feedback: "Yes. Every update must preserve every still-possible target position; that is what makes discarding a side safe.",
      },
      {
        id: "mid-increases",
        text: "The midpoint index increases on every iteration.",
        valid: false,
        feedback: "Not invariant. When the target is smaller than the midpoint value, high moves left and the next midpoint can decrease.",
      },
      {
        id: "exact-half",
        text: "Exactly half of the current elements are removed on every iteration.",
        valid: false,
        feedback: "Too strong. Integer boundaries and whether the midpoint is retained mean the size does not always divide into two equal halves.",
      },
    ],
    proof: {
      initialization: "Before the first comparison, [low, high] spans the whole array, so every possible target position is inside the candidate interval.",
      preservation: "If A[mid] is too small, sorted order proves every index at or left of mid is impossible, so low = mid + 1 keeps all possible positions. The symmetric argument justifies high = mid - 1.",
      termination: "When low > high, the candidate interval is empty. If the invariant has been preserved, no target position remains, so reporting absence is justified.",
    },
    frames: [
      {
        step: "Start",
        state: ["A = [3, 7, 12, 18, 23, 31, 44, 59]", "target = 23", "low = 0", "high = 7"],
        transition: "All indices are candidates.",
        reason: "The invariant holds because the interval is the full search space.",
      },
      {
        step: "Compare mid = 3",
        state: ["A[mid] = 18", "18 < 23", "low = 0", "high = 7"],
        transition: "Set low = 4.",
        reason: "Sorted order rules out indices 0..3; any occurrence of 23 must be in 4..7.",
      },
      {
        step: "Compare mid = 5",
        state: ["A[mid] = 31", "31 > 23", "low = 4", "high = 7"],
        transition: "Set high = 4.",
        reason: "Sorted order rules out indices 5..7; any occurrence of 23 must be at index 4.",
      },
      {
        step: "Compare mid = 4",
        state: ["A[mid] = 23", "23 = target", "low = 4", "high = 4"],
        transition: "Return index 4.",
        reason: "The candidate interval still contains the target and the comparison identifies it directly.",
      },
    ],
    counterexample: {
      weakClaim: "The midpoint always moves to the right.",
      state: ["A = [2, 6, 10, 14, 18, 22, 26]", "target = 6", "first mid = 3 (value 14)", "next interval = [0, 2]", "next mid = 1"],
      explanation: "The midpoint moves from 3 to 1. A useful invariant must describe correctness-relevant state, not incidental movement.",
    },
    transferQuestion: "How would the invariant change if the task were to find the first occurrence rather than any occurrence?",
  },
  {
    id: "selection-sort",
    label: "Selection sort",
    algorithm: "Grow a sorted prefix by repeatedly selecting the smallest value from the unsorted suffix.",
    question: "What must be true about the finished prefix before every new pass?",
    claims: [
      {
        id: "prefix-smallest",
        text: "Before pass i, positions [0, i) are sorted and contain exactly the i smallest values of the original array.",
        valid: true,
        feedback: "Yes. This statement explains both ordering and why moving the suffix minimum into position i is safe.",
      },
      {
        id: "suffix-sorted",
        text: "Before each pass, the unsorted suffix is already sorted.",
        valid: false,
        feedback: "False. The suffix is precisely the region whose internal order has not yet been established.",
      },
      {
        id: "one-swap",
        text: "Every pass performs exactly one swap.",
        valid: false,
        feedback: "That is an implementation detail, not the correctness property. A pass can avoid a physical swap when the minimum is already in place.",
      },
    ],
    proof: {
      initialization: "For i = 0 the prefix is empty, so it is trivially sorted and contains the zero smallest values.",
      preservation: "Selecting the minimum of the suffix places the smallest remaining value at position i. Appending it to a prefix that already contains the smaller values preserves sorted order and extends the claim to i + 1.",
      termination: "After n - 1 passes, the prefix contains the n - 1 smallest values in sorted order. The one remaining value must be the largest, so the entire array is sorted and is still a permutation of the input.",
    },
    frames: [
      {
        step: "Pass 0",
        state: ["A = [7, 3, 9, 1, 5]", "prefix = []", "suffix = [7, 3, 9, 1, 5]"],
        transition: "Select 1 and place it at index 0.",
        reason: "The new prefix [1] contains the smallest original value.",
      },
      {
        step: "Pass 1",
        state: ["A = [1, 3, 9, 7, 5]", "prefix = [1]", "suffix = [3, 9, 7, 5]"],
        transition: "Select 3; it is already at index 1.",
        reason: "The prefix becomes [1, 3], the two smallest original values in sorted order.",
      },
      {
        step: "Pass 2",
        state: ["A = [1, 3, 9, 7, 5]", "prefix = [1, 3]", "suffix = [9, 7, 5]"],
        transition: "Select 5 and place it at index 2.",
        reason: "The prefix becomes [1, 3, 5], preserving the same statement for a larger i.",
      },
      {
        step: "Pass 3",
        state: ["A = [1, 3, 5, 7, 9]", "prefix = [1, 3, 5]", "suffix = [7, 9]"],
        transition: "Select 7; it is already at index 3.",
        reason: "The prefix now contains the four smallest values. The only remaining value, 9, must be the largest.",
      },
      {
        step: "Finish",
        state: ["A = [1, 3, 5, 7, 9]", "sorted prefix = [1, 3, 5, 7]", "one value remains = 9"],
        transition: "Terminate after n - 1 passes.",
        reason: "The invariant plus the single remaining largest value proves the entire array is sorted.",
      },
    ],
    counterexample: {
      weakClaim: "Every pass performs exactly one swap.",
      state: ["A = [1, 4, 3]", "pass 0 minimum is already A[0] = 1", "a correct implementation may perform no swap"],
      explanation: "Correctness should not depend on a needless operation. State what the algorithm has established, not how many assignments happened.",
    },
    transferQuestion: "If you sorted in descending order, which words in the invariant would need to change and which proof structure would stay the same?",
  },
  {
    id: "two-sum-window",
    label: "Two-pointer two-sum",
    algorithm: "On a sorted array, compare the leftmost and rightmost surviving values and move one boundary inward.",
    question: "Which claim justifies eliminating one endpoint after each comparison?",
    claims: [
      {
        id: "solution-survives",
        text: "If a pair summing to the target exists, at least one such pair uses only indices inside the current [left, right] window.",
        valid: true,
        feedback: "Yes. The sorted order lets each comparison prove one endpoint cannot participate in any surviving solution.",
      },
      {
        id: "sum-closer",
        text: "The absolute difference between the current sum and target decreases every step.",
        valid: false,
        feedback: "Not guaranteed. A boundary move is justified by eliminating an impossible endpoint, not by monotonic improvement in numeric distance.",
      },
      {
        id: "both-move",
        text: "Both pointers move after every failed comparison.",
        valid: false,
        feedback: "False. Only one endpoint is ruled out by each inequality, so only one pointer needs to move.",
      },
    ],
    proof: {
      initialization: "The initial window is the whole sorted array, so every possible pair lies inside it.",
      preservation: "If A[left] + A[right] is too small, pairing A[left] with any smaller right endpoint cannot reach the target, so left is impossible and can be removed. If the sum is too large, the symmetric argument removes right.",
      termination: "If the pointers cross, no pair remains in the candidate window. Preserving the invariant means no solution exists outside it either.",
    },
    frames: [
      {
        step: "Start",
        state: ["A = [-4, 1, 3, 6, 9, 13]", "target = 10", "left = 0 (-4)", "right = 5 (13)"],
        transition: "Current sum = 9, which is too small.",
        reason: "Even the largest partner cannot make -4 reach 10, so index 0 is impossible.",
      },
      {
        step: "Move left",
        state: ["left = 1 (1)", "right = 5 (13)", "sum = 14"],
        transition: "The sum is too large, so move right.",
        reason: "Even the smallest surviving partner makes 13 too large, so index 5 is impossible.",
      },
      {
        step: "Move right",
        state: ["left = 1 (1)", "right = 4 (9)", "sum = 10"],
        transition: "Return the pair (1, 9).",
        reason: "The solution survived every elimination and is now observed directly.",
      },
    ],
    counterexample: {
      weakClaim: "The absolute error |sum - target| shrinks every step.",
      state: ["A = [1, 5, 12]", "target = 10", "start: 1 + 12 = 13, error = 3", "sum is too large, so move right", "next: 1 + 5 = 6, error = 4"],
      explanation: "The safe pointer move makes the numerical error larger, from 3 to 4. The proof therefore cannot depend on getting numerically closer; it depends on proving that the discarded endpoint cannot belong to a solution.",
    },
    transferQuestion: "What breaks if the array is unsorted, and what preprocessing or alternative structure could restore a safe elimination rule?",
  },
];

export function getInvariantScenario(id: string) {
  return invariantScenarios.find((scenario) => scenario.id === id);
}
