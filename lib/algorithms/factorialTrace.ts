export type FactorialStackFrame = {
  n: number;
  state: "waiting" | "active" | "base" | "returning";
};

export type FactorialEvent =
  | { type: "CALL"; n: number }
  | { type: "BASE"; n: number; result: number }
  | { type: "RETURN"; n: number; childResult: number; result: number }
  | { type: "COMPLETE"; result: number };

export type FactorialTraceFrame = {
  event: FactorialEvent;
  stack: FactorialStackFrame[];
  result: number | null;
  note: string;
};

function cloneStack(stack: FactorialStackFrame[]) {
  return stack.map((item) => ({ ...item }));
}

export function buildFactorialTrace(n: number): FactorialTraceFrame[] {
  if (!Number.isInteger(n) || n < 1) return [];

  const frames: FactorialTraceFrame[] = [];
  const stack: FactorialStackFrame[] = [];

  for (let value = n; value >= 1; value -= 1) {
    if (stack.length) stack[stack.length - 1].state = "waiting";
    stack.push({ n: value, state: value === 1 ? "base" : "active" });

    if (value === 1) {
      frames.push({
        event: { type: "BASE", n: 1, result: 1 },
        stack: cloneStack(stack),
        result: 1,
        note: "The base case returns 1 without making another recursive call.",
      });
    } else {
      frames.push({
        event: { type: "CALL", n: value },
        stack: cloneStack(stack),
        result: null,
        note: `fact(${value}) pauses while fact(${value - 1}) is evaluated. Its local value ${value} stays on the call stack.`,
      });
    }
  }

  let childResult = 1;
  stack.pop();

  for (let value = 2; value <= n; value += 1) {
    const index = stack.findIndex((item) => item.n === value);
    if (index >= 0) stack[index].state = "returning";
    const result = value * childResult;
    frames.push({
      event: { type: "RETURN", n: value, childResult, result },
      stack: cloneStack(stack),
      result,
      note: `fact(${value - 1}) returned ${childResult}. Resume fact(${value}) and compute ${value} × ${childResult} = ${result}.`,
    });
    childResult = result;
    stack.splice(index, 1);
    if (stack.length) stack[stack.length - 1].state = "active";
  }

  frames.push({
    event: { type: "COMPLETE", result: childResult },
    stack: [],
    result: childResult,
    note: `All suspended calls have returned. The final result is ${childResult}.`,
  });

  return frames;
}
