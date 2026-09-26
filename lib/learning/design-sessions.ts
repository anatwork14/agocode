export const DESIGN_SESSIONS_KEY = "agocode.progress.design.sessions.v1";
export const LEGACY_DESIGN_CANVAS_KEY = "agocode:problem-design-canvas:v1";
export const MAX_DESIGN_SESSIONS = 24;

export type DesignTestCase = {
  id: string;
  input: string;
  expected: string;
  notes: string;
};

export type DesignRejection = {
  id: string;
  approach: string;
  because: string;
  wouldWorkIf: string;
};

export type DesignCanvasState = {
  problem: string;
  input: string;
  output: string;
  constraints: string;
  exactness: "" | "exact" | "approximate" | "either";
  scale: string;
  tinyCase: string;
  baseline: string;
  baselineCost: string;
  waste: string;
  models: string[];
  specialCase: string;
  paradigms: string[];
  invariant: string;
  rejectionLog: string;
  rejections: DesignRejection[];
  candidate: string;
  candidateCost: string;
  variant: string;
  tests: DesignTestCase[];
};

export type DesignSession = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  state: DesignCanvasState;
};

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

export function emptyDesignCanvasState(): DesignCanvasState {
  return {
    problem: "",
    input: "",
    output: "",
    constraints: "",
    exactness: "",
    scale: "",
    tinyCase: "",
    baseline: "",
    baselineCost: "",
    waste: "",
    models: [],
    specialCase: "",
    paradigms: [],
    invariant: "",
    rejectionLog: "",
    rejections: [],
    candidate: "",
    candidateCost: "",
    variant: "",
    tests: [],
  };
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 24) : [];
}

function normalizeTest(value: unknown, index: number): DesignTestCase | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<DesignTestCase>;
  return {
    id: text(row.id) || `test-${index + 1}`,
    input: text(row.input),
    expected: text(row.expected),
    notes: text(row.notes),
  };
}

function normalizeRejection(value: unknown, index: number): DesignRejection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<DesignRejection>;
  return {
    id: text(row.id) || `rejection-${index + 1}`,
    approach: text(row.approach),
    because: text(row.because),
    wouldWorkIf: text(row.wouldWorkIf),
  };
}

export function normalizeDesignCanvasState(value: unknown): DesignCanvasState {
  const source = value && typeof value === "object" ? value as Partial<DesignCanvasState> : {};
  const exactness = source.exactness === "exact" || source.exactness === "approximate" || source.exactness === "either"
    ? source.exactness
    : "";
  return {
    ...emptyDesignCanvasState(),
    problem: text(source.problem),
    input: text(source.input),
    output: text(source.output),
    constraints: text(source.constraints),
    exactness,
    scale: text(source.scale),
    tinyCase: text(source.tinyCase),
    baseline: text(source.baseline),
    baselineCost: text(source.baselineCost),
    waste: text(source.waste),
    models: strings(source.models),
    specialCase: text(source.specialCase),
    paradigms: strings(source.paradigms),
    invariant: text(source.invariant),
    rejectionLog: text(source.rejectionLog),
    rejections: Array.isArray(source.rejections)
      ? source.rejections.map(normalizeRejection).filter((item): item is DesignRejection => Boolean(item)).slice(0, 20)
      : [],
    candidate: text(source.candidate),
    candidateCost: text(source.candidateCost),
    variant: text(source.variant),
    tests: Array.isArray(source.tests)
      ? source.tests.map(normalizeTest).filter((item): item is DesignTestCase => Boolean(item)).slice(0, 30)
      : [],
  };
}

export function createDesignSession(id: string, name: string, now = new Date().toISOString(), state?: unknown): DesignSession {
  return {
    id,
    name: name.trim() || "Untitled design",
    createdAt: now,
    updatedAt: now,
    state: normalizeDesignCanvasState(state),
  };
}

function normalizeSession(value: unknown, index: number): DesignSession | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<DesignSession>;
  const id = text(row.id) || `design-${index + 1}`;
  const createdAt = text(row.createdAt) || new Date(0).toISOString();
  return {
    id,
    name: text(row.name).trim() || `Design ${index + 1}`,
    createdAt,
    updatedAt: text(row.updatedAt) || createdAt,
    state: normalizeDesignCanvasState(row.state),
  };
}

export function readDesignSessions(storage: StorageLike): DesignSession[] {
  try {
    const raw = storage.getItem(DESIGN_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSession)
      .filter((item): item is DesignSession => Boolean(item))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, MAX_DESIGN_SESSIONS);
  } catch {
    return [];
  }
}

export function writeDesignSessions(storage: StorageLike, sessions: DesignSession[]) {
  const normalized = sessions
    .map(normalizeSession)
    .filter((item): item is DesignSession => Boolean(item))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_DESIGN_SESSIONS);
  storage.setItem(DESIGN_SESSIONS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function upsertDesignSession(storage: StorageLike, session: DesignSession) {
  const current = readDesignSessions(storage).filter((item) => item.id !== session.id);
  return writeDesignSessions(storage, [session, ...current]);
}

export function deleteDesignSession(storage: StorageLike, sessionId: string) {
  return writeDesignSessions(storage, readDesignSessions(storage).filter((item) => item.id !== sessionId));
}

export function readLegacyDesignCanvas(storage: StorageLike): DesignCanvasState | null {
  try {
    const raw = storage.getItem(LEGACY_DESIGN_CANVAS_KEY);
    if (!raw) return null;
    return normalizeDesignCanvasState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function section(title: string, value: string) {
  return `## ${title}\n\n${value.trim() || "—"}`;
}

function bulletList(values: string[]) {
  return values.length ? values.map((value) => `- ${value}`).join("\n") : "—";
}

export function buildDesignSessionMarkdown(session: DesignSession) {
  const state = session.state;
  const rejectionText = state.rejections.length
    ? state.rejections.map((item, index) => [
        `### ${index + 1}. ${item.approach.trim() || "Unnamed approach"}`,
        `- **Rejected because:** ${item.because.trim() || "—"}`,
        `- **Could work if:** ${item.wouldWorkIf.trim() || "—"}`,
      ].join("\n")).join("\n\n")
    : state.rejectionLog.trim() || "—";
  const testText = state.tests.length
    ? state.tests.map((item, index) => [
        `### Test ${index + 1}`,
        `- **Input:** ${item.input.trim() || "—"}`,
        `- **Expected:** ${item.expected.trim() || "—"}`,
        `- **Notes:** ${item.notes.trim() || "—"}`,
      ].join("\n")).join("\n\n")
    : "—";

  return [
    `# ${session.name}`,
    `\n> AgoCode design session · updated ${session.updatedAt}`,
    section("Problem", state.problem),
    section("Input", state.input),
    section("Output / objective", state.output),
    section("Constraints / assumptions", state.constraints),
    section("Exactness", state.exactness),
    section("Scale / latency", state.scale),
    section("Tiny + extreme case", state.tinyCase),
    section("Baseline", state.baseline),
    section("Baseline cost", state.baselineCost),
    section("Named waste", state.waste),
    section("Possible models", bulletList(state.models)),
    section("Special-case ladder", state.specialCase),
    section("Candidate paradigms", bulletList(state.paradigms)),
    section("Invariant / proof obligation", state.invariant),
    `## Rejected approaches\n\n${rejectionText}`,
    section("Candidate design", state.candidate),
    section("Candidate cost + assumptions", state.candidateCost),
    section("Transfer variant", state.variant),
    `## Test-case scratchpad\n\n${testText}`,
  ].join("\n\n");
}
