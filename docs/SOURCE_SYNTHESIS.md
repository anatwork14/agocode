# Source Synthesis — AgoCode Syllabus v2

This document records the product ideas extracted from three additional references used to expand AgoCode beyond the original visual Book Track:

- Michael T. Goodrich, Roberto Tamassia, Michael H. Goldwasser — *Data Structures & Algorithms in Python*
- Adnan Aziz, Tsung-Hsien Lee, Amit Prakash — *Elements of Programming Interviews in Python*
- Steven S. Skiena — *The Algorithm Design Manual*

AgoCode treats these works as pedagogical references, not content to reproduce. Short problem names and source provenance may be indexed; exercises, explanations, solutions, figures, and prose are rewritten from scratch.

## 1. The three perspectives are complementary

### Goodrich: abstraction, representation, correctness, and implementation

The strongest contribution to AgoCode is the separation between an **abstract data type** and the **representation used to implement it**. The syllabus must ask two different questions:

1. What operations does the client need?
2. Which representation makes that workload efficient?

This changes how we teach stacks, queues, maps, trees, priority queues, and sequences. Learners should compare multiple implementations of the same contract instead of memorizing one canonical code listing.

The second major contribution is **justification**. Complexity is paired with correctness techniques such as counterexamples, induction, contradiction, and loop invariants. AgoCode should therefore attach a proof obligation to important state transitions: what must remain true before and after this operation?

The third contribution is **algorithm engineering**: experimental analysis, amortization, Python library behavior, memory representation, and external-memory structures belong in the curriculum because real performance depends on more than the top-level asymptotic label.

### EPI: develop a solution rather than reveal one

The strongest product pattern is a consistent exercise narrative:

1. establish context,
2. state the problem,
3. offer a delayed hint,
4. begin with a simple baseline,
5. analyze why that baseline wastes work,
6. derive a better algorithm in prose,
7. apply it to a concrete input,
8. implement the key mechanism,
9. analyze time and space,
10. vary the problem to test transfer.

This becomes the AgoCode exercise contract. The learner should see the optimized solution only after producing evidence at earlier stages.

EPI also reinforces **concrete examples, case analysis, iterative refinement, reduction, and pattern recognition**. Canonical problems are useful as retrieval keys, but memorizing a finished solution is explicitly the wrong objective. Mixed practice should hide chapter labels so the learner must first choose a technique.

### Skiena: modeling, repertoire, and a repeatable design checklist

The strongest contribution is the idea that modeling is a primary algorithm-design skill. AgoCode should not begin every exercise with an algorithm category. Instead, learners should translate a messy application into an abstract problem and compare alternative formulations.

The design process is turned into a sequence of questions:

- Do I really understand the input, output, scale, and objective?
- Can I solve a tiny instance by hand?
- Can I write a simple correct or brute-force method?
- What does that method repeatedly waste?
- Are there special cases I can solve exactly?
- Does sorting expose useful order?
- Can the problem be divided?
- Is there repeated work suggesting dynamic programming?
- Are repeated queries suggesting a data structure?
- Is the problem naturally a graph, string, set, numerical, geometric, or combinatorial problem?
- Is exact optimization realistic, or should I consider pruning, approximation, or heuristics?

A rejected approach is only useful when the learner writes **why** it fails. This motivates a future persistent Design Log.

Skiena's catalog also motivates the Canonical Problem Atlas: learners should know the names of important problem families so they can recognize what is already known rather than reinvent every technique from scratch.

## 2. New AgoCode learning contract

The original mastery loop remains:

> Understand → Predict → Trace → Rebuild → Explain → Transfer → Recall

The broader problem-solving loop is now:

> Understand → Model → Baseline → Transform → Choose structure → Prove → Analyze → Implement → Vary → Recall

A strong exercise should gather evidence from both loops.

## 3. Syllabus consequences

The 11-chapter visual Book Track remains intact. It is now surrounded by ten broader tracks:

0. Visual-first foundation
1. Measure and justify
2. Abstract data types before implementations
3. Ordered and hierarchical structures
4. Transform the input before solving
5. Recursive decomposition and search
6. Graph modeling as a change of language
7. Optimization: greedy, DP, and approximation
8. A repeatable way to solve unfamiliar problems
9. Algorithm engineering and real constraints

This adds missing foundations such as heaps, balanced trees, DFS/backtracking, string matching, MST/union-find, amortization, external memory, hardness, approximation, and concurrency without destroying the simplicity of the original entry path.

## 4. Exercise-system consequences

Each canonical problem entry should eventually support:

- source provenance and structural tags,
- an original AgoCode formulation,
- tiny example generation,
- baseline capture,
- hypothesis before code,
- progressive hints,
- invariant/proof prompt,
- executable tests,
- complexity check,
- at least one variant,
- mixed recognition after a delay,
- Design Log history showing rejected approaches and reasons.

The current Problem Atlas is the indexing layer. Existing AgoCode learning slices are linked directly; catalog-only entries open a design worksheet until an original interactive formulation is authored.

## 5. Copyright boundary

The books contain hundreds of copyrighted exercises and explanations. AgoCode must not republish them wholesale.

Allowed product use:

- short bibliographic/source names,
- short problem or algorithm titles,
- chapter/topic provenance,
- original taxonomy,
- original problem formulations inspired by general concepts,
- original examples, visualizations, hints, tests, and solutions.

Not allowed in AgoCode content without permission:

- copied exercise statements,
- copied solution prose,
- copied figures or traced illustrations,
- large excerpts or reconstructed chapter text.

This constraint improves the product: the goal is to build a learning system from the ideas, not a digital copy of the books.
