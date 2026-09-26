export type PrimaryLearnerJourney = {
  id: string;
  label: string;
  routes: readonly string[];
};

export const primaryLearnerJourneys = [
  {
    id: "book-to-evidence",
    label: "Book lesson → focused practice → review → progress",
    routes: ["/learn", "/learn/binary-search", "/practice/binary-search", "/review", "/progress"],
  },
  {
    id: "adaptive-problem-solving",
    label: "Exercise atlas → next problem → mixed session → progress",
    routes: ["/exercises", "/practice/next", "/practice/session", "/progress"],
  },
  {
    id: "adaptive-curriculum",
    label: "Diagnostic → adaptive curriculum → daily practice → progress",
    routes: ["/diagnostic", "/plan", "/practice/session", "/progress"],
  },
  {
    id: "syllabus-to-workbench",
    label: "Syllabus → prerequisite map → workbench → design canvas",
    routes: ["/syllabus", "/syllabus/map", "/lab", "/solve"],
  },
  {
    id: "evidence-portability",
    label: "Progress → local evidence export/import",
    routes: ["/progress", "/settings/data"],
  },
] as const satisfies readonly PrimaryLearnerJourney[];
