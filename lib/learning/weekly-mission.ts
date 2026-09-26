import type { StorageLike } from "./evidence.ts";
import type { AdaptiveCurriculumPlan, CurriculumModuleProfile, CurriculumModuleState } from "./curriculum-planner.ts";

export const WEEKLY_MISSION_KEY = "agocode.progress.weekly-mission";
export const WEEKLY_MISSION_HISTORY_LIMIT = 12;

export type WeeklyMissionRole = "strengthen" | "advance" | "unlock";

export type WeeklyMissionItem = {
  moduleId: string;
  title: string;
  route: string;
  role: WeeklyMissionRole;
  reason: string;
  baselineState: CurriculumModuleState;
  baselineObjectiveScore: number;
  targetObjectiveScore: number;
};

export type WeeklyMission = {
  version: 1;
  weekKey: string;
  generatedAt: string;
  updatedAt: string;
  items: WeeklyMissionItem[];
};

export type WeeklyMissionSummary = {
  weekKey: string;
  generatedAt: string;
  archivedAt: string;
  total: number;
  satisfied: number;
};

export type WeeklyMissionState = {
  version: 1;
  current?: WeeklyMission;
  history: WeeklyMissionSummary[];
};

export type WeeklyMissionEvaluation = {
  item: WeeklyMissionItem;
  current?: CurriculumModuleProfile;
  satisfied: boolean;
  progressDelta: number;
  explanation: string;
};

function emptyState(): WeeklyMissionState {
  return { version: 1, history: [] };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalWeekKey(date = new Date()) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = local.getDay();
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + distanceToMonday);
  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}`;
}

function parseMissionItem(value: unknown): WeeklyMissionItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<WeeklyMissionItem>;
  const validRole = item.role === "strengthen" || item.role === "advance" || item.role === "unlock";
  const validState = item.baselineState === "mastered" || item.baselineState === "developing" || item.baselineState === "ready" || item.baselineState === "blocked";
  if (
    typeof item.moduleId !== "string"
    || typeof item.title !== "string"
    || typeof item.route !== "string"
    || typeof item.reason !== "string"
    || !validRole
    || !validState
    || typeof item.baselineObjectiveScore !== "number"
    || typeof item.targetObjectiveScore !== "number"
  ) return null;
  return item as WeeklyMissionItem;
}

function parseMission(value: unknown): WeeklyMission | undefined {
  if (!value || typeof value !== "object") return undefined;
  const mission = value as Partial<WeeklyMission>;
  if (mission.version !== 1 || typeof mission.weekKey !== "string" || typeof mission.generatedAt !== "string" || typeof mission.updatedAt !== "string" || !Array.isArray(mission.items)) return undefined;
  const items = mission.items.map(parseMissionItem).filter((item): item is WeeklyMissionItem => Boolean(item));
  if (items.length !== mission.items.length) return undefined;
  return { version: 1, weekKey: mission.weekKey, generatedAt: mission.generatedAt, updatedAt: mission.updatedAt, items };
}

function parseSummary(value: unknown): WeeklyMissionSummary | null {
  if (!value || typeof value !== "object") return null;
  const summary = value as Partial<WeeklyMissionSummary>;
  if (typeof summary.weekKey !== "string" || typeof summary.generatedAt !== "string" || typeof summary.archivedAt !== "string") return null;
  return {
    weekKey: summary.weekKey,
    generatedAt: summary.generatedAt,
    archivedAt: summary.archivedAt,
    total: typeof summary.total === "number" ? Math.max(0, Math.floor(summary.total)) : 0,
    satisfied: typeof summary.satisfied === "number" ? Math.max(0, Math.floor(summary.satisfied)) : 0,
  };
}

export function readWeeklyMissionState(storage: StorageLike): WeeklyMissionState {
  try {
    const raw = storage.getItem(WEEKLY_MISSION_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<WeeklyMissionState>;
    if (parsed.version !== 1) return emptyState();
    const current = parseMission(parsed.current);
    const history = Array.isArray(parsed.history)
      ? parsed.history.map(parseSummary).filter((entry): entry is WeeklyMissionSummary => Boolean(entry)).slice(-WEEKLY_MISSION_HISTORY_LIMIT)
      : [];
    return { version: 1, current, history };
  } catch {
    return emptyState();
  }
}

function writeState(storage: StorageLike, state: WeeklyMissionState) {
  storage.setItem(WEEKLY_MISSION_KEY, JSON.stringify(state));
}

function missionRole(module: CurriculumModuleProfile): WeeklyMissionRole {
  if (module.state === "developing") return "strengthen";
  if (module.downstreamCount > 0) return "unlock";
  return "advance";
}

function missionReason(module: CurriculumModuleProfile, role: WeeklyMissionRole) {
  if (role === "strengthen") {
    return `You already have objective evidence here (${module.evidence.objectiveScore}/100), so this mission asks for another stronger attempt instead of switching topics too early.`;
  }
  if (role === "unlock") {
    return `This ready module feeds ${module.downstreamCount} downstream module${module.downstreamCount === 1 ? "" : "s"}; building evidence here opens more of the prerequisite graph.`;
  }
  if (typeof module.diagnosticScore === "number" && module.diagnosticScore >= 75) {
    return `Diagnostic placement (${module.diagnosticScore}%) says you can start here without spending the week on earlier prerequisites; objective evidence is still required.`;
  }
  return "Prerequisites are satisfied and this is one of the highest-priority next modules in the current curriculum plan.";
}

function selectMissionModules(plan: AdaptiveCurriculumPlan) {
  const selected: CurriculumModuleProfile[] = [];
  const add = (module: CurriculumModuleProfile | undefined) => {
    if (module && !selected.some((item) => item.id === module.id) && selected.length < 4) selected.push(module);
  };

  plan.nextModules.filter((module) => module.state === "developing").slice(0, 2).forEach(add);
  plan.nextModules.filter((module) => module.state === "ready" && module.downstreamCount > 0).forEach(add);
  plan.nextModules.filter((module) => module.state === "ready").forEach(add);
  plan.nextModules.forEach(add);
  return selected.slice(0, 4);
}

export function buildWeeklyMission(plan: AdaptiveCurriculumPlan, now = new Date()): WeeklyMission {
  const timestamp = now.toISOString();
  const items = selectMissionModules(plan).map((module): WeeklyMissionItem => {
    const role = missionRole(module);
    const baselineObjectiveScore = module.evidence.objectiveScore;
    const targetObjectiveScore = module.state === "developing"
      ? Math.min(75, Math.max(baselineObjectiveScore + 20, 50))
      : 20;
    return {
      moduleId: module.id,
      title: module.title,
      route: module.route,
      role,
      reason: missionReason(module, role),
      baselineState: module.state,
      baselineObjectiveScore,
      targetObjectiveScore,
    };
  });
  return { version: 1, weekKey: getLocalWeekKey(now), generatedAt: timestamp, updatedAt: timestamp, items };
}

export function evaluateWeeklyMission(mission: WeeklyMission, plan: AdaptiveCurriculumPlan): WeeklyMissionEvaluation[] {
  const profileById = new Map(plan.modules.map((module) => [module.id, module]));
  return mission.items.map((item): WeeklyMissionEvaluation => {
    const current = profileById.get(item.moduleId);
    const currentScore = current?.evidence.objectiveScore ?? item.baselineObjectiveScore;
    const progressDelta = Math.max(0, currentScore - item.baselineObjectiveScore);
    const satisfied = Boolean(current && (
      current.state === "mastered"
      || (currentScore >= item.targetObjectiveScore && currentScore > item.baselineObjectiveScore)
    ));
    const explanation = satisfied
      ? current?.state === "mastered"
        ? "Verified independent evidence now satisfies the module's mastery threshold."
        : `Fresh objective evidence raised this module by ${progressDelta} points to ${currentScore}/100.`
      : `Needs fresh objective evidence after the weekly baseline (${item.baselineObjectiveScore}/100); diagnostic placement alone cannot complete a mission.`;
    return { item, current, satisfied, progressDelta, explanation };
  });
}

function summarizeMission(mission: WeeklyMission, plan: AdaptiveCurriculumPlan, archivedAt: string): WeeklyMissionSummary {
  const evaluations = evaluateWeeklyMission(mission, plan);
  return {
    weekKey: mission.weekKey,
    generatedAt: mission.generatedAt,
    archivedAt,
    total: mission.items.length,
    satisfied: evaluations.filter((entry) => entry.satisfied).length,
  };
}

export function ensureWeeklyMission(
  storage: StorageLike,
  plan: AdaptiveCurriculumPlan,
  now = new Date(),
): WeeklyMission {
  const state = readWeeklyMissionState(storage);
  const weekKey = getLocalWeekKey(now);
  if (state.current?.weekKey === weekKey) return state.current;
  const timestamp = now.toISOString();
  const history = state.current
    ? [...state.history, summarizeMission(state.current, plan, timestamp)].slice(-WEEKLY_MISSION_HISTORY_LIMIT)
    : state.history;
  const current = buildWeeklyMission(plan, now);
  writeState(storage, { version: 1, current, history });
  return current;
}

export function regenerateWeeklyMission(
  storage: StorageLike,
  plan: AdaptiveCurriculumPlan,
  now = new Date(),
): WeeklyMission {
  const state = readWeeklyMissionState(storage);
  const current = buildWeeklyMission(plan, now);
  writeState(storage, { ...state, current });
  return current;
}
