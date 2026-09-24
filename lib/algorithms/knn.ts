export type KnnSample<TLabel extends string = string> = {
  id: string;
  features: number[];
  label?: TLabel;
  response?: number;
};

export type Neighbor<TLabel extends string = string> = KnnSample<TLabel> & {
  distance: number;
};

function validateVector(vector: readonly number[], name: string) {
  if (!vector.length) throw new Error(`${name} must contain at least one feature.`);
  if (vector.some((value) => !Number.isFinite(value))) throw new Error(`${name} must contain only finite numeric features.`);
}

export function euclideanDistance(a: readonly number[], b: readonly number[]) {
  validateVector(a, "First vector");
  validateVector(b, "Second vector");
  if (a.length !== b.length) throw new Error("Feature vectors must have the same dimension.");
  return Math.sqrt(a.reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));
}

export function nearestNeighbors<TLabel extends string>(
  samples: readonly KnnSample<TLabel>[],
  target: readonly number[],
  k: number,
): Neighbor<TLabel>[] {
  validateVector(target, "Target vector");
  if (!Number.isInteger(k) || k < 1) throw new Error("k must be a positive integer.");
  if (k > samples.length) throw new Error("k cannot be larger than the number of samples.");

  return samples
    .map((sample) => {
      if (sample.features.length !== target.length) throw new Error("Every sample must use the same feature dimensions as the target.");
      return { ...sample, distance: euclideanDistance(sample.features, target) };
    })
    .sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id))
    .slice(0, k);
}

export type ClassificationResult<TLabel extends string = string> = {
  label: TLabel;
  neighbors: Neighbor<TLabel>[];
  votes: Record<string, number>;
};

export function knnClassify<TLabel extends string>(
  samples: readonly KnnSample<TLabel>[],
  target: readonly number[],
  k: number,
): ClassificationResult<TLabel> {
  if (samples.some((sample) => sample.label === undefined)) throw new Error("Every classification sample needs a label.");
  const neighbors = nearestNeighbors(samples, target, k);
  const votes = new Map<TLabel, { count: number; distanceTotal: number }>();

  for (const neighbor of neighbors) {
    const label = neighbor.label as TLabel;
    const current = votes.get(label) ?? { count: 0, distanceTotal: 0 };
    votes.set(label, { count: current.count + 1, distanceTotal: current.distanceTotal + neighbor.distance });
  }

  const ranked = [...votes.entries()].sort((left, right) => {
    const countDifference = right[1].count - left[1].count;
    if (countDifference !== 0) return countDifference;
    const distanceDifference = left[1].distanceTotal - right[1].distanceTotal;
    if (distanceDifference !== 0) return distanceDifference;
    return left[0].localeCompare(right[0]);
  });

  if (!ranked.length) throw new Error("Classification requires at least one labeled sample.");

  return {
    label: ranked[0][0],
    neighbors,
    votes: Object.fromEntries([...votes.entries()].map(([label, value]) => [label, value.count])),
  };
}

export type RegressionResult = {
  prediction: number;
  neighbors: Neighbor[];
};

export function knnRegress(samples: readonly KnnSample[], target: readonly number[], k: number): RegressionResult {
  if (samples.some((sample) => sample.response === undefined || !Number.isFinite(sample.response))) {
    throw new Error("Every regression sample needs a finite numeric response.");
  }
  const neighbors = nearestNeighbors(samples, target, k);
  const prediction = neighbors.reduce((sum, neighbor) => sum + (neighbor.response as number), 0) / neighbors.length;
  return { prediction, neighbors };
}
