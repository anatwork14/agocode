export type GrowthPolicyId = "double" | "grow-25" | "plus-four";

export type GrowthPolicy = {
  id: GrowthPolicyId;
  label: string;
  shortLabel: string;
  family: "geometric" | "arithmetic";
  description: string;
  sourceClaim: string;
  nextCapacity: (capacity: number) => number;
};

export type AppendStep = {
  appendNumber: number;
  sizeBefore: number;
  sizeAfter: number;
  capacityBefore: number;
  capacityAfter: number;
  resized: boolean;
  copies: number;
  cost: number;
  cumulativeCost: number;
  averageCost: number;
  spareCapacity: number;
};

export type AmortizationSimulation = {
  policy: GrowthPolicy;
  steps: AppendStep[];
  appendCount: number;
  resizeCount: number;
  totalCost: number;
  averageCost: number;
  maxSingleCost: number;
  finalCapacity: number;
  spareCapacity: number;
};

export const growthPolicies: GrowthPolicy[] = [
  {
    id: "double",
    label: "Double capacity",
    shortLabel: "×2",
    family: "geometric",
    description: "When the backing array is full, allocate twice the previous capacity.",
    sourceClaim: "Geometric growth makes expensive resize operations increasingly far apart, supporting constant amortized append cost.",
    nextCapacity: (capacity) => Math.max(capacity + 1, capacity * 2),
  },
  {
    id: "grow-25",
    label: "Grow by 25%",
    shortLabel: "×1.25",
    family: "geometric",
    description: "Reserve less extra memory per resize, but accept more resize events than doubling.",
    sourceClaim: "A geometric factor smaller than two can still support constant amortized append cost, with a different time/space trade-off.",
    nextCapacity: (capacity) => Math.max(capacity + 1, Math.ceil(capacity * 1.25)),
  },
  {
    id: "plus-four",
    label: "Add four cells",
    shortLabel: "+4",
    family: "arithmetic",
    description: "Every resize adds the same fixed number of cells regardless of the current array size.",
    sourceClaim: "Fixed-increment growth causes resize copying to accumulate quadratically over a long append sequence.",
    nextCapacity: (capacity) => capacity + 4,
  },
];

export function getGrowthPolicy(id: GrowthPolicyId) {
  return growthPolicies.find((policy) => policy.id === id) ?? growthPolicies[0];
}

export function simulateAppends(appendCount: number, policyId: GrowthPolicyId): AmortizationSimulation {
  const policy = getGrowthPolicy(policyId);
  const safeCount = Math.max(0, Math.floor(appendCount));
  let size = 0;
  let capacity = 1;
  let cumulativeCost = 0;
  let resizeCount = 0;
  let maxSingleCost = 0;
  const steps: AppendStep[] = [];

  for (let index = 0; index < safeCount; index += 1) {
    const sizeBefore = size;
    const capacityBefore = capacity;
    let copies = 0;
    let resized = false;

    if (size === capacity) {
      resized = true;
      resizeCount += 1;
      copies = size;
      capacity = policy.nextCapacity(capacity);
    }

    size += 1;
    const cost = 1 + copies;
    cumulativeCost += cost;
    maxSingleCost = Math.max(maxSingleCost, cost);

    steps.push({
      appendNumber: index + 1,
      sizeBefore,
      sizeAfter: size,
      capacityBefore,
      capacityAfter: capacity,
      resized,
      copies,
      cost,
      cumulativeCost,
      averageCost: cumulativeCost / (index + 1),
      spareCapacity: capacity - size,
    });
  }

  return {
    policy,
    steps,
    appendCount: safeCount,
    resizeCount,
    totalCost: cumulativeCost,
    averageCost: safeCount ? cumulativeCost / safeCount : 0,
    maxSingleCost,
    finalCapacity: capacity,
    spareCapacity: capacity - size,
  };
}

export function compareGrowthPolicies(appendCount: number) {
  return growthPolicies.map((policy) => simulateAppends(appendCount, policy.id));
}
