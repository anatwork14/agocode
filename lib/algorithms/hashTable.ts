export type HashEntry<T = string> = {
  key: string;
  value: T;
};

export type HashBucket<T = string> = HashEntry<T>[];

export type HashTableSnapshot<T = string> = {
  capacity: number;
  buckets: HashBucket<T>[];
  size: number;
  loadFactor: number;
  collisions: number;
  longestChain: number;
};

export type HashStep = {
  character: string;
  codePoint: number;
  previous: number;
  next: number;
};

function assertCapacity(capacity: number) {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new Error("capacity must be a positive integer");
  }
}

export function traceEducationalHash(key: string, capacity: number): HashStep[] {
  assertCapacity(capacity);
  const steps: HashStep[] = [];
  let hash = 0;

  for (const character of key.toLowerCase()) {
    const codePoint = character.codePointAt(0)!;
    const previous = hash;
    hash = (hash * 31 + codePoint) % capacity;
    steps.push({ character, codePoint, previous, next: hash });
  }

  return steps;
}

export function educationalHash(key: string, capacity: number): number {
  const steps = traceEducationalHash(key, capacity);
  return steps.at(-1)?.next ?? 0;
}

export function buildHashTable<T>(entries: readonly HashEntry<T>[], capacity: number): HashTableSnapshot<T> {
  assertCapacity(capacity);
  const buckets: HashBucket<T>[] = Array.from({ length: capacity }, () => []);
  let collisions = 0;

  for (const entry of entries) {
    const index = educationalHash(entry.key, capacity);
    const bucket = buckets[index];
    const existingIndex = bucket.findIndex((candidate) => candidate.key === entry.key);

    if (existingIndex >= 0) {
      bucket[existingIndex] = { ...entry };
    } else {
      if (bucket.length > 0) collisions += 1;
      bucket.push({ ...entry });
    }
  }

  const size = buckets.reduce((total, bucket) => total + bucket.length, 0);
  const longestChain = Math.max(0, ...buckets.map((bucket) => bucket.length));

  return {
    capacity,
    buckets,
    size,
    loadFactor: size / capacity,
    collisions,
    longestChain,
  };
}

export function lookupHashTable<T>(snapshot: HashTableSnapshot<T>, key: string): HashEntry<T> | null {
  const index = educationalHash(key, snapshot.capacity);
  return snapshot.buckets[index].find((entry) => entry.key === key) ?? null;
}

export function rehashTable<T>(snapshot: HashTableSnapshot<T>, nextCapacity: number): HashTableSnapshot<T> {
  const entries = snapshot.buckets.flatMap((bucket) => bucket);
  return buildHashTable(entries, nextCapacity);
}
