export type RecursiveSumStackFrame = {
  values: number[];
  state: "active" | "waiting" | "base" | "returning";
};

export type RecursiveSumEvent =
  | { type: "CALL"; values: number[] }
  | { type: "BASE"; result: number }
  | { type: "RETURN"; head: number; childResult: number; result: number }
  | { type: "COMPLETE"; result: number };

export type RecursiveSumTraceFrame = {
  event: RecursiveSumEvent;
  stack: RecursiveSumStackFrame[];
  result: number | null;
  note: string;
};

function cloneStack(stack: RecursiveSumStackFrame[]) {
  return stack.map((frame) => ({ ...frame, values: [...frame.values] }));
}

export function buildRecursiveSumTrace(input: number[]): RecursiveSumTraceFrame[] {
  const frames: RecursiveSumTraceFrame[] = [];
  const stack: RecursiveSumStackFrame[] = [];

  for (let start = 0; start <= input.length; start += 1) {
    if (stack.length) stack[stack.length - 1].state = "waiting";
    const values = input.slice(start);
    const isBase = values.length === 0;
    stack.push({ values, state: isBase ? "base" : "active" });

    if (isBase) {
      frames.push({
        event: { type: "BASE", result: 0 },
        stack: cloneStack(stack),
        result: 0,
        note: "The empty list is the stopping case: its sum is known immediately as 0.",
      });
    } else {
      frames.push({
        event: { type: "CALL", values: [...values] },
        stack: cloneStack(stack),
        result: null,
        note: `${values[0]} is kept in this frame while the function asks for the sum of a list that is one item shorter.`,
      });
    }
  }

  stack.pop();
  let childResult = 0;

  for (let start = input.length - 1; start >= 0; start -= 1) {
    const values = input.slice(start);
    const head = values[0];
    const frameIndex = stack.findIndex((frame) => frame.values.length === values.length);
    if (frameIndex >= 0) stack[frameIndex].state = "returning";
    const result = head + childResult;

    frames.push({
      event: { type: "RETURN", head, childResult, result },
      stack: cloneStack(stack),
      result,
      note: `The smaller call returned ${childResult}. Resume this frame and compute ${head} + ${childResult} = ${result}.`,
    });

    childResult = result;
    if (frameIndex >= 0) stack.splice(frameIndex, 1);
    if (stack.length) stack[stack.length - 1].state = "active";
  }

  frames.push({
    event: { type: "COMPLETE", result: childResult },
    stack: [],
    result: childResult,
    note: `Every smaller problem has returned. The final sum is ${childResult}.`,
  });

  return frames;
}

export function recursiveSum(input: number[]): number {
  if (input.length === 0) return 0;
  return input[0] + recursiveSum(input.slice(1));
}
