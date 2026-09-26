import type { InvariantScenario } from "./invariant-workbench.ts";

export const extendedInvariantScenarios: InvariantScenario[] = [
  {
    id: "bfs-discovery",
    label: "BFS discovery",
    algorithm: "Explore an unweighted graph in FIFO order, marking a vertex when it is first discovered and recording its parent and distance.",
    question: "Which statement explains why the first discovered distance to each reachable vertex is a shortest-path distance?",
    claims: [
      {
        id: "layer-frontier",
        text: "Every discovered vertex has a valid path from the start of its recorded distance, and the queue exposes undispatched vertices in nondecreasing recorded distance.",
        valid: true,
        feedback: "Yes. FIFO order preserves layer order, while marking on discovery prevents the same vertex from being re-enqueued through a longer route before its first path is processed.",
      },
      {
        id: "queue-sorted-label",
        text: "Vertex labels stored in the queue are always alphabetically or numerically sorted.",
        valid: false,
        feedback: "Irrelevant. BFS needs FIFO layer order, not an ordering of vertex names.",
      },
      {
        id: "all-neighbors-finished",
        text: "Whenever a vertex enters the queue, every one of its neighbors has already been fully processed.",
        valid: false,
        feedback: "False. A newly discovered vertex can have undiscovered neighbors; processing those neighbors is precisely future work.",
      },
    ],
    proof: {
      initialization: "The start vertex is discovered with distance 0 and a trivial zero-edge path to itself. It is the only queued vertex, so queued distances are initially nondecreasing.",
      preservation: "When a vertex u of distance d is removed, each newly discovered neighbor v receives distance d + 1 and a parent edge from u. Any already queued vertices have distance d or d + 1, so appending v preserves nondecreasing queue layers. Marking v immediately prevents a second discovery from replacing this first path with a later one.",
      termination: "When the queue becomes empty, every reachable discovered vertex has a recorded path whose length equals its distance. If a shorter path to some vertex existed, its predecessor on that shorter path would have belonged to an earlier BFS layer and would have discovered the vertex first, contradicting the preserved layer order.",
    },
    frames: [
      {
        step: "Initialize",
        state: ["start = A", "queue = [A]", "dist[A] = 0", "discovered = {A}"],
        transition: "Begin with the zero-edge path to A.",
        reason: "The queue contains only layer 0, and the recorded path to A is valid.",
      },
      {
        step: "Expand A",
        state: ["edges from A reach B and C", "queue before = []", "set dist[B] = dist[C] = 1", "queue after = [B, C]"],
        transition: "Discover B and C and mark them immediately.",
        reason: "Both new paths have one edge. Appending them after all layer-0 work preserves nondecreasing distance order.",
      },
      {
        step: "Expand B",
        state: ["queue before = [C]", "B reaches D", "dist[D] = 2", "queue after = [C, D]"],
        transition: "Discover D from B.",
        reason: "C is still layer 1 and D is layer 2, so FIFO order keeps every earlier layer ahead of D.",
      },
      {
        step: "Expand C",
        state: ["queue before = [D]", "C also reaches D", "D is already discovered", "queue remains = [D]"],
        transition: "Do not enqueue D again.",
        reason: "The earlier length-2 discovery is already shortest; duplicate discovery is unnecessary and would weaken the one-enqueue invariant.",
      },
    ],
    counterexample: {
      weakClaim: "A vertex can be marked visited only when it leaves the queue; duplicate queue entries do not matter.",
      state: ["A connects to B and C", "B and C both connect to D", "B discovers D and enqueues it", "before D is removed, C also sees D as unvisited and enqueues D again"],
      explanation: "Delaying the mark until removal allows the same vertex to enter the queue multiple times. BFS can still be repaired around that policy, but the clean discovery invariant and one-parent shortest-path tree no longer follow directly.",
    },
    transferQuestion: "How must the invariant change if edges have nonnegative weights instead of all having equal cost?",
  },
  {
    id: "dijkstra-finalization",
    label: "Dijkstra finalization",
    algorithm: "Repeatedly select the unprocessed vertex with minimum tentative distance, finalize it, and relax its outgoing nonnegative edges.",
    question: "What property makes it safe to declare a selected vertex permanently optimal?",
    claims: [
      {
        id: "finalized-shortest",
        text: "Every processed vertex has its true shortest-path distance, and each unprocessed tentative distance is the cost of the best start-to-vertex path discovered so far.",
        valid: true,
        feedback: "Yes. The nonnegative-edge assumption prevents an undiscovered detour through unprocessed vertices from later undercutting the smallest tentative distance that is being finalized.",
      },
      {
        id: "tentative-never-changes",
        text: "Once any tentative distance is assigned for the first time, it can never decrease later.",
        valid: false,
        feedback: "False. Relaxation exists precisely because a later processed predecessor can reveal a cheaper path to an unprocessed vertex.",
      },
      {
        id: "fewest-edges-first",
        text: "Vertices are finalized in order of the number of edges on their current path from the source.",
        valid: false,
        feedback: "That describes BFS-like layer order, not weighted shortest paths. Dijkstra orders by path cost, not hop count.",
      },
    ],
    proof: {
      initialization: "Before any finalization, the source has tentative distance 0, representing the empty path, and every other vertex has infinity. No processed-vertex claim has yet been violated.",
      preservation: "Let u be the unprocessed vertex with smallest tentative distance d. Suppose a cheaper path to u existed. On that path, take the first unprocessed vertex x and its processed predecessor y. Because edge weights are nonnegative and y was already processed, relaxing y would have assigned x a tentative distance no larger than the cheaper path prefix, which is below d. That contradicts choosing u as the minimum tentative vertex. Thus d is final, and subsequent relaxations preserve best-discovered tentative paths for unprocessed neighbors.",
      termination: "When all reachable vertices have been processed—or the smallest remaining tentative distance is infinity—every reachable processed distance is final by repeated preservation. Unreachable vertices correctly remain at infinity.",
    },
    frames: [
      {
        step: "Initialize",
        state: ["source = A", "dist[A] = 0", "dist[B,C,D] = ∞", "processed = {}"],
        transition: "Select A as the smallest tentative vertex.",
        reason: "The zero-edge path is optimal and no negative edge can create a path cheaper than zero later.",
      },
      {
        step: "Finalize A",
        state: ["edges A→B = 4, A→C = 1", "processed = {A}", "dist[B] = 4", "dist[C] = 1"],
        transition: "Relax A's outgoing edges.",
        reason: "The tentative values are now costs of concrete discovered paths; C is the next minimum.",
      },
      {
        step: "Finalize C",
        state: ["processed = {A, C}", "edge C→B = 2", "old dist[B] = 4", "new dist[B] = 3"],
        transition: "Relax B from 4 down to 3.",
        reason: "Unprocessed tentative distances may improve; only processed distances are permanent.",
      },
      {
        step: "Finalize B",
        state: ["minimum unprocessed tentative = dist[B] = 3", "processed = {A, C, B}"],
        transition: "Declare 3 final for B.",
        reason: "Any alternative path through an unprocessed vertex would have to reach that vertex with cost below 3 first, contradicting B being the current minimum under nonnegative weights.",
      },
    ],
    counterexample: {
      weakClaim: "The smallest tentative vertex is always safe to finalize even when negative edges are allowed.",
      state: ["A→B has weight 2", "A→C has weight 5", "C→B has weight -10", "Dijkstra would finalize B at 2 before C", "path A→C→B actually costs -5"],
      explanation: "The negative edge lets a path through a currently more expensive unprocessed vertex later become cheaper than an already finalized value. This directly destroys the finalization proof.",
    },
    transferQuestion: "If negative edges are allowed but negative cycles are not, which part of this proof fails and what algorithmic strategy must replace finalization?",
  },
];
