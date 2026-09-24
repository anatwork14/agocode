export type Interval = {
  id: string;
  start: number;
  end: number;
};

export type IntervalDecision = {
  interval: Interval;
  accepted: boolean;
  selectedBefore: string[];
  reason: string;
};

export type IntervalScheduleResult = {
  selected: Interval[];
  decisions: IntervalDecision[];
};

export function greedyIntervalSchedule(intervals: readonly Interval[]): IntervalScheduleResult {
  const sorted = [...intervals].sort((a, b) => a.end - b.end || a.start - b.start || a.id.localeCompare(b.id));
  const selected: Interval[] = [];
  const decisions: IntervalDecision[] = [];
  let lastEnd = Number.NEGATIVE_INFINITY;

  for (const interval of sorted) {
    const accepted = interval.start >= lastEnd;
    decisions.push({
      interval,
      accepted,
      selectedBefore: selected.map((item) => item.id),
      reason: accepted
        ? `${interval.id} starts after the current schedule ends, so choosing the earliest-finishing compatible interval leaves the most room for what follows.`
        : `${interval.id} overlaps the most recently selected interval, so it cannot join this schedule.`,
    });

    if (accepted) {
      selected.push(interval);
      lastEnd = interval.end;
    }
  }

  return { selected, decisions };
}

export type CoverageMap = Record<string, readonly string[]>;

export type SetCoverStep = {
  chosen: string;
  newlyCovered: string[];
  uncoveredBefore: string[];
  uncoveredAfter: string[];
};

export type SetCoverResult = {
  selected: string[];
  steps: SetCoverStep[];
  uncovered: string[];
};

export function greedySetCover(requiredItems: readonly string[], options: CoverageMap): SetCoverResult {
  const uncovered = new Set(requiredItems);
  const selected: string[] = [];
  const steps: SetCoverStep[] = [];
  const used = new Set<string>();

  while (uncovered.size > 0) {
    let bestOption: string | null = null;
    let bestCoverage: string[] = [];

    for (const [option, coveredItems] of Object.entries(options)) {
      if (used.has(option)) continue;
      const newlyCovered = coveredItems.filter((item) => uncovered.has(item));
      if (newlyCovered.length > bestCoverage.length) {
        bestOption = option;
        bestCoverage = newlyCovered;
      }
    }

    if (!bestOption || bestCoverage.length === 0) break;

    const uncoveredBefore = [...uncovered];
    for (const item of bestCoverage) uncovered.delete(item);
    used.add(bestOption);
    selected.push(bestOption);
    steps.push({
      chosen: bestOption,
      newlyCovered: [...bestCoverage],
      uncoveredBefore,
      uncoveredAfter: [...uncovered],
    });
  }

  return { selected, steps, uncovered: [...uncovered] };
}
