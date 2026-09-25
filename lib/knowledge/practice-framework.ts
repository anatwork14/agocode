export type PracticeStage = {
  id: string;
  number: string;
  title: string;
  purpose: string;
  learnerPrompt: string;
  evidence: string[];
  sourcePerspective: string;
};

export const practiceStages: PracticeStage[] = [
  {
    id: "reinforce",
    number: "01",
    title: "Reinforce the mechanism",
    purpose: "Make definitions, state transitions, invariants, and operation costs explicit before asking for invention.",
    learnerPrompt: "Can I execute and explain the mechanism without looking at the finished implementation?",
    evidence: ["trace state correctly", "state the invariant", "predict the next operation", "analyze the dominant cost"],
    sourcePerspective: "Goodrich · Reinforcement",
  },
  {
    id: "create",
    number: "02",
    title: "Create from constraints",
    purpose: "Remove the chapter recipe. Start with a correct baseline, identify waste, then design or adapt a better method.",
    learnerPrompt: "Can I derive an approach when the technique is not named for me?",
    evidence: ["produce a baseline", "name repeated work", "compare representations", "justify the improvement"],
    sourcePerspective: "Goodrich · Creativity + EPI refinement",
  },
  {
    id: "build",
    number: "03",
    title: "Build the larger artifact",
    purpose: "Turn an algorithmic idea into a reusable component or small system with interfaces, tests, and real resource constraints.",
    learnerPrompt: "Can I preserve the algorithm's guarantees inside software that has more than one moving part?",
    evidence: ["define an interface", "separate strategy from representation", "test edge cases", "document complexity assumptions"],
    sourcePerspective: "Goodrich · Projects",
  },
  {
    id: "recognize",
    number: "04",
    title: "Recognize without labels",
    purpose: "Interleave domains so chapter names, tags, and technique labels no longer reveal the intended method.",
    learnerPrompt: "Can I identify the structure from the problem itself rather than from where it appears in a course?",
    evidence: ["classify the problem", "propose competing models", "reject one with a reason", "select a justified candidate"],
    sourcePerspective: "EPI · patterns + Skiena · catalog",
  },
  {
    id: "vary",
    number: "05",
    title: "Vary and transfer",
    purpose: "Change one assumption and determine which invariant, data structure, complexity bound, or model stops working.",
    learnerPrompt: "Can I carry the idea into a nearby problem without carrying the solution verbatim?",
    evidence: ["solve a variant", "name what survives", "name what breaks", "revise the model or state"],
    sourcePerspective: "EPI · variants + AgoCode · transfer",
  },
  {
    id: "retrieve",
    number: "06",
    title: "Retrieve after delay",
    purpose: "Return after spacing and rebuild the reasoning path from a blank page rather than replaying recent recognition.",
    learnerPrompt: "Can I reconstruct the mechanism and the design argument when the answer is no longer fresh?",
    evidence: ["recall the invariant", "rebuild key code", "explain complexity", "recognize a mixed problem"],
    sourcePerspective: "AgoCode · mastery + review",
  },
] as const;
