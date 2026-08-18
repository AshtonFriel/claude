import { Graph } from "@/components/renderers/Graph";
import type { GraphState, GraphTopic, Step } from "@/lib/types";
import { GRAPH_LEGEND } from "./legends";

export const dfs: GraphTopic<GraphState> = {
  id: "dfs",
  category: "Graphs",
  title: "Depth-First Search",
  tagline: "Dive deep, backtrack, dive again",
  complexity: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  about: (
    <>
      <p>
        DFS commits to one path and follows it as deep as possible, only backtracking when it
        runs out of unvisited neighbours. The recursion call stack (or an explicit stack)
        remembers the path back. Compare it with BFS on the same graph: DFS snakes into the
        graph; BFS ripples outward.
      </p>
      <p>
        The strip under the diagram shows the live call stack — watch it grow on each dive and
        shrink on each backtrack.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> cycle detection, topological sorting, maze generation and
      solving, connected components, and as the skeleton of backtracking algorithms like
      N-Queens.
    </>
  ),
  code: [
    "static void dfs(Graph g, String node, Set<String> visited) {",
    "  visited.add(node);",
    "  visit(node);",
    "  for (String next : g.adj(node)) {",
    "    if (!visited.contains(next)) {",
    "      dfs(g, next, visited);",
    "    }",
    "  }",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function dfs(graph, node, visited) {",
      "  visited.add(node);",
      "  visit(node);",
      "  for (const next of graph[node]) {",
      "    if (!visited.has(next)) {",
      "      dfs(graph, next, visited);",
      "    }",
      "  }",
      "}",
    ],
    python: {
      lines: [
        "def dfs(g, node, visited):",
        "    visited.add(node)",
        "    visit(node)",
        "    for nxt in g[node]:",
        "        if nxt not in visited:",
        "            dfs(g, nxt, visited)",
      ],
      map: [1, 2, 3, 4, 5, 6, 0, 1, 0],
    },
  },
  mistakes: [
    "Forgetting the visited check on a cyclic graph — infinite recursion, stack overflow.",
    "Relying on recursion for huge graphs; call-stack depth limits mean an explicit stack is safer.",
    "Assuming DFS finds shortest paths — it finds *a* path, often a wildly long one.",
  ],
  interview: [
    "\"Number of islands\" — DFS flood-fill over a grid.",
    "\"Course schedule\" — DFS cycle detection over prerequisites.",
    "\"Clone a graph\" — DFS with a visited map from original to copy.",
  ],
  inputs: { kind: "graph", label: "Edges", defaultValue: "A-B, A-C, B-D, C-D, C-E, D-F, E-F", startDefault: "A" },
  legend: GRAPH_LEGEND,
  renderer: Graph,
  makeSteps({ graph, start }) {
    const steps: Step<GraphState>[] = [];
    const seen = new Set<string>();
    const visited: string[] = [];
    const stack: string[] = [];
    const tread: [string, string][] = [];
    const snap = (line: number, desc: string, extra: Partial<GraphState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `call stack (bottom → top): [${stack.join(", ")}]`,
        state: { graph, visited: [...visited], seen: [...seen], tread: [...tread], ...extra },
      });

    const go = (node: string, from: string | null) => {
      stack.push(node);
      seen.add(node);
      visited.push(node);
      if (from) tread.push([from, node]);
      snap(2, `Mark ${node} visited — the call stack is now ${stack.length} deep.`, { current: node });
      snap(3, `Visit ${node}.`, { current: node });
      for (const nb of graph.adj[node]) {
        snap(5, `From ${node}, check neighbour ${nb}.`, { current: node, activeEdge: [node, nb] });
        if (!seen.has(nb)) {
          snap(6, `${nb} is unvisited — dive deeper: dfs(${nb}).`, { current: node, activeEdge: [node, nb] });
          go(nb, node);
          snap(4, `Backtrack to ${node} and continue with its remaining neighbours.`, { current: node });
        }
      }
      stack.pop();
    };
    go(start, null);
    snap(8, `Every path from ${start} has been fully explored — the stack unwinds to empty.`);
    return steps;
  },
  quiz: [
    {
      q: "What plays the role of BFS's queue in a depth-first search?",
      opts: ["A priority queue", "A second graph", "The call stack (or an explicit stack)", "A sorted list"],
      answer: 2,
      why: "LIFO order is what makes the search dive: the most recently discovered node is explored next, and the stack remembers the way back.",
    },
    {
      q: "Which task is DFS naturally suited for?",
      opts: [
        "Shortest path in an unweighted graph",
        "Cycle detection and topological sorting",
        "Finding the minimum spanning tree",
        "Balancing a BST",
      ],
      answer: 1,
      why: "DFS's dive-and-backtrack structure classifies edges (tree edges vs. back edges) — a back edge means a cycle, and post-order finish times give a topological order.",
    },
    {
      q: "What is the worst-case extra space DFS needs on a graph with V vertices?",
      opts: ["O(1)", "O(V) — the visited set and a stack up to V deep", "O(E)", "O(V²)"],
      answer: 1,
      why: "A path-shaped graph drives the recursion V levels deep, and the visited set always holds up to V entries.",
    },
  ],
};
