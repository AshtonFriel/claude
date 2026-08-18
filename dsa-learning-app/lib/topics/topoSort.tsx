import { Graph } from "@/components/renderers/Graph";
import { parseDigraph } from "@/lib/parse";
import type { GraphState, Step, TextTopic } from "@/lib/types";

export const topoSort: TextTopic<GraphState> = {
  id: "topological-sort",
  category: "Graphs",
  title: "Topological Sort",
  tagline: "Order tasks so every arrow points forward",
  complexity: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  about: (
    <>
      <p>
        In a directed graph where an edge A→B means &ldquo;A must come before B&rdquo;, a
        topological order lines up the nodes so every edge points forward. Kahn&apos;s
        algorithm builds it greedily: repeatedly take any node with <em>in-degree 0</em> (no
        remaining prerequisites), append it to the order, and &ldquo;cut&rdquo; its outgoing
        edges, which may free up new nodes. If nodes remain with nonzero in-degree at the end,
        they form a cycle — and no valid order exists.
      </p>
      <p>The number under each node is its current remaining in-degree.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> build systems and package managers (dependency order),
      course prerequisites, spreadsheet cell evaluation, task scheduling — and cycle detection
      for free, since a cycle is exactly what makes ordering impossible.
    </>
  ),
  code: [
    "static List<String> topoSort(Graph g) {",
    "  Map<String,Integer> indeg = g.indegrees();",
    "  Deque<String> queue = new ArrayDeque<>();",
    "  for (String n : g.nodes())",
    "    if (indeg.get(n) == 0) queue.add(n);",
    "  List<String> order = new ArrayList<>();",
    "  while (!queue.isEmpty()) {",
    "    String u = queue.poll();",
    "    order.add(u);",
    "    for (String v : g.adj(u)) {",
    "      indeg.put(v, indeg.get(v) - 1);",
    "      if (indeg.get(v) == 0) queue.add(v);",
    "    }",
    "  }",
    "  return order;  // shorter than V ⇒ cycle",
    "}",
  ],
  inputs: {
    kind: "text",
    label: "Directed edges",
    defaultValue: "A>B, A>C, B>D, C>D, D>E, C>F",
  },
  codeAlt: {
    javascript: [
      "function topoSort(g) {",
      "  const indeg = countIndegrees(g);",
      "  const queue = [];",
      "  for (const n of g.nodes)",
      "    if (indeg[n] === 0) queue.push(n);",
      "  const order = [];",
      "  while (queue.length > 0) {",
      "    const u = queue.shift();",
      "    order.push(u);",
      "    for (const v of g.adj[u]) {",
      "      indeg[v]--;",
      "      if (indeg[v] === 0) queue.push(v);",
      "    }",
      "  }",
      "  return order;  // shorter than V ⇒ cycle",
      "}",
    ],
  },
  mistakes: [
    "Forgetting to seed *every* zero-in-degree node — disconnected components silently vanish from the order.",
    "Not checking order.length against the node count, missing the cycle case entirely.",
    "Decrementing in-degree of the wrong endpoint (u instead of v) on each cut edge.",
  ],
  interview: [
    "\"Course schedule I & II\" — can you finish, and in what order.",
    "\"Alien dictionary\" — build the precedence graph from word pairs, then topo-sort it.",
    "\"Build order for these packages\" — the systems-design phrasing of the same thing.",
  ],
  legend: [
    ["--c-compare", "current / edge being cut"],
    ["--c-pointer", "ready (in-degree 0)"],
    ["--c-done", "placed in order"],
  ],
  renderer: Graph,
  makeSteps({ text }) {
    const graph = parseDigraph(text);
    const steps: Step<GraphState>[] = [];
    const indeg: Record<string, number> = {};
    for (const n of graph.nodes) indeg[n] = 0;
    for (const [, v] of graph.edges) indeg[v]++;
    const queue: string[] = [];
    const order: string[] = [];
    const seen = new Set<string>();
    const sub = () => {
      const out: Record<string, string> = {};
      for (const n of graph.nodes) if (!order.includes(n)) out[n] = `in:${indeg[n]}`;
      return out;
    };
    const aux = () => `queue: [${queue.join(", ")}] · order: [${order.join(", ")}]`;
    const snap = (line: number, desc: string, extraState: Partial<GraphState> = {}) =>
      steps.push({
        line,
        desc,
        aux: aux(),
        state: {
          graph,
          directed: true,
          sub: sub(),
          visited: [...order],
          seen: [...seen],
          ...extraState,
        },
      });

    snap(2, "Count each node's in-degree — how many prerequisites still point at it.");
    for (const n of graph.nodes) {
      if (indeg[n] === 0) {
        queue.push(n);
        seen.add(n);
        snap(5, `${n} has in-degree 0 — nothing blocks it. Seed the queue.`, { current: n });
      }
    }
    if (!queue.length) {
      snap(15, "No node has in-degree 0 — every node waits on another. The graph is one big cycle; no order exists.");
      return steps;
    }
    while (queue.length) {
      const u = queue.shift()!;
      snap(8, `Dequeue ${u} — all of its prerequisites are already placed.`, { current: u });
      order.push(u);
      snap(9, `Append ${u} to the order (position ${order.length}).`, { current: u });
      for (const v of graph.adj[u]) {
        indeg[v]--;
        snap(11, `Cut edge ${u}→${v}: ${v}'s remaining in-degree drops to ${indeg[v]}.`, {
          current: u,
          activeEdge: [u, v],
        });
        if (indeg[v] === 0) {
          queue.push(v);
          seen.add(v);
          snap(12, `${v} has no remaining prerequisites — enqueue it.`, { current: u, activeEdge: [u, v] });
        }
      }
    }
    if (order.length < graph.nodes.length) {
      const stuck = graph.nodes.filter((n) => !order.includes(n));
      snap(15, `Only ${order.length} of ${graph.nodes.length} nodes could be ordered — ${stuck.join(", ")} form a cycle. No valid order exists.`);
    } else {
      snap(15, `Every node placed: ${order.join(" → ")}. Every arrow points forward — a valid topological order.`);
    }
    return steps;
  },
  quiz: [
    {
      q: "What property must a directed graph have for a topological order to exist?",
      opts: [
        "It must be acyclic (a DAG)",
        "It must be connected",
        "Every node needs an outgoing edge",
        "Edge weights must be positive",
      ],
      answer: 0,
      why: "In a cycle each node waits on another forever — no node in it can ever reach in-degree 0.",
    },
    {
      q: "In Kahn's algorithm, when does a node enter the queue?",
      opts: [
        "When its remaining in-degree reaches 0",
        "When it has no outgoing edges",
        "In alphabetical order",
        "When any neighbour is processed",
      ],
      answer: 0,
      why: "In-degree 0 means every prerequisite has already been placed — the node is now safe to schedule.",
    },
    {
      q: "The algorithm ends with fewer ordered nodes than the graph has. What does that tell you?",
      opts: [
        "The leftover nodes contain a cycle",
        "The graph was disconnected",
        "The queue was too small",
        "Nothing — that's normal",
      ],
      answer: 0,
      why: "Nodes that never reach in-degree 0 are all waiting on each other — exactly a cycle. Build tools use this to report circular dependencies.",
    },
  ],
};
