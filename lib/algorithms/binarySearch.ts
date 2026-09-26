import type { SemanticCodeLine } from "@/lib/visualization/code-sync";
import type { ArrayTraceFrame, TracePrediction } from "@/lib/visualization/types";

export type BinarySearchCodeLineId =
  | "signature"
  | "init-low"
  | "init-high"
  | "loop"
  | "choose-mid"
  | "read-guess"
  | "compare-target"
  | "return-found"
  | "compare-high"
  | "discard-right"
  | "else-low"
  | "discard-left"
  | "return-missing";

export const binarySearchCodeLines: readonly SemanticCodeLine<BinarySearchCodeLineId>[] = [
  { id: "signature", text: "def binary_search(nums, target):" },
  { id: "init-low", text: "    low = 0" },
  { id: "init-high", text: "    high = len(nums) - 1" },
  { id: "loop", text: "    while low <= high:" },
  { id: "choose-mid", text: "        mid = (low + high) // 2" },
  { id: "read-guess", text: "        guess = nums[mid]" },
  { id: "compare-target", text: "        if guess == target:" },
  { id: "return-found", text: "            return mid" },
  { id: "compare-high", text: "        if guess > target:" },
  { id: "discard-right", text: "            high = mid - 1" },
  { id: "else-low", text: "        else:" },
  { id: "discard-left", text: "            low = mid + 1" },
  { id: "return-missing", text: "    return None" },
] as const;

function predictionFor(guess: number, target: number): TracePrediction {
  const relation = guess === target ? "equal" : guess > target ? "high" : "low";
  const correctOptionId = relation === "equal" ? "return" : relation === "high" ? "move-high" : "move-low";

  return {
    prompt: "Before the trace advances: what should the algorithm do next?",
    options: [
      { id: "return", label: "Return mid — the target is found" },
      { id: "move-high", label: "Move high to mid - 1" },
      { id: "move-low", label: "Move low to mid + 1" },
    ],
    correctOptionId,
    explanation:
      relation === "equal"
        ? "The midpoint value equals the target, so the index can be returned immediately."
        : relation === "high"
          ? "The midpoint value is too large. Because the array is sorted, mid and everything to its right can be discarded."
          : "The midpoint value is too small. Because the array is sorted, mid and everything to its left can be discarded.",
  };
}

export function buildBinarySearchTrace(
  values: number[],
  target: number,
): ArrayTraceFrame<BinarySearchCodeLineId>[] {
  if (!values.length) return [];

  const frames: ArrayTraceFrame<BinarySearchCodeLineId>[] = [];
  let low = 0;
  let high = values.length - 1;

  frames.push({
    event: { type: "SET_RANGE", low, high },
    low,
    high,
    mid: null,
    activeCodeLineId: "init-low",
    note: "Begin with the whole sorted array as the candidate interval.",
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const guess = values[mid];
    const operator = guess === target ? "==" : guess < target ? "<" : ">";

    frames.push({
      event: { type: "SET_POINTER", pointer: "mid", index: mid },
      low,
      high,
      mid,
      activeCodeLineId: "choose-mid",
      note: "Choose the midpoint of the current candidate interval.",
    });

    frames.push({
      event: { type: "COMPARE", left: guess, operator, right: target },
      low,
      high,
      mid,
      activeCodeLineId: "compare-target",
      comparison: `${guess} ${operator} ${target}`,
      note:
        guess === target
          ? "The midpoint equals the target."
          : guess < target
            ? "The midpoint is smaller than the target."
            : "The midpoint is larger than the target.",
      found: guess === target,
      prediction: predictionFor(guess, target),
    });

    if (guess === target) {
      frames.push({
        event: { type: "FOUND", index: mid },
        low,
        high,
        mid,
        activeCodeLineId: "return-found",
        comparison: `return ${mid}`,
        note: "Return the position. The search is complete.",
        found: true,
      });
      return frames;
    }

    if (guess > target) {
      high = mid - 1;
      frames.push({
        event: { type: "SET_RANGE", low, high },
        low,
        high,
        mid: null,
        activeCodeLineId: "discard-right",
        note: "Discard the midpoint and everything to its right. Move high to mid - 1.",
      });
    } else {
      low = mid + 1;
      frames.push({
        event: { type: "SET_RANGE", low, high },
        low,
        high,
        mid: null,
        activeCodeLineId: "discard-left",
        note: "Discard the midpoint and everything to its left. Move low to mid + 1.",
      });
    }
  }

  frames.push({
    event: { type: "SET_RANGE", low, high },
    low,
    high,
    mid: null,
    activeCodeLineId: "return-missing",
    comparison: "return None",
    note: "The candidate interval is empty, so the target is not present.",
  });

  return frames;
}

export const binarySearchExample = {
  values: [3, 7, 11, 18, 26, 31, 44, 57, 63, 78],
  target: 44,
};
