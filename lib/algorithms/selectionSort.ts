export type SelectionSortEvent =
  | { type: "START_PASS"; pass: number }
  | { type: "COMPARE"; leftIndex: number; rightIndex: number; leftValue: number; rightValue: number }
  | { type: "SET_SMALLEST"; index: number; value: number }
  | { type: "MOVE_SMALLEST"; index: number; value: number }
  | { type: "COMPLETE" };

export type SelectionSortFrame = {
  event: SelectionSortEvent;
  remaining: number[];
  sorted: number[];
  scanIndex: number | null;
  smallestIndex: number | null;
  note: string;
};

function frame(
  event: SelectionSortEvent,
  remaining: number[],
  sorted: number[],
  scanIndex: number | null,
  smallestIndex: number | null,
  note: string,
): SelectionSortFrame {
  return {
    event,
    remaining: [...remaining],
    sorted: [...sorted],
    scanIndex,
    smallestIndex,
    note,
  };
}

export function buildSelectionSortTrace(input: number[]): SelectionSortFrame[] {
  const remaining = [...input];
  const sorted: number[] = [];
  const frames: SelectionSortFrame[] = [];
  let pass = 0;

  while (remaining.length > 0) {
    pass += 1;
    let smallestIndex = 0;

    frames.push(
      frame(
        { type: "START_PASS", pass },
        remaining,
        sorted,
        null,
        smallestIndex,
        `Pass ${pass}: scan the unsorted values and remember the smallest candidate.`,
      ),
    );

    for (let scanIndex = 1; scanIndex < remaining.length; scanIndex += 1) {
      frames.push(
        frame(
          {
            type: "COMPARE",
            leftIndex: scanIndex,
            rightIndex: smallestIndex,
            leftValue: remaining[scanIndex],
            rightValue: remaining[smallestIndex],
          },
          remaining,
          sorted,
          scanIndex,
          smallestIndex,
          `Compare ${remaining[scanIndex]} with the current smallest value ${remaining[smallestIndex]}.`,
        ),
      );

      if (remaining[scanIndex] < remaining[smallestIndex]) {
        smallestIndex = scanIndex;
        frames.push(
          frame(
            { type: "SET_SMALLEST", index: smallestIndex, value: remaining[smallestIndex] },
            remaining,
            sorted,
            scanIndex,
            smallestIndex,
            `${remaining[smallestIndex]} is smaller, so it becomes the new candidate for this pass.`,
          ),
        );
      }
    }

    const [smallest] = remaining.splice(smallestIndex, 1);
    sorted.push(smallest);
    frames.push(
      frame(
        { type: "MOVE_SMALLEST", index: smallestIndex, value: smallest },
        remaining,
        sorted,
        null,
        null,
        `Move ${smallest} into the sorted output. The next pass repeats the same search on a shorter list.`,
      ),
    );
  }

  frames.push(
    frame(
      { type: "COMPLETE" },
      remaining,
      sorted,
      null,
      null,
      "Every value has been selected exactly once; the output is now sorted.",
    ),
  );

  return frames;
}

export function selectionSort(input: number[]) {
  const trace = buildSelectionSortTrace(input);
  return trace.at(-1)?.sorted ?? [];
}

export const selectionSortExample = [5, 3, 6, 2, 10];
