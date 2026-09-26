export const moduleLabRoutes: Record<string, string> = {
  correctness: "/lab/invariants",
  amortization: "/lab/amortization",
  "sequence-representations": "/lab/adt-workbench",
  "stack-queue-deque": "/lab/adt-workbench",
  "priority-queues": "/lab/priority-queues",
  "sorting-as-tool": "/lab/transformations",
  "backtracking-pruning": "/lab/backtracking",
  "graph-representation": "/lab/graph-modeling",
  "greedy-invariant": "/lab/greedy-counterexamples",
  "dynamic-programming": "/lab/dp-state-design",
  hardness: "/lab/optimization-strategies",
  "baseline-refine": "/lab/special-cases",
};

export function getModulePrimaryRoute(moduleId: string, canonicalRoute?: string) {
  return moduleLabRoutes[moduleId] ?? canonicalRoute;
}

export function getModuleRoute(moduleId: string, canonicalRoute?: string) {
  return getModulePrimaryRoute(moduleId, canonicalRoute) ?? `/syllabus/${moduleId}`;
}
