export type BstNode = {
  value: string;
  left?: BstNode;
  right?: BstNode;
};

export type BstSearchStep = {
  value: string;
  comparison: "found" | "left" | "right";
};

export function traceBstSearch(root: BstNode | undefined, target: string): BstSearchStep[] {
  const steps: BstSearchStep[] = [];
  let current = root;
  while (current) {
    if (target === current.value) {
      steps.push({ value: current.value, comparison: "found" });
      return steps;
    }
    if (target < current.value) {
      steps.push({ value: current.value, comparison: "left" });
      current = current.left;
    } else {
      steps.push({ value: current.value, comparison: "right" });
      current = current.right;
    }
  }
  return steps;
}

export type InvertedIndex = Record<string, string[]>;

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function buildInvertedIndex(documents: Record<string, string>): InvertedIndex {
  const index = new Map<string, Set<string>>();
  for (const [documentId, text] of Object.entries(documents)) {
    for (const token of new Set(tokenize(text))) {
      const locations = index.get(token) ?? new Set<string>();
      locations.add(documentId);
      index.set(token, locations);
    }
  }
  return Object.fromEntries([...index.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([term, locations]) => [term, [...locations].sort()]));
}

export function searchInvertedIndex(index: InvertedIndex, term: string) {
  return index[term.toLowerCase()] ?? [];
}

export type MapPair = { key: string; value: number };

export function mapWords(lines: readonly string[]): MapPair[] {
  return lines.flatMap((line) => tokenize(line).map((word) => ({ key: word, value: 1 })));
}

export function reduceWordCounts(pairs: readonly MapPair[]) {
  const totals: Record<string, number> = {};
  for (const pair of pairs) totals[pair.key] = (totals[pair.key] ?? 0) + pair.value;
  return Object.fromEntries(Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)));
}

function hashOne(value: string, size: number) {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) % size;
  return hash;
}

function hashTwo(value: string, size: number) {
  let hash = 7;
  for (const character of value) hash = (hash * 17 + character.charCodeAt(0) * 3) % size;
  return hash;
}

export type BloomState = {
  bits: boolean[];
  inserted: string[];
};

export function buildBloomFilter(values: readonly string[], size = 16): BloomState {
  if (!Number.isInteger(size) || size < 2) throw new Error("Bloom filter size must be an integer of at least 2.");
  const bits = Array<boolean>(size).fill(false);
  for (const value of values) {
    bits[hashOne(value, size)] = true;
    bits[hashTwo(value, size)] = true;
  }
  return { bits, inserted: [...values] };
}

export function bloomMightContain(state: BloomState, value: string) {
  const size = state.bits.length;
  return state.bits[hashOne(value, size)] && state.bits[hashTwo(value, size)];
}

export function bloomBitPositions(value: string, size: number) {
  return [hashOne(value, size), hashTwo(value, size)];
}
