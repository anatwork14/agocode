export type GoodrichExerciseTier = "R" | "C" | "P";

export type GoodrichExerciseRef = {
  id: string;
  sourceId: string;
  chapter: number;
  chapterTitle: string;
  tier: GoodrichExerciseTier;
  tierLabel: string;
  number: number;
};

type TierRange = readonly [GoodrichExerciseTier, number, number];

type ChapterExerciseIndex = {
  chapter: number;
  title: string;
  ranges: readonly TierRange[];
};

export const goodrichTierLabels: Record<GoodrichExerciseTier, string> = {
  R: "Reinforcement",
  C: "Creativity",
  P: "Projects",
};

// The source book numbers exercises continuously within a chapter while changing
// the prefix when the pedagogical tier changes. We store only identifiers and
// chapter/tier metadata here; the copyrighted problem statements remain in the book.
export const goodrichExerciseIndex: readonly ChapterExerciseIndex[] = [
  { chapter: 1, title: "Python Primer", ranges: [["R", 1, 12], ["C", 13, 28], ["P", 29, 36]] },
  { chapter: 2, title: "Object-Oriented Programming", ranges: [["R", 1, 23], ["C", 24, 32], ["P", 33, 39]] },
  { chapter: 3, title: "Algorithm Analysis", ranges: [["R", 1, 34], ["C", 35, 54], ["P", 55, 58]] },
  { chapter: 4, title: "Recursion", ranges: [["R", 1, 8], ["C", 9, 22], ["P", 23, 27]] },
  { chapter: 5, title: "Array-Based Sequences", ranges: [["R", 1, 12], ["C", 13, 31], ["P", 32, 37]] },
  { chapter: 6, title: "Stacks, Queues, and Deques", ranges: [["R", 1, 14], ["C", 15, 31], ["P", 32, 37]] },
  { chapter: 7, title: "Linked Lists", ranges: [["R", 1, 23], ["C", 24, 43], ["P", 44, 47]] },
  { chapter: 8, title: "Trees", ranges: [["R", 1, 30], ["C", 31, 63], ["P", 64, 70]] },
  { chapter: 9, title: "Priority Queues", ranges: [["R", 1, 25], ["C", 26, 52], ["P", 53, 58]] },
  { chapter: 10, title: "Maps, Hash Tables, and Skip Lists", ranges: [["R", 1, 27], ["C", 28, 49], ["P", 50, 55]] },
  { chapter: 11, title: "Search Trees", ranges: [["R", 1, 28], ["C", 29, 60], ["P", 61, 70]] },
  { chapter: 12, title: "Sorting and Selection", ranges: [["R", 1, 24], ["C", 25, 55], ["P", 56, 62]] },
  { chapter: 13, title: "Text Processing", ranges: [["R", 1, 14], ["C", 15, 45], ["P", 46, 57]] },
  { chapter: 14, title: "Graph Algorithms", ranges: [["R", 1, 36], ["C", 37, 73], ["P", 74, 81]] },
  { chapter: 15, title: "Memory Management and B-Trees", ranges: [["R", 1, 8], ["C", 9, 21], ["P", 22, 24]] },
] as const;

export const goodrichExerciseReferences: GoodrichExerciseRef[] = goodrichExerciseIndex.flatMap((chapter) =>
  chapter.ranges.flatMap(([tier, start, end]) =>
    Array.from({ length: end - start + 1 }, (_, offset) => {
      const number = start + offset;
      const sourceId = `${tier}-${chapter.chapter}.${number}`;
      return {
        id: `goodrich-${tier.toLowerCase()}-${chapter.chapter}-${number}`,
        sourceId,
        chapter: chapter.chapter,
        chapterTitle: chapter.title,
        tier,
        tierLabel: goodrichTierLabels[tier],
        number,
      };
    }),
  ),
);

export const goodrichExerciseCount = goodrichExerciseReferences.length;

export function getGoodrichExerciseRef(id: string) {
  return goodrichExerciseReferences.find((exercise) => exercise.id === id);
}
