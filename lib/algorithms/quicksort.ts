export type PivotStrategy = "first" | "middle";

export type QuicksortStackFrame = {
  id: string;
  values: number[];
  state: "active" | "waiting" | "base" | "returning";
};

export type QuicksortEvent =
  | { type: "ENTER"; values: number[]; depth: number }
  | { type: "BASE"; values: number[]; result: number[]; depth: number }
  | {
      type: "PARTITION";
      values: number[];
      pivot: number;
      pivotIndex: number;
      less: number[];
      greater: number[];
      depth: number;
    }
  | {
      type: "COMBINE";
      pivot: number;
      lessSorted: number[];
      greaterSorted: number[];
      result: number[];
      depth: number;
    }
  | { type: "COMPLETE"; result: number[] };

export type QuicksortTraceFrame = {
  event: QuicksortEvent;
  stack: QuicksortStackFrame[];
  activeArray: number[];
  result: number[] | null;
  note: string;
};

function cloneStack(stack: QuicksortStackFrame[]) {
  return stack.map((frame) => ({ ...frame, values: [...frame.values] }));
}

function pivotIndexFor(values: number[], strategy: PivotStrategy) {
  if (strategy === "middle") return Math.floor(values.length / 2);
  return 0;
}

export function buildQuicksortTrace(input: number[], strategy: PivotStrategy = "first") {
  const frames: QuicksortTraceFrame[] = [];
  const stack: QuicksortStackFrame[] = [];

  function visit(values: number[], depth: number, id: string): number[] {
    stack.push({ id, values: [...values], state: values.length < 2 ? "base" : "active" });
    frames.push({
      event: { type: "ENTER", values: [...values], depth },
      stack: cloneStack(stack),
      activeArray: [...values],
      result: null,
      note: values.length < 2
        ? "This call is already at a base-case size."
        : `Sort this ${values.length}-item subarray by choosing a pivot and reducing it into smaller subproblems.`,
    });

    if (values.length < 2) {
      const result = [...values];
      frames.push({
        event: { type: "BASE", values: [...values], result, depth },
        stack: cloneStack(stack),
        activeArray: [...values],
        result,
        note: "Arrays with zero or one item are already sorted, so this call returns immediately.",
      });
      stack.pop();
      if (stack.length) stack[stack.length - 1].state = "active";
      return result;
    }

    const pivotIndex = pivotIndexFor(values, strategy);
    const pivot = values[pivotIndex];
    const rest = values.filter((_, index) => index !== pivotIndex);
    const less = rest.filter((value) => value <= pivot);
    const greater = rest.filter((value) => value > pivot);
    stack[stack.length - 1].state = "waiting";

    frames.push({
      event: {
        type: "PARTITION",
        values: [...values],
        pivot,
        pivotIndex,
        less: [...less],
        greater: [...greater],
        depth,
      },
      stack: cloneStack(stack),
      activeArray: [...values],
      result: null,
      note: `Pivot ${pivot} separates the remaining values into ${less.length} value${less.length === 1 ? "" : "s"} on the left and ${greater.length} on the right. Both sides are smaller sorting problems.`,
    });

    const lessSorted = visit(less, depth + 1, `${id}.L`);
    if (stack.length) stack[stack.length - 1].state = "waiting";
    const greaterSorted = visit(greater, depth + 1, `${id}.R`);

    const result = [...lessSorted, pivot, ...greaterSorted];
    const parentIndex = stack.findIndex((frame) => frame.id === id);
    if (parentIndex >= 0) stack[parentIndex].state = "returning";

    frames.push({
      event: {
        type: "COMBINE",
        pivot,
        lessSorted: [...lessSorted],
        greaterSorted: [...greaterSorted],
        result: [...result],
        depth,
      },
      stack: cloneStack(stack),
      activeArray: [...values],
      result: [...result],
      note: `Both smaller arrays are sorted. Combine them as sorted-left + pivot + sorted-right to produce [${result.join(", ")}].`,
    });

    if (parentIndex >= 0) stack.splice(parentIndex, 1);
    if (stack.length) stack[stack.length - 1].state = "active";
    return result;
  }

  const result = visit([...input], 0, "root");
  frames.push({
    event: { type: "COMPLETE", result: [...result] },
    stack: [],
    activeArray: [...input],
    result: [...result],
    note: `The root call has returned. Final sorted output: [${result.join(", ")}].`,
  });

  return frames;
}

export function quicksort(input: number[], strategy: PivotStrategy = "first") {
  const frames = buildQuicksortTrace(input, strategy);
  return frames.at(-1)?.result ?? [];
}
