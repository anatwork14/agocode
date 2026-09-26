import { invariantScenarios as coreInvariantScenarios } from "./invariant-workbench.ts";
import { extendedInvariantScenarios } from "./invariant-scenario-extensions.ts";

export const invariantScenarios = [...coreInvariantScenarios, ...extendedInvariantScenarios];

export function getInvariantScenario(id: string) {
  return invariantScenarios.find((scenario) => scenario.id === id);
}
