import type { ArrayTraceFrame } from "@/lib/visualization/types";

export function buildBinarySearchTrace(values: number[], target: number): ArrayTraceFrame[] {
  if (!values.length) return [];

  const frames: ArrayTraceFrame[] = [];
  let low = 0;
  let high = values.length - 1;

  frames.push({
    event: { type: "SET_RANGE", low, high },
    low,
    high,
    mid: null,
    activeLine: 2,
    note: "Begin with the whole sorted array as the candidate interval.",
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const guess = values[mid];

    frames.push({
      event: { type: "SET_POINTER", pointer: "mid", index: mid },
      low,
      high,
      mid,
      activeLine: 5,
      comparison: `${guess} ${guess === target ? "==" : guess < target ? "<" : ">"} ${target}`,
      note:
        guess === target
          ? "The midpoint equals the target."
          : guess < target
            ? "The midpoint is smaller than the target."
            : "The midpoint is larger than the target.",
      found: guess === target,
    });

    if (guess === target) {
      frames.push({
        event: { type: "FOUND", index: mid },
        low,
        high,
        mid,
        activeLine: 8,
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
        activeLine: 10,
        note: "Discard the midpoint and everything to its right. Move high to mid - 1.",
      });
    } else {
      low = mid + 1;
      frames.push({
        event: { type: "SET_RANGE", low, high },
        low,
        high,
        mid: null,
        activeLine: 12,
        note: "Discard the midpoint and everything to its left. Move low to mid + 1.",
      });
    }
  }

  return frames;
}

export const binarySearchExample = {
  values: [3, 7, 11, 18, 26, 31, 44, 57, 63, 78],
  target: 44,
};
