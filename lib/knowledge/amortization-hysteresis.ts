export type TableOperation = "push" | "pop";
export type ShrinkPolicyId = "shrink-half" | "shrink-quarter";

export type ResizeSequenceStep = {
  index: number;
  operation: TableOperation;
  sizeBefore: number;
  capacityBefore: number;
  sizeAfter: number;
  capacityAfter: number;
  resized: "grow" | "shrink" | null;
  copies: number;
  cost: number;
  cumulativeCost: number;
};

export type ResizeSequenceSimulation = {
  policyId: ShrinkPolicyId;
  label: string;
  threshold: number;
  steps: ResizeSequenceStep[];
  resizeCount: number;
  totalCopies: number;
  totalCost: number;
  finalSize: number;
  finalCapacity: number;
};

const policies: Record<ShrinkPolicyId, { label: string; threshold: number }> = {
  "shrink-half": { label: "Shrink at 1/2 full", threshold: 0.5 },
  "shrink-quarter": { label: "Shrink at 1/4 full", threshold: 0.25 },
};

export function buildThrashingSequence(cycles = 8): TableOperation[] {
  const safeCycles = Math.max(1, Math.floor(cycles));
  return Array.from({ length: safeCycles }, () => ["pop", "push"] as TableOperation[]).flat();
}

export function simulateResizeSequence(
  operations: TableOperation[],
  policyId: ShrinkPolicyId,
  initialSize = 9,
  initialCapacity = 16,
): ResizeSequenceSimulation {
  const policy = policies[policyId];
  let size = Math.max(0, Math.floor(initialSize));
  let capacity = Math.max(4, Math.floor(initialCapacity), size || 1);
  let cumulativeCost = 0;
  let resizeCount = 0;
  let totalCopies = 0;
  const steps: ResizeSequenceStep[] = [];

  operations.forEach((operation, index) => {
    const sizeBefore = size;
    const capacityBefore = capacity;
    let resized: ResizeSequenceStep["resized"] = null;
    let copies = 0;

    if (operation === "push") {
      if (size === capacity) {
        copies = size;
        capacity *= 2;
        resizeCount += 1;
        resized = "grow";
      }
      size += 1;
    } else if (size > 0) {
      size -= 1;
      if (capacity > 4 && size > 0 && size <= capacity * policy.threshold) {
        const nextCapacity = Math.max(4, size, Math.floor(capacity / 2));
        if (nextCapacity < capacity) {
          copies = size;
          capacity = nextCapacity;
          resizeCount += 1;
          resized = "shrink";
        }
      }
    }

    const cost = 1 + copies;
    totalCopies += copies;
    cumulativeCost += cost;
    steps.push({
      index: index + 1,
      operation,
      sizeBefore,
      capacityBefore,
      sizeAfter: size,
      capacityAfter: capacity,
      resized,
      copies,
      cost,
      cumulativeCost,
    });
  });

  return {
    policyId,
    label: policy.label,
    threshold: policy.threshold,
    steps,
    resizeCount,
    totalCopies,
    totalCost: cumulativeCost,
    finalSize: size,
    finalCapacity: capacity,
  };
}

export function compareShrinkPolicies(cycles = 8) {
  const operations = buildThrashingSequence(cycles);
  return (["shrink-half", "shrink-quarter"] as ShrinkPolicyId[]).map((policyId) => simulateResizeSequence(operations, policyId));
}

export const amortizedExplanationModes = [
  {
    id: "aggregate",
    label: "Aggregate",
    explanation: "Add the actual work across the whole valid sequence, then divide by the number of operations. Rare resize copies can disappear into a bounded average even though one operation is expensive.",
  },
  {
    id: "accounting",
    label: "Accounting",
    explanation: "Imagine charging ordinary operations a little more than their immediate work and saving the surplus as credits. Those credits pay for later copies; a valid charging scheme never spends credits that were not previously collected.",
  },
  {
    id: "potential",
    label: "Potential",
    explanation: "Treat unused or accumulated structural slack as stored energy. Cheap operations can increase potential; an expensive resize releases enough of that stored potential that actual cost plus potential change stays bounded over the sequence.",
  },
] as const;
