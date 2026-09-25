export type CaseStageKind = "request" | "baseline" | "model" | "failure" | "pivot" | "design" | "verification" | "postmortem";

export type CaseStage = {
  id: string;
  kind: CaseStageKind;
  title: string;
  question: string;
  body: string[];
  evidence?: string[];
};

export type CasePredictionChoice = {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
};

export type AlgorithmCaseStudy = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  domain: string;
  scale: string;
  constraints: string[];
  concepts: string[];
  thesis: string;
  prediction: {
    prompt: string;
    choices: CasePredictionChoice[];
  };
  stages: CaseStage[];
  finalDesign: string[];
  transferQuestions: string[];
};

export const caseStudies: AlgorithmCaseStudy[] = [
  {
    slug: "campus-shuttle-routing",
    number: "01",
    title: "The campus shuttle that optimized the wrong graph problem",
    subtitle: "Shortest path is not minimum spanning tree, and a correct graph model comes before the data structure.",
    domain: "Mobility · routing",
    scale: "4,000 road segments · frequent ETA queries",
    constraints: ["Road travel times are non-negative", "Routes are directed in some streets", "The fleet needs a route, not a network build plan"],
    concepts: ["graph modeling", "Dijkstra", "shortest path", "MST distinction", "priority queue"],
    thesis: "The decisive step was not making Dijkstra faster. It was realizing that the team's first graph objective answered a different question from the product requirement.",
    prediction: {
      prompt: "The shuttle team says: ‘connect every stop using as little total road cost as possible.’ What should you challenge first?",
      choices: [
        {
          id: "heap",
          label: "Which heap implementation to use",
          correct: false,
          feedback: "That is tactical. A faster priority queue cannot repair the wrong optimization objective.",
        },
        {
          id: "objective",
          label: "Whether ‘connect all stops cheaply’ matches ‘find the fastest route for one trip’",
          correct: true,
          feedback: "Yes. Minimum total network cost and minimum source-to-destination route cost are different graph problems.",
        },
        {
          id: "language",
          label: "Whether to rewrite the service in another language",
          correct: false,
          feedback: "Implementation language may matter later, but the primary risk is conceptual mismatch.",
        },
      ],
    },
    stages: [
      {
        id: "request",
        kind: "request",
        title: "Raw request",
        question: "What does the user actually need returned?",
        body: [
          "A university shuttle dashboard needs the fastest route between a driver's current stop and a requested destination. Roads have different travel times and some streets are one-way.",
          "The first design note says: ‘Build the cheapest tree connecting all stops, then route along the tree.’ That sounds graph-like, but it silently changes the objective.",
        ],
        evidence: ["Input: road network + source + destination", "Output: one minimum-travel-time route", "Repeated query workload"],
      },
      {
        id: "baseline",
        kind: "baseline",
        title: "Baseline",
        question: "What simple method establishes correctness before optimization?",
        body: [
          "On a tiny map, enumerate simple source-to-destination paths and compute each path's total travel time. This is not scalable, but it creates an oracle for small tests.",
          "The baseline also makes the objective explicit: compare path totals, not the total cost of edges used to connect every vertex.",
        ],
      },
      {
        id: "model",
        kind: "model",
        title: "Model the application",
        question: "What do vertices, edges, direction, and weights mean?",
        body: [
          "Intersections/stops become vertices. A traversable road segment becomes a directed edge. Current estimated travel time becomes a non-negative edge weight.",
          "The product asks for a minimum-weight path from one source to one destination. It does not ask for a minimum-cost structure spanning all stops.",
        ],
      },
      {
        id: "failure",
        kind: "failure",
        title: "Rejected approach: minimum spanning tree",
        question: "Why exactly does the plausible approach fail?",
        body: [
          "A minimum spanning tree minimizes the sum of edges required to connect all vertices. It does not preserve the shortest route between arbitrary pairs.",
          "Removing an apparently redundant road can lower total network cost while forcing an individual shuttle to take a longer detour. The approach is rejected with a reason, not because MST is ‘bad.’",
        ],
        evidence: ["MST objective: cheap global connectivity", "Product objective: cheap one-trip route", "Same graph, different optimization target"],
      },
      {
        id: "pivot",
        kind: "pivot",
        title: "Pivot to shortest paths",
        question: "Which assumption makes a standard shortest-path method safe?",
        body: [
          "Travel-time weights are non-negative, so Dijkstra's algorithm is a natural fit. The frontier can be ordered by tentative distance, and the smallest unsettled distance can be finalized safely under this assumption.",
        ],
      },
      {
        id: "design",
        kind: "design",
        title: "Choose representation after the model",
        question: "Which representation matches a sparse road network and repeated minimum extraction?",
        body: [
          "Use adjacency lists for outgoing roads and a min-priority queue for the frontier. Parent links reconstruct the actual route after the destination is finalized.",
          "The heap is a tactic that follows from the shortest-path strategy; it was not the first design decision.",
        ],
      },
      {
        id: "verification",
        kind: "verification",
        title: "Verify the reasoning, not only examples",
        question: "What should tests attack?",
        body: [
          "Compare against exhaustive enumeration on tiny graphs. Test one-way edges, disconnected destinations, equal-cost routes, a direct expensive edge versus a longer cheap route, and stale queue entries.",
          "Also add a negative-edge test that is rejected by the input contract, because that assumption is part of correctness.",
        ],
      },
      {
        id: "postmortem",
        kind: "postmortem",
        title: "Postmortem",
        question: "What knowledge transfers to the next project?",
        body: [
          "Graph terminology is not enough. The objective determines the problem family. Ask whether you need reachability, fewest edges, minimum cost, global connectivity, ordering, or flow before choosing the algorithm.",
        ],
      },
    ],
    finalDesign: ["Directed weighted graph", "Adjacency-list representation", "Dijkstra under non-negative weights", "Min-priority queue frontier", "Parent map for route reconstruction"],
    transferQuestions: ["How would the design change if all travel times were exactly one?", "What if edge weights could temporarily become negative after a pricing adjustment?", "When would an MST actually be the right objective for a transportation project?"],
  },
  {
    slug: "duplicate-report-triage",
    number: "02",
    title: "The moderation queue drowning in duplicate reports",
    subtitle: "Summarize repeated raw events first, then use a priority structure only for the remaining question.",
    domain: "Trust & safety · streaming",
    scale: "2 million reports/day · top 100 incidents refreshed continuously",
    constraints: ["Many reports refer to the same incident", "Top incidents change over time", "The UI needs ranking, not a full sort of all raw events"],
    concepts: ["hash maps", "priority queues", "streaming", "top-k", "two-stage transformation"],
    thesis: "The performance improvement came from changing the unit of computation from raw reports to incident summaries before ranking anything.",
    prediction: {
      prompt: "Which repeated work should be removed first?",
      choices: [
        { id: "sort-all", label: "Repeatedly sort every raw report by timestamp", correct: false, feedback: "Timestamp order does not remove duplicate counting work." },
        { id: "recount", label: "Rescanning all reports every refresh to recount each incident", correct: true, feedback: "Yes. Summarize counts incrementally so refreshes operate on incidents, not the entire raw stream." },
        { id: "css", label: "Render fewer table rows", correct: false, feedback: "UI work is downstream; the algorithmic waste is repeated aggregation." },
      ],
    },
    stages: [
      {
        id: "request",
        kind: "request",
        title: "Raw request",
        question: "What is the real entity being ranked?",
        body: ["A safety dashboard receives individual user reports, but moderators act on incidents. Thousands of raw reports can describe one incident.", "The first implementation recomputes counts from the raw log and sorts all incident counts every dashboard refresh."],
      },
      {
        id: "baseline",
        kind: "baseline",
        title: "Baseline",
        question: "Which slow method is obviously correct?",
        body: ["Group all reports by incident identifier, count each group, sort the resulting incidents by count, and take the first 100. This establishes the target behavior."],
      },
      {
        id: "failure",
        kind: "failure",
        title: "Name the waste",
        question: "Which work is repeated between refreshes?",
        body: ["Historical reports do not change, yet every refresh scans them again. The system repeatedly reconstructs information that could be maintained as events arrive."],
      },
      {
        id: "pivot",
        kind: "pivot",
        title: "Transform raw events into state",
        question: "Which data structure matches exact keyed updates?",
        body: ["Maintain a hash map from incident id to current count and metadata. Each incoming report updates one summary in expected constant time."],
      },
      {
        id: "design",
        kind: "design",
        title: "Rank only what must be ranked",
        question: "Do we need a total order or only top k?",
        body: ["For periodic snapshots, feed incident summaries into a size-100 min-heap. This avoids fully sorting all distinct incidents when k is tiny relative to the number of incidents.", "If update frequency or query semantics change, another design—such as an indexed ordered store—may become preferable. The abstraction follows the workload."],
      },
      {
        id: "verification",
        kind: "verification",
        title: "Verification",
        question: "Which inputs stress the model?",
        body: ["Test one enormous duplicate cluster, all unique reports, ties at the top-k boundary, late updates to an existing incident, and k larger than the number of incidents."],
      },
      {
        id: "postmortem",
        kind: "postmortem",
        title: "Postmortem",
        question: "What was the key transformation?",
        body: ["The decisive move was summarize first, prioritize second. Hashing solved keyed aggregation; the heap solved partial ranking. One structure did not need to solve the entire problem."],
      },
    ],
    finalDesign: ["Incident-id → summary hash map", "Incremental count updates", "Top-k min-heap for snapshots", "Explicit tie policy", "Raw event log retained separately for audit"],
    transferQuestions: ["What changes if counts decay over time?", "What if moderators need the full ranking rather than top 100?", "What if incident IDs are not reliable and reports must first be clustered?"],
  },
  {
    slug: "room-booking-capacity",
    number: "03",
    title: "The booking service that compared every reservation with every other reservation",
    subtitle: "Sorting transforms interval conflicts into a sweep over ordered events.",
    domain: "Scheduling · reservations",
    scale: "100,000 bookings/day · hundreds of rooms",
    constraints: ["Bookings have start/end times", "Rooms are interchangeable within a type", "Need minimum simultaneous capacity"],
    concepts: ["intervals", "sorting", "sweep line", "priority queue", "events"],
    thesis: "The service stopped treating overlap as an all-pairs relation and instead represented each booking as ordered boundary events.",
    prediction: {
      prompt: "What does sorting buy us in an interval-capacity problem?",
      choices: [
        { id: "constant", label: "It makes every operation O(1)", correct: false, feedback: "Sorting has a cost; its value is structural, not magical constant time." },
        { id: "local", label: "It gives a chronological order in which occupancy changes can be processed once", correct: true, feedback: "Yes. The global overlap relation becomes a one-pass state update over ordered boundaries." },
        { id: "hash", label: "It removes the need to represent start and end times", correct: false, feedback: "The boundaries are exactly the information the sweep needs." },
      ],
    },
    stages: [
      { id: "request", kind: "request", title: "Raw request", question: "What output is required?", body: ["The service must determine how many interchangeable rooms are required so all accepted bookings can run without conflict.", "The prototype checks every booking pair for overlap and builds conflict sets."] },
      { id: "baseline", kind: "baseline", title: "Baseline", question: "What obvious method can verify small cases?", body: ["For every pair, test whether their intervals overlap, then brute-force small room assignments. Correct enough for a tiny oracle, unusable at production scale."] },
      { id: "model", kind: "model", title: "Choose the right state", question: "Do we need pair identities or only concurrent count?", body: ["For minimum required capacity, the key state is how many bookings are active at each time—not the entire conflict graph."] },
      { id: "pivot", kind: "pivot", title: "Transform intervals into boundary events", question: "What changes at each boundary?", body: ["Turn each booking into a start event (+1) and end event (-1), sort events by time, and sweep once while maintaining active count and maximum active count.", "Tie handling is part of the model: whether a booking ending at 10:00 frees a room for another starting at 10:00 must be specified before ordering equal-time events."] },
      { id: "design", kind: "design", title: "Alternative when assignments matter", question: "What if the service must return actual room assignments too?", body: ["Sort bookings by start time and use a min-heap keyed by each occupied room's next free time. Reuse the earliest-free room when possible; otherwise allocate a new one.", "The event sweep answers capacity; the heap-based sweep can also construct an assignment. Same domain, different output requirement."] },
      { id: "verification", kind: "verification", title: "Verification", question: "Which edge cases encode business semantics?", body: ["Test nested intervals, many identical start times, zero-length bookings if allowed, back-to-back bookings, one long booking crossing many short ones, and timezone-normalized boundaries."] },
      { id: "postmortem", kind: "postmortem", title: "Postmortem", question: "What transferred?", body: ["Sorting was not the answer by itself. It created an execution order in which a tiny amount of state—active count or earliest release time—was sufficient."] },
    ],
    finalDesign: ["Normalize intervals", "Sort boundary events for capacity", "Explicit equal-time tie rule", "Optional min-heap for concrete room assignment", "Brute-force oracle for tiny test fixtures"],
    transferQuestions: ["How does the design change if rooms have different capacities or equipment?", "What if bookings can be canceled online?", "Which formulation would you choose to find the maximum number of bookings accepted by one room?"],
  },
  {
    slug: "dependency-build-order",
    number: "04",
    title: "The release pipeline that treated dependencies as timestamps",
    subtitle: "A dependency is a partial order; graph structure is more important than the original file order.",
    domain: "Developer infrastructure · builds",
    scale: "20,000 build targets · sparse dependency graph",
    constraints: ["A target can depend on many others", "Cycles are invalid", "Independent targets may build concurrently"],
    concepts: ["DAG", "topological sort", "cycle detection", "graph modeling", "parallelism"],
    thesis: "The build system became simpler after replacing ‘find a good timestamp order’ with the actual abstraction: produce any linear extension of a dependency partial order.",
    prediction: {
      prompt: "Which condition must every valid build order satisfy?",
      choices: [
        { id: "alphabetical", label: "Targets are alphabetically ordered", correct: false, feedback: "Names are incidental to the dependency relation." },
        { id: "dependency", label: "Every prerequisite appears before every target that depends on it", correct: true, feedback: "Yes. This is exactly the ordering constraint captured by a topological order." },
        { id: "shortest", label: "The total number of dependency edges is minimized", correct: false, feedback: "Edges are given requirements; ordering does not minimize their count." },
      ],
    },
    stages: [
      { id: "request", kind: "request", title: "Raw request", question: "What relationship controls legality?", body: ["A release system receives build targets and dependency declarations. The old implementation repeatedly scans the input list, moving targets later when a missing prerequisite is discovered.", "It works on small files but becomes unpredictable and provides poor diagnostics for cycles."] },
      { id: "baseline", kind: "baseline", title: "Baseline", question: "How can tiny instances expose the rule?", body: ["Enumerate permutations of a few targets and retain those in which every prerequisite precedes its dependent. This is exponential, but it makes validity precise."] },
      { id: "model", kind: "model", title: "Model as a directed graph", question: "What does an edge mean?", body: ["Represent each target as a vertex and each prerequisite relation as a directed edge prerequisite → dependent. A valid build sequence is a topological ordering of this graph."] },
      { id: "failure", kind: "failure", title: "Rejected approach: sort by number of dependencies once", question: "Why can a simple score fail?", body: ["Two targets can have equal dependency counts but very different prerequisite chains. A static score does not guarantee all incoming prerequisites have been satisfied when a target is emitted."] },
      { id: "pivot", kind: "pivot", title: "Use the graph invariant", question: "What can be emitted safely?", body: ["Maintain indegrees and a queue of currently zero-indegree targets. Emitting one target removes its outgoing constraints; newly zero-indegree targets become available.", "If fewer than V targets are emitted, a cycle prevents completion and should be reported as an invalid dependency graph."] },
      { id: "design", kind: "design", title: "Expose parallelism", question: "What else does the same model give us?", body: ["All currently zero-indegree targets form an available frontier. A scheduler can execute independent targets concurrently while preserving the same dependency invariant."] },
      { id: "verification", kind: "verification", title: "Verification", question: "What should fail loudly?", body: ["Test a chain, a diamond, many independent targets, duplicate declarations, self-dependency, and a multi-node cycle. Verify every emitted order respects every edge rather than comparing with one expected sequence."] },
      { id: "postmortem", kind: "postmortem", title: "Postmortem", question: "What changed conceptually?", body: ["The problem was never about finding a clever total sort key. Dependencies define a partial order, and topological sorting is the operation that extends it into a valid sequence."] },
    ],
    finalDesign: ["Directed dependency graph", "Indegree table", "Zero-indegree frontier", "Topological ordering", "Cycle detection from incomplete emission", "Parallel execution from frontier batches"],
    transferQuestions: ["How would you choose among several ready targets if build duration matters?", "What changes if dependencies are added while a build is already running?", "Which graph direction makes diagnostic explanations easiest?"],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((item) => item.slug === slug);
}
