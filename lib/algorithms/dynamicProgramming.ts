export type KnapsackItem = {
  id: string;
  label: string;
  weight: number;
  value: number;
};

export type KnapsackCell = {
  value: number;
  itemIds: string[];
  decision: "carry" | "take";
  withoutItem: number;
  withItem: number | null;
};

export type KnapsackFrame = {
  row: number;
  capacity: number;
  item: KnapsackItem;
  cell: KnapsackCell;
  note: string;
};

export type KnapsackResult = {
  capacity: number;
  items: KnapsackItem[];
  grid: KnapsackCell[][];
  frames: KnapsackFrame[];
  bestValue: number;
  selectedItemIds: string[];
};

function validateKnapsack(items: readonly KnapsackItem[], capacity: number) {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new Error("Knapsack capacity must be a positive integer for this teaching grid.");
  }

  for (const item of items) {
    if (!Number.isInteger(item.weight) || item.weight < 1) {
      throw new Error("Item weights must be positive integers for this teaching grid.");
    }
    if (!Number.isFinite(item.value) || item.value < 0) {
      throw new Error("Item values must be finite and non-negative.");
    }
  }
}

export function buildKnapsackGrid(items: readonly KnapsackItem[], capacity: number): KnapsackResult {
  validateKnapsack(items, capacity);

  const zeroRow: KnapsackCell[] = Array.from({ length: capacity + 1 }, () => ({
    value: 0,
    itemIds: [],
    decision: "carry" as const,
    withoutItem: 0,
    withItem: null,
  }));

  const fullGrid: KnapsackCell[][] = [zeroRow];
  const frames: KnapsackFrame[] = [];

  items.forEach((item, itemIndex) => {
    const previous = fullGrid[itemIndex];
    const row: KnapsackCell[] = [zeroRow[0]];

    for (let currentCapacity = 1; currentCapacity <= capacity; currentCapacity += 1) {
      const withoutItem = previous[currentCapacity].value;
      const fits = item.weight <= currentCapacity;
      const remainder = currentCapacity - item.weight;
      const withItem = fits ? item.value + previous[remainder].value : null;
      const take = withItem !== null && withItem > withoutItem;
      const itemIds = take ? [...previous[remainder].itemIds, item.id] : [...previous[currentCapacity].itemIds];
      const cell: KnapsackCell = {
        value: take ? withItem : withoutItem,
        itemIds,
        decision: take ? "take" : "carry",
        withoutItem,
        withItem,
      };

      row.push(cell);
      frames.push({
        row: itemIndex,
        capacity: currentCapacity,
        item,
        cell,
        note: fits
          ? take
            ? `${item.label} fits. Taking it plus the best solution for the ${remainder}-unit remainder improves ${withoutItem} to ${withItem}.`
            : `${item.label} fits, but taking it would produce ${withItem}; keeping the previous best ${withoutItem} is at least as good.`
          : `${item.label} needs ${item.weight} units, so it cannot fit in capacity ${currentCapacity}. Carry the previous best value forward.`,
      });
    }

    fullGrid.push(row);
  });

  const grid = fullGrid.slice(1);
  const finalCell = fullGrid.at(-1)?.[capacity] ?? zeroRow[capacity];

  return {
    capacity,
    items: [...items],
    grid,
    frames,
    bestValue: finalCell.value,
    selectedItemIds: [...finalCell.itemIds],
  };
}

export type SequenceDpMode = "substring" | "subsequence";

export type SequenceCell = {
  value: number;
  source: "diagonal" | "up" | "left" | "reset";
};

export type SequenceDpResult = {
  mode: SequenceDpMode;
  a: string;
  b: string;
  grid: SequenceCell[][];
  bestLength: number;
  bestValue: string;
  bestCell: { row: number; column: number } | null;
};

export function buildSequenceGrid(a: string, b: string, mode: SequenceDpMode): SequenceDpResult {
  const rows = a.length + 1;
  const columns = b.length + 1;
  const values: number[][] = Array.from({ length: rows }, () => Array(columns).fill(0));
  const sources: SequenceCell["source"][][] = Array.from({ length: rows }, () => Array(columns).fill("reset"));

  let bestLength = 0;
  let bestCell: { row: number; column: number } | null = null;

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      if (a[row - 1] === b[column - 1]) {
        values[row][column] = values[row - 1][column - 1] + 1;
        sources[row][column] = "diagonal";
      } else if (mode === "substring") {
        values[row][column] = 0;
        sources[row][column] = "reset";
      } else if (values[row - 1][column] >= values[row][column - 1]) {
        values[row][column] = values[row - 1][column];
        sources[row][column] = "up";
      } else {
        values[row][column] = values[row][column - 1];
        sources[row][column] = "left";
      }

      if (mode === "substring" && values[row][column] > bestLength) {
        bestLength = values[row][column];
        bestCell = { row: row - 1, column: column - 1 };
      }
    }
  }

  if (mode === "subsequence") {
    bestLength = values[a.length][b.length];
    bestCell = a.length && b.length ? { row: a.length - 1, column: b.length - 1 } : null;
  }

  let bestValue = "";
  if (mode === "substring" && bestCell && bestLength > 0) {
    bestValue = a.slice(bestCell.row - bestLength + 1, bestCell.row + 1);
  }

  if (mode === "subsequence" && bestLength > 0) {
    const letters: string[] = [];
    let row = a.length;
    let column = b.length;
    while (row > 0 && column > 0) {
      if (a[row - 1] === b[column - 1]) {
        letters.push(a[row - 1]);
        row -= 1;
        column -= 1;
      } else if (values[row - 1][column] >= values[row][column - 1]) {
        row -= 1;
      } else {
        column -= 1;
      }
    }
    bestValue = letters.reverse().join("");
  }

  const grid = values.slice(1).map((rowValues, rowIndex) =>
    rowValues.slice(1).map((value, columnIndex) => ({
      value,
      source: sources[rowIndex + 1][columnIndex + 1],
    })),
  );

  return { mode, a, b, grid, bestLength, bestValue, bestCell };
}
