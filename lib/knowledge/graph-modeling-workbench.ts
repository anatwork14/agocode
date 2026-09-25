export type GraphChoice = {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
};

export type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  weight?: string;
};

export type GraphModelingScenario = {
  id: string;
  title: string;
  eyebrow: string;
  story: string;
  modelingQuestion: string;
  vertexChoices: GraphChoice[];
  edgeChoices: GraphChoice[];
  directionChoices: GraphChoice[];
  weightChoices: GraphChoice[];
  algorithmChoices: GraphChoice[];
  modelSummary: {
    vertices: string;
    edges: string;
    graphType: string;
    objective: string;
    algorithm: string;
    reason: string;
  };
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    directed: boolean;
    weighted: boolean;
  };
  transferQuestion: string;
};

const directionChoices = (directed: boolean): GraphChoice[] => [
  {
    id: "directed",
    label: "Directed",
    correct: directed,
    feedback: directed
      ? "Yes. Reversing the relationship changes its meaning, so edge direction carries information."
      : "Direction would add a distinction the relationship does not have in this model.",
  },
  {
    id: "undirected",
    label: "Undirected",
    correct: !directed,
    feedback: !directed
      ? "Yes. The relationship is symmetric for the question we are asking."
      : "This loses information: an edge from u to v does not imply the reverse relationship.",
  },
];

const weightChoices = (weighted: boolean, meaning: string): GraphChoice[] => [
  {
    id: "weighted",
    label: "Weighted",
    correct: weighted,
    feedback: weighted
      ? `Yes. The edge must carry ${meaning}.`
      : "A numeric edge value is not needed to answer this question; connectivity/order is enough.",
  },
  {
    id: "unweighted",
    label: "Unweighted",
    correct: !weighted,
    feedback: !weighted
      ? "Yes. Every edge has the same role, so the graph structure alone carries the information we need."
      : `This throws away ${meaning}, which the objective depends on.`,
  },
];

export const graphModelingScenarios: GraphModelingScenario[] = [
  {
    id: "release-dependencies",
    title: "Release dependencies",
    eyebrow: "Ordering",
    story: "A deployment contains services Atlas, Beacon, Core, Docs, and Edge. Some services must be deployed before others. You need any valid deployment order that respects every dependency.",
    modelingQuestion: "What graph makes the precedence constraints explicit before we choose an algorithm?",
    vertexChoices: [
      { id: "services", label: "One vertex per service", correct: true, feedback: "Yes. The objects being ordered are the natural vertices." },
      { id: "dependencies", label: "One vertex per dependency rule", correct: false, feedback: "That makes each relationship into an object and obscures the ordering between services." },
      { id: "timestamps", label: "One vertex per possible deployment time", correct: false, feedback: "Times are not the entities constrained by the input; the services are." },
    ],
    edgeChoices: [
      { id: "before", label: "u → v means u must deploy before v", correct: true, feedback: "Yes. Each precedence rule becomes one edge." },
      { id: "same-team", label: "Connect services maintained by the same team", correct: false, feedback: "That relationship is not part of the objective and does not encode precedence." },
      { id: "alphabetical", label: "Connect alphabetically adjacent service names", correct: false, feedback: "Alphabetical order is incidental and does not represent the constraints." },
    ],
    directionChoices: directionChoices(true),
    weightChoices: weightChoices(false, "a deployment cost"),
    algorithmChoices: [
      { id: "topological-sort", label: "Topological ordering", correct: true, feedback: "Yes. A valid order is exactly an ordering in which every directed dependency points forward." },
      { id: "dijkstra", label: "Dijkstra shortest path", correct: false, feedback: "There is no path-cost objective here. The task is to satisfy precedence constraints." },
      { id: "mst", label: "Minimum spanning tree", correct: false, feedback: "We are not trying to connect all vertices with minimum total edge weight." },
      { id: "bfs-distance", label: "BFS shortest path", correct: false, feedback: "Reachability alone does not produce a global dependency-respecting order." },
    ],
    modelSummary: {
      vertices: "services",
      edges: "prerequisite → dependent",
      graphType: "directed, unweighted; a valid instance must be acyclic",
      objective: "produce an order that respects every prerequisite edge",
      algorithm: "Topological sort",
      reason: "The application question is already an ordering constraint over a directed dependency graph.",
    },
    graph: {
      directed: true,
      weighted: false,
      nodes: [
        { id: "A", label: "Atlas", x: 60, y: 105 },
        { id: "B", label: "Beacon", x: 190, y: 48 },
        { id: "C", label: "Core", x: 190, y: 162 },
        { id: "D", label: "Docs", x: 330, y: 48 },
        { id: "E", label: "Edge", x: 330, y: 162 },
      ],
      edges: [
        { from: "A", to: "B" },
        { from: "A", to: "C" },
        { from: "B", to: "D" },
        { from: "C", to: "E" },
        { from: "B", to: "E" },
      ],
    },
    transferQuestion: "What should AgoCode conclude if the dependency graph contains a directed cycle?",
  },
  {
    id: "campus-walk",
    title: "Fewest campus hops",
    eyebrow: "Unweighted shortest path",
    story: "Buildings on a campus are connected by covered walkways. Every walkway counts as one hop. Given two buildings, find a route using the fewest walkways.",
    modelingQuestion: "Which model preserves exactly the information needed by the fewest-hop objective?",
    vertexChoices: [
      { id: "buildings", label: "One vertex per building", correct: true, feedback: "Yes. Routes move from building to building." },
      { id: "walkways", label: "One vertex per walkway", correct: false, feedback: "Walkways are the relationships between locations in the natural model." },
      { id: "students", label: "One vertex per student", correct: false, feedback: "Students are not part of the route-state described by the problem." },
    ],
    edgeChoices: [
      { id: "walkway", label: "Connect two buildings when a walkway joins them", correct: true, feedback: "Yes. A graph path then corresponds directly to a legal walking route." },
      { id: "distance", label: "Connect every pair and store straight-line distance", correct: false, feedback: "That invents routes that may not exist and changes the objective." },
      { id: "same-floor", label: "Connect buildings with the same number of floors", correct: false, feedback: "That property does not represent traversable connectivity." },
    ],
    directionChoices: directionChoices(false),
    weightChoices: weightChoices(false, "physical distance"),
    algorithmChoices: [
      { id: "bfs", label: "Breadth-first search", correct: true, feedback: "Yes. In an unweighted graph, BFS discovers vertices in nondecreasing number of edges from the start." },
      { id: "dijkstra", label: "Dijkstra", correct: false, feedback: "It could solve nonnegative weighted shortest paths, but equal-cost edges make BFS the simpler exact fit." },
      { id: "topological", label: "Topological ordering", correct: false, feedback: "The graph can contain cycles and we need a shortest route, not an ordering." },
      { id: "mst", label: "Minimum spanning tree", correct: false, feedback: "An MST optimizes the total cost to connect all vertices, not one pair's hop count." },
    ],
    modelSummary: {
      vertices: "buildings",
      edges: "existing covered walkways",
      graphType: "undirected and unweighted",
      objective: "minimize number of edges between start and destination",
      algorithm: "Breadth-first search",
      reason: "Each edge contributes exactly one hop, so BFS levels are route lengths.",
    },
    graph: {
      directed: false,
      weighted: false,
      nodes: [
        { id: "L", label: "Library", x: 55, y: 105 },
        { id: "S", label: "Science", x: 170, y: 45 },
        { id: "H", label: "Hall", x: 170, y: 165 },
        { id: "G", label: "Gym", x: 300, y: 45 },
        { id: "C", label: "Cafe", x: 300, y: 165 },
      ],
      edges: [
        { from: "L", to: "S" },
        { from: "L", to: "H" },
        { from: "S", to: "G" },
        { from: "S", to: "C" },
        { from: "H", to: "C" },
        { from: "G", to: "C" },
      ],
    },
    transferQuestion: "If each walkway has a different travel time, which part of the model changes and which shortest-path algorithm becomes more appropriate?",
  },
  {
    id: "delivery-time",
    title: "Fastest delivery route",
    eyebrow: "Weighted shortest path",
    story: "A courier can move between neighborhood hubs along two-way streets. Each street has an estimated travel time. Find the minimum-time route from the depot to a customer hub.",
    modelingQuestion: "Which graph choices preserve both legal movement and the quantity being minimized?",
    vertexChoices: [
      { id: "hubs", label: "One vertex per hub", correct: true, feedback: "Yes. The courier's route changes state when it reaches a hub." },
      { id: "minutes", label: "One vertex per possible travel time", correct: false, feedback: "Travel time belongs on transitions, not as the primary route entities." },
      { id: "parcels", label: "One vertex per parcel", correct: false, feedback: "Parcels do not describe the street network in this problem." },
    ],
    edgeChoices: [
      { id: "street", label: "A street becomes an edge between its endpoint hubs", correct: true, feedback: "Yes. A path now corresponds to a legal sequence of streets." },
      { id: "all-pairs", label: "Connect every pair of hubs", correct: false, feedback: "That invents streets that do not exist." },
      { id: "same-zone", label: "Connect hubs sharing a postal zone", correct: false, feedback: "Zone membership does not imply direct travel is possible." },
    ],
    directionChoices: directionChoices(false),
    weightChoices: weightChoices(true, "the estimated travel time for each street"),
    algorithmChoices: [
      { id: "dijkstra", label: "Dijkstra", correct: true, feedback: "Yes. Nonnegative travel times make Dijkstra a direct fit for minimum total path weight." },
      { id: "bfs", label: "Breadth-first search", correct: false, feedback: "BFS minimizes number of edges, not the sum of unequal travel times." },
      { id: "mst", label: "Minimum spanning tree", correct: false, feedback: "An MST optimizes a network-wide connection cost, not a route between one source and destination." },
      { id: "topological", label: "Topological ordering", correct: false, feedback: "Street networks can contain cycles and the goal is minimum cost, not precedence." },
    ],
    modelSummary: {
      vertices: "neighborhood hubs",
      edges: "existing streets",
      graphType: "undirected, weighted with nonnegative travel time",
      objective: "minimize the sum of edge weights from depot to customer",
      algorithm: "Dijkstra's algorithm",
      reason: "The route cost is additive across nonnegative edge weights.",
    },
    graph: {
      directed: false,
      weighted: true,
      nodes: [
        { id: "D", label: "Depot", x: 55, y: 105 },
        { id: "A", label: "A", x: 160, y: 45 },
        { id: "B", label: "B", x: 160, y: 165 },
        { id: "C", label: "C", x: 285, y: 45 },
        { id: "T", label: "Target", x: 350, y: 145 },
      ],
      edges: [
        { from: "D", to: "A", weight: "4" },
        { from: "D", to: "B", weight: "2" },
        { from: "A", to: "C", weight: "3" },
        { from: "B", to: "C", weight: "2" },
        { from: "B", to: "T", weight: "8" },
        { from: "C", to: "T", weight: "2" },
      ],
    },
    transferQuestion: "What assumption fails if a road can contribute a negative cost or reward, and why does that matter for Dijkstra's finalization rule?",
  },
  {
    id: "fiber-network",
    title: "Connect every office cheaply",
    eyebrow: "Spanning structure",
    story: "Several office sites can be linked by candidate fiber runs. Each possible run has an installation cost. Choose enough runs to connect every office while minimizing total installation cost.",
    modelingQuestion: "Why is this not a shortest-path problem even though the graph is weighted?",
    vertexChoices: [
      { id: "sites", label: "One vertex per office site", correct: true, feedback: "Yes. Every site must become connected to the network." },
      { id: "runs", label: "One vertex per candidate fiber run", correct: false, feedback: "The candidate runs naturally become edges between office sites." },
      { id: "costs", label: "One vertex per installation cost", correct: false, feedback: "Cost is an edge attribute, not an entity that must be connected." },
    ],
    edgeChoices: [
      { id: "fiber", label: "Each candidate fiber run is an edge", correct: true, feedback: "Yes. Selecting edges corresponds directly to choosing which runs to install." },
      { id: "complete", label: "Connect every pair whether or not a run is possible", correct: false, feedback: "That adds unavailable construction choices." },
      { id: "nearest", label: "Only keep each site's single nearest neighbor", correct: false, feedback: "Discarding candidate edges before optimization can destroy the optimum network." },
    ],
    directionChoices: directionChoices(false),
    weightChoices: weightChoices(true, "the installation cost of a candidate fiber run"),
    algorithmChoices: [
      { id: "mst", label: "Minimum spanning tree", correct: true, feedback: "Yes. The objective is minimum total selected edge weight while connecting every vertex." },
      { id: "dijkstra", label: "Dijkstra", correct: false, feedback: "Dijkstra minimizes path distance from a source; it does not minimize the total cost of a network connecting everyone." },
      { id: "bfs", label: "BFS", correct: false, feedback: "BFS ignores unequal installation costs." },
      { id: "topological", label: "Topological ordering", correct: false, feedback: "There are no precedence constraints to order." },
    ],
    modelSummary: {
      vertices: "office sites",
      edges: "candidate fiber runs",
      graphType: "undirected and weighted by installation cost",
      objective: "connect every vertex while minimizing the total weight of selected edges",
      algorithm: "Minimum spanning tree (Prim or Kruskal)",
      reason: "The cost belongs to the selected network as a whole, not to a single source-destination route.",
    },
    graph: {
      directed: false,
      weighted: true,
      nodes: [
        { id: "A", label: "A", x: 65, y: 65 },
        { id: "B", label: "B", x: 65, y: 165 },
        { id: "C", label: "C", x: 205, y: 40 },
        { id: "D", label: "D", x: 205, y: 180 },
        { id: "E", label: "E", x: 345, y: 110 },
      ],
      edges: [
        { from: "A", to: "B", weight: "4" },
        { from: "A", to: "C", weight: "2" },
        { from: "B", to: "D", weight: "3" },
        { from: "C", to: "D", weight: "5" },
        { from: "C", to: "E", weight: "6" },
        { from: "D", to: "E", weight: "1" },
      ],
    },
    transferQuestion: "If the task changes to minimizing the connection cost from office A to office E only, why does the target algorithm family change?",
  },
];

export function getGraphModelingScenario(id: string) {
  return graphModelingScenarios.find((scenario) => scenario.id === id);
}
