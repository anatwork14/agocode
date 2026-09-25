export const moduleLabRoutes: Record<string, string> = {
  correctness: "/lab/invariants",
  amortization: "/lab/amortization",
  "sequence-representations": "/lab/adt-workbench",
  "stack-queue-deque": "/lab/adt-workbench",
  "priority-queues": "/lab/adt-workbench",
  "sorting-as-tool": "/lab/transformations",
  "graph-representation": "/lab/graph-modeling",
  "dynamic-programming": "/lab/dp-state-design",
  hardness: "/lab/optimization-strategies",
  "baseline-refine": "/lab/special-cases",
};

export function getModuleRoute(moduleId: string, canonicalRoute?: string) {
  return moduleLabRoutes[moduleId] ?? canonicalRoute;
}
