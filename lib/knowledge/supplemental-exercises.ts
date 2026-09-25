import type { CanonicalExercise, ExerciseLevel } from "./exercises.ts";

type SupplementalGroup = {
  sourceChapter: string;
  domain: string;
  level: ExerciseLevel;
  tags: string[];
  titles: string[];
};

const groups: SupplementalGroup[] = [
  {
    sourceChapter: "20 · Design Problems",
    domain: "System & algorithm design",
    level: "advanced",
    tags: ["design", "systems", "modeling"],
    titles: [
      "Design a spell checker",
      "Design a solution to the stemming problem",
      "Plagiarism detector",
      "Pair users by attributes",
      "Design a system for detecting copyright infringement",
      "Design T9",
      "Design a search engine",
      "Implement PageRank",
      "Design TeraSort and PetaSort",
      "Implement distributed throttling",
      "Design a scalable priority system",
      "Create photomosaics",
      "Implement Mileage Run",
      "Implement Connexus",
      "Design an online advertising system",
      "Design a recommendation system",
      "Design an optimized way of distributing large files",
      "Design the World Wide Web",
      "Estimate the hardware cost of a photo sharing app",
    ],
  },
  {
    sourceChapter: "21 · Language Questions",
    domain: "Python & language semantics",
    level: "core",
    tags: ["python", "language", "runtime"],
    titles: [
      "Garbage collection",
      "Closure",
      "Shallow and deep copy",
      "Iterators and generators",
      "@decorator",
      "List vs tuple",
      "*args and **kwargs",
      "Python code",
      "Exception handling",
      "Scoping",
      "Function arguments",
    ],
  },
  {
    sourceChapter: "22 · Object-Oriented Design",
    domain: "Object-oriented design",
    level: "advanced",
    tags: ["design", "oop", "patterns"],
    titles: [
      "Template Method vs Strategy",
      "Observer pattern",
      "Push vs pull observer pattern",
      "Singletons and Flyweights",
      "Adapters",
      "Creational patterns",
      "Libraries and design patterns",
    ],
  },
  {
    sourceChapter: "23 · Common Tools",
    domain: "Software tools & infrastructure",
    level: "advanced",
    tags: ["tools", "databases", "networking"],
    titles: [
      "Merging in a version control system",
      "Hooks",
      "Is scripting more efficient?",
      "Polymorphism with a scripting language",
      "Dependency analysis",
      "ANT vs Maven",
      "SQL vs NoSQL",
      "Normalization",
      "SQL design",
      "IP, TCP, and HTTP",
      "HTTPS",
      "DNS",
    ],
  },
];

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export const supplementalCanonicalExercises: CanonicalExercise[] = groups.flatMap((group, groupIndex) =>
  group.titles.map((title, titleIndex) => ({
    id: `epi-domain-${groupIndex + 20}-${titleIndex + 1}-${slugify(title)}`,
    title,
    source: "epi",
    sourceChapter: group.sourceChapter,
    domain: group.domain,
    kind: "design",
    level: group.level,
    tags: group.tags,
    lens: `Treat “${title}” as a decomposition exercise: clarify the objective and constraints, identify the data structures or algorithmic subproblems inside it, then compare designs by the resource that actually matters.`,
  })),
);
