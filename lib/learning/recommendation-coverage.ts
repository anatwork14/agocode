import { getCanonicalExercise, type ExerciseLevel, type ExerciseSource } from "../knowledge/all-exercises.ts";
import type { EvidenceDimension } from "./progressCatalog.ts";
import type {
  RecommendationPolicySnapshotHistory,
  RecommendationPolicyStabilityAudit,
  RecommendationStabilityComparison,
} from "./recommendation-stability.ts";

export const DEFAULT_COVERAGE_MIN_SNAPSHOTS = 6;
export const DEFAULT_COVERAGE_MIN_UNIQUE_RETENTION = 80;
export const DEFAULT_COVERAGE_MAX_DISTRIBUTION_DRIFT = 25;
export const DEFAULT_COVERAGE_MAX_CONCENTRATION_DELTA = 20;
export const DEFAULT_COVERAGE_MIN_COHORT_SNAPSHOTS = 2;
export const DEFAULT_COVERAGE_MIN_COHORT_OVERLAP = 60;
export const DEFAULT_COVERAGE_MIN_MEANINGFUL_BASELINE_SLOTS = 2;

export type RecommendationCoverageAxis = "family" | "source" | "domain" | "level";
export type RecommendationCoverageStatus = "insufficient" | "balanced" | "imbalanced";

export type RecommendationCoverageAxisAudit = {
  axis: RecommendationCoverageAxis;
  baselineUnique: number;
  candidateUnique: number;
  retainedBaselineValues: number;
  uniqueRetention: number;
  baselineMaxShare: number;
  candidateMaxShare: number;
  concentrationDelta: number;
  distributionDrift: number;
  starvedValues: string[];
  status: "balanced" | "imbalanced";
  explanation: string;
};

export type RecommendationCoverageCohortAudit = {
  dimensionId: EvidenceDimension;
  snapshots: number;
  topChoiceRetention: number;
  meanTopFiveOverlap: number;
  status: "observing" | "balanced" | "imbalanced";
  explanation: string;
};

export type RecommendationCoverageSample = {
  snapshotId: string;
  targetDimension: EvidenceDimension;
  topChoiceSame: boolean;
  topFiveOverlap: number;
  baseline: {
    family: string[];
    source: ExerciseSource[];
    domain: string[];
    level: ExerciseLevel[];
  };
  candidate: {
    family: string[];
    source: ExerciseSource[];
    domain: string[];
    level: ExerciseLevel[];
  };
};

export type RecommendationPolicyCoverageAudit = {
  available: boolean;
  candidatePolicyId?: string;
  replayedSnapshots: number;
  minimumSnapshots: number;
  axes: RecommendationCoverageAxisAudit[];
  cohorts: RecommendationCoverageCohortAudit[];
  imbalancedAxes: number;
  imbalancedCohorts: number;
  status: RecommendationCoverageStatus;
  launchEligible: boolean;
  explanation: string;
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function finitePercent(numerator: number, denominator: number) {
  return denominator > 0 ? clampPercent((numerator / denominator) * 100) : 100;
}

function mean(values: readonly number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countValues(values: readonly string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function share(count: number, total: number) {
  return total > 0 ? (count / total) * 100 : 0;
}

function buildAxisAudit(input: {
  axis: RecommendationCoverageAxis;
  baselineValues: string[];
  candidateValues: string[];
  minUniqueRetention: number;
  maxDistributionDrift: number;
  maxConcentrationDelta: number;
  minimumMeaningfulBaselineSlots: number;
}): RecommendationCoverageAxisAudit {
  const baselineCounts = countValues(input.baselineValues);
  const candidateCounts = countValues(input.candidateValues);
  const baselineKeys = [...baselineCounts.keys()];
  const candidateKeys = [...candidateCounts.keys()];
  const retainedBaselineValues = baselineKeys.filter((value) => candidateCounts.has(value)).length;
  const uniqueRetention = finitePercent(retainedBaselineValues, baselineKeys.length);
  const allKeys = new Set([...baselineKeys, ...candidateKeys]);
  const baselineTotal = input.baselineValues.length;
  const candidateTotal = input.candidateValues.length;
  const distributionDrift = clampPercent(
    [...allKeys].reduce((sum, value) => (
      sum + Math.abs(
        share(baselineCounts.get(value) ?? 0, baselineTotal)
        - share(candidateCounts.get(value) ?? 0, candidateTotal)
      )
    ), 0) / 2,
  );
  const baselineMaxShare = clampPercent(Math.max(0, ...baselineKeys.map((value) => share(baselineCounts.get(value) ?? 0, baselineTotal))));
  const candidateMaxShare = clampPercent(Math.max(0, ...candidateKeys.map((value) => share(candidateCounts.get(value) ?? 0, candidateTotal))));
  const concentrationDelta = candidateMaxShare - baselineMaxShare;
  const meaningfulSlotThreshold = Math.max(
    input.minimumMeaningfulBaselineSlots,
    Math.ceil(baselineTotal * 0.05),
  );
  const starvedValues = baselineKeys
    .filter((value) => (baselineCounts.get(value) ?? 0) >= meaningfulSlotThreshold && !candidateCounts.has(value))
    .sort();
  const imbalanced = uniqueRetention < input.minUniqueRetention
    || distributionDrift > input.maxDistributionDrift
    || concentrationDelta > input.maxConcentrationDelta
    || starvedValues.length > 0;
  const status = imbalanced ? "imbalanced" : "balanced";
  const explanation = imbalanced
    ? `${input.axis} coverage is imbalanced: retained ${uniqueRetention}% of baseline categories, distribution drift ${distributionDrift}%, concentration delta ${concentrationDelta > 0 ? "+" : ""}${concentrationDelta} points${starvedValues.length ? `, starved ${starvedValues.join(", ")}` : ""}.`
    : `${input.axis} coverage remains close to baseline: ${uniqueRetention}% category retention, ${distributionDrift}% distribution drift, and ${concentrationDelta > 0 ? "+" : ""}${concentrationDelta} points of concentration change.`;

  return {
    axis: input.axis,
    baselineUnique: baselineKeys.length,
    candidateUnique: candidateKeys.length,
    retainedBaselineValues,
    uniqueRetention,
    baselineMaxShare,
    candidateMaxShare,
    concentrationDelta,
    distributionDrift,
    starvedValues,
    status,
    explanation,
  };
}

function buildCohortAudits(
  samples: RecommendationCoverageSample[],
  minimumCohortSnapshots: number,
  minimumCohortOverlap: number,
): RecommendationCoverageCohortAudit[] {
  const grouped = new Map<EvidenceDimension, RecommendationCoverageSample[]>();
  for (const sample of samples) {
    const rows = grouped.get(sample.targetDimension) ?? [];
    rows.push(sample);
    grouped.set(sample.targetDimension, rows);
  }

  return [...grouped.entries()]
    .map(([dimensionId, rows]): RecommendationCoverageCohortAudit => {
      const topChoiceRetention = finitePercent(rows.filter((row) => row.topChoiceSame).length, rows.length);
      const meanTopFiveOverlap = mean(rows.map((row) => row.topFiveOverlap));
      const status = rows.length < minimumCohortSnapshots
        ? "observing"
        : meanTopFiveOverlap < minimumCohortOverlap
          ? "imbalanced"
          : "balanced";
      const explanation = status === "observing"
        ? `Only ${rows.length} saved ${dimensionId} state${rows.length === 1 ? "" : "s"}; at least ${minimumCohortSnapshots} are needed before this cohort can block launch.`
        : status === "imbalanced"
          ? `${dimensionId} learner states retain only ${meanTopFiveOverlap}% of the baseline shortlist on average; this cohort would absorb disproportionate policy churn.`
          : `${dimensionId} learner states retain ${meanTopFiveOverlap}% of the baseline shortlist on average (${topChoiceRetention}% keep the same top choice).`;
      return {
        dimensionId,
        snapshots: rows.length,
        topChoiceRetention,
        meanTopFiveOverlap,
        status,
        explanation,
      };
    })
    .sort((left, right) => (
      (left.status === "imbalanced" ? 0 : left.status === "balanced" ? 1 : 2)
      - (right.status === "imbalanced" ? 0 : right.status === "balanced" ? 1 : 2)
      || right.snapshots - left.snapshots
      || left.dimensionId.localeCompare(right.dimensionId)
    ));
}

export function summarizeRecommendationCoverageSamples(input: {
  candidatePolicyId: string;
  samples: RecommendationCoverageSample[];
  minimumSnapshots?: number;
  minUniqueRetention?: number;
  maxDistributionDrift?: number;
  maxConcentrationDelta?: number;
  minimumCohortSnapshots?: number;
  minimumCohortOverlap?: number;
  minimumMeaningfulBaselineSlots?: number;
}): RecommendationPolicyCoverageAudit {
  const minimumSnapshots = Math.max(2, Math.floor(input.minimumSnapshots ?? DEFAULT_COVERAGE_MIN_SNAPSHOTS));
  const minUniqueRetention = Math.max(0, Math.min(100, input.minUniqueRetention ?? DEFAULT_COVERAGE_MIN_UNIQUE_RETENTION));
  const maxDistributionDrift = Math.max(0, Math.min(100, input.maxDistributionDrift ?? DEFAULT_COVERAGE_MAX_DISTRIBUTION_DRIFT));
  const maxConcentrationDelta = Math.max(0, Math.min(100, input.maxConcentrationDelta ?? DEFAULT_COVERAGE_MAX_CONCENTRATION_DELTA));
  const minimumCohortSnapshots = Math.max(2, Math.floor(input.minimumCohortSnapshots ?? DEFAULT_COVERAGE_MIN_COHORT_SNAPSHOTS));
  const minimumCohortOverlap = Math.max(0, Math.min(100, input.minimumCohortOverlap ?? DEFAULT_COVERAGE_MIN_COHORT_OVERLAP));
  const minimumMeaningfulBaselineSlots = Math.max(1, Math.floor(input.minimumMeaningfulBaselineSlots ?? DEFAULT_COVERAGE_MIN_MEANINGFUL_BASELINE_SLOTS));

  const axes: RecommendationCoverageAxisAudit[] = (["family", "source", "domain", "level"] as const).map((axis) => buildAxisAudit({
    axis,
    baselineValues: input.samples.flatMap((sample) => sample.baseline[axis]),
    candidateValues: input.samples.flatMap((sample) => sample.candidate[axis]),
    minUniqueRetention,
    maxDistributionDrift,
    maxConcentrationDelta,
    minimumMeaningfulBaselineSlots,
  }));
  const cohorts = buildCohortAudits(input.samples, minimumCohortSnapshots, minimumCohortOverlap);
  const imbalancedAxes = axes.filter((axis) => axis.status === "imbalanced").length;
  const imbalancedCohorts = cohorts.filter((cohort) => cohort.status === "imbalanced").length;

  let status: RecommendationCoverageStatus = "insufficient";
  if (input.samples.length >= minimumSnapshots) {
    status = imbalancedAxes || imbalancedCohorts ? "imbalanced" : "balanced";
  }
  const launchEligible = status === "balanced";
  const explanation = status === "insufficient"
    ? `Collect at least ${minimumSnapshots} replayable learner states before using coverage as an experiment gate.`
    : status === "imbalanced"
      ? `Coverage guardrails found ${imbalancedAxes} imbalanced content axis${imbalancedAxes === 1 ? "" : "es"} and ${imbalancedCohorts} imbalanced mastery cohort${imbalancedCohorts === 1 ? "" : "s"}. Keep the deterministic baseline until the candidate stops concentrating or starving recommendation exposure.`
      : `Candidate exposure stays close to baseline across structural family, source, domain, difficulty, and observed weakest-mastery cohorts. Coverage guardrails permit a live experiment.`;

  return {
    available: true,
    candidatePolicyId: input.candidatePolicyId,
    replayedSnapshots: input.samples.length,
    minimumSnapshots,
    axes,
    cohorts,
    imbalancedAxes,
    imbalancedCohorts,
    status,
    launchEligible,
    explanation,
  };
}

function comparisonSample(
  comparison: RecommendationStabilityComparison,
  targetDimension: EvidenceDimension,
): RecommendationCoverageSample | null {
  const baselineExercises = comparison.baselineTopIds.map(getCanonicalExercise);
  const candidateExercises = comparison.candidateTopIds.map(getCanonicalExercise);
  if (baselineExercises.some((exercise) => !exercise) || candidateExercises.some((exercise) => !exercise)) return null;
  const baseline = baselineExercises.filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise));
  const candidate = candidateExercises.filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise));
  return {
    snapshotId: comparison.snapshotId,
    targetDimension,
    topChoiceSame: comparison.topChoiceSame,
    topFiveOverlap: comparison.topFiveOverlap,
    baseline: {
      family: [...comparison.baselineFamilies],
      source: baseline.map((exercise) => exercise.source),
      domain: baseline.map((exercise) => exercise.domain),
      level: baseline.map((exercise) => exercise.level),
    },
    candidate: {
      family: [...comparison.candidateFamilies],
      source: candidate.map((exercise) => exercise.source),
      domain: candidate.map((exercise) => exercise.domain),
      level: candidate.map((exercise) => exercise.level),
    },
  };
}

export function buildRecommendationPolicyCoverageAudit(input: {
  stability: RecommendationPolicyStabilityAudit;
  snapshots: RecommendationPolicySnapshotHistory;
  minimumSnapshots?: number;
}): RecommendationPolicyCoverageAudit {
  const minimumSnapshots = Math.max(2, Math.floor(input.minimumSnapshots ?? DEFAULT_COVERAGE_MIN_SNAPSHOTS));
  if (!input.stability.candidatePolicyId) {
    return {
      available: false,
      replayedSnapshots: 0,
      minimumSnapshots,
      axes: [],
      cohorts: [],
      imbalancedAxes: 0,
      imbalancedCohorts: 0,
      status: "insufficient",
      launchEligible: false,
      explanation: "No candidate policy exists to evaluate for recommendation coverage.",
    };
  }

  const snapshotById = new Map(input.snapshots.entries.map((snapshot) => [snapshot.id, snapshot]));
  const samples = input.stability.comparisons
    .map((comparison) => {
      const snapshot = snapshotById.get(comparison.snapshotId);
      if (!snapshot) return null;
      return comparisonSample(comparison, snapshot.mastery.weakest.id);
    })
    .filter((sample): sample is RecommendationCoverageSample => Boolean(sample));

  return summarizeRecommendationCoverageSamples({
    candidatePolicyId: input.stability.candidatePolicyId,
    samples,
    minimumSnapshots,
  });
}
