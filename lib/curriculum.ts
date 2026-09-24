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
  { number: 7, title: "Dijkstra’s algorithm", topics: ["Weighted graphs", "Relaxation", "Negative edges", "Implementation"], status: "planned" },
  { number: 8, title: "Greedy algorithms", topics: ["Scheduling", "Knapsack intuition", "Set cover", "Approximation"], status: "planned" },
  { number: 9, title: "Dynamic programming", topics: ["Knapsack", "DP grid", "Subproblems", "Sequence problems"], status: "planned" },
  { number: 10, title: "K-nearest neighbors", topics: ["Classification", "Features", "Regression", "Distance"], status: "planned" },
  { number: 11, title: "Where to go next", topics: ["Trees", "Inverted indexes", "MapReduce", "Bloom filters", "Linear programming"], status: "planned" },
];
