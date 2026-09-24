export type Chapter = {
  number: number;
  title: string;
  topics: string[];
  status: "active" | "planned";
};

export const chapters: Chapter[] = [
  { number: 1, title: "Introduction to algorithms", topics: ["Binary search", "Running time", "Big O notation", "Traveling salesperson"], status: "active" },
  { number: 2, title: "Selection sort", topics: ["Memory", "Arrays and linked lists", "Selection sort"], status: "active" },
  { number: 3, title: "Recursion", topics: ["Base case", "Recursive case", "Stack", "Call stack"], status: "active" },
  { number: 4, title: "Quicksort", topics: ["Divide & conquer", "Quicksort", "Average vs. worst case"], status: "active" },
  { number: 5, title: "Hash tables", topics: ["Hash functions", "Lookups", "Duplicate filtering", "Caching", "Collisions", "Load factor"], status: "active" },
  { number: 6, title: "Breadth-first search", topics: ["Graphs", "Directed vs. undirected", "Queues", "Shortest unweighted path", "Visited state", "O(V + E)"], status: "active" },
  { number: 7, title: "Dijkstra’s algorithm", topics: ["Weighted graphs", "Cheapest node", "Relaxation", "Parents", "Negative edges", "Implementation"], status: "active" },
  { number: 8, title: "Greedy algorithms", topics: ["Interval scheduling", "Local choice", "Knapsack counterexample", "Set cover", "Approximation", "Hard combinatorial search"], status: "active" },
  { number: 9, title: "Dynamic programming", topics: ["Knapsack", "DP grid", "Subproblems", "Grid granularity", "Longest common substring", "Longest common subsequence"], status: "active" },
  { number: 10, title: "K-nearest neighbors", topics: ["Classification", "Feature extraction", "Euclidean distance", "Regression", "Choosing k", "Feature quality"], status: "active" },
  { number: 11, title: "Where to go next", topics: ["Trees", "Inverted indexes", "Fourier transform", "Parallel algorithms", "MapReduce", "Bloom filters", "Hash families", "Linear programming"], status: "active" },
];
