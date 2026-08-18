import { Graph } from "@/components/renderers/Graph";
import { parseWeightedGraph } from "@/lib/parse";
import type { GraphState, Step, TextTopic } from "@/lib/types";

export const primMst: TextTopic<GraphState> = {
  id: "prim-mst",
  category: "Graphs",
  title: "Prim's Minimum Spanning Tree",
  tagline: "Grow one tree by always taking the cheapest way out",
  complexity: { best: "O(E log V)", avg: "O(E log V)", worst: "O(E log V)", space: "O(V)" },
  about: (
    <>
      <p>
        A minimum spanning tree connects every node using the smallest possible total edge weight.
        Prim&apos;s algorithm grows a single tree: start anywhere, then repeatedly add the cheapest
        edge that leaves the tree and reaches a node not yet in it. Stop when every node is
        included — exactly V − 1 edges.
      </p>
      <p>
        It looks like Dijkstra and shares its priority-queue skeleton, but the key differs.
        Dijkstra ranks nodes by <em>total distance from the source</em>; Prim ranks them by the{" "}
        <em>weight of the single edge</em> that would attach them. That one change turns
        shortest-paths into minimum-spanning-tree.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> laying cable, pipe or road networks at minimum cost, cluster
      analysis, maze generation, and approximation algorithms for the travelling salesman problem.
      Prim suits dense graphs; Kruskal (sort edges + union-find) suits sparse ones.
    </>
  ),
  code: [
    "static int prim(Graph g, String start) {",
    "  Set<String> inTree = new HashSet<>();",
    "  PriorityQueue<Edge> pq = new PriorityQueue<>();",
    "  inTree.add(start);",
    "  for (Edge e : g.edges(start)) pq.add(e);",
    "  int total = 0;",
    "  while (!pq.isEmpty() && inTree.size() < g.size()) {",
    "    Edge e = pq.poll();              // cheapest crossing edge",
    "    if (inTree.contains(e.to)) continue;",
    "    inTree.add(e.to);",
    "    total += e.weight;",
    "    for (Edge n : g.edges(e.to))",
    "      if (!inTree.contains(n.to)) pq.add(n);",
    "  }",
    "  return total;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function prim(g, start) {",
      "  const inTree = new Set([start]);",
      "  const pq = new MinHeap();",
      "  ",
      "  for (const e of g[start]) pq.push(e);",
      "  let total = 0;",
      "  while (pq.size() && inTree.size < g.size) {",
      "    const e = pq.pop();              // cheapest crossing edge",
      "    if (inTree.has(e.to)) continue;",
      "    inTree.add(e.to);",
      "    total += e.weight;",
      "    for (const n of g[e.to])",
      "      if (!inTree.has(n.to)) pq.push(n);",
      "  }",
      "  return total;",
      "}",
    ],
  },
  mistakes: [
    "Skipping the inTree check after polling — stale queue entries would add a node twice and create a cycle.",
    "Ranking by cumulative distance from the start (that's Dijkstra) rather than by the single edge weight.",
    "Stopping when the queue empties on a disconnected graph and reporting a spanning tree that doesn't span.",
  ],
  interview: [
    "\"Min cost to connect all points\" — Prim over a complete graph of distances.",
    "\"Connecting cities with minimum cost\" — Prim or Kruskal.",
    "\"Prim vs Kruskal — when would you pick each?\" — density, and whether edges are already sorted.",
  ],
  inputs: {
    kind: "text",
    label: "Weighted edges",
    defaultValue: "A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2",
    extraField: { label: "Start", defaultValue: "A" },
  },
  legend: [
    ["--c-compare", "edge under consideration"],
    ["--c-done", "in the tree"],
    ["--c-pointer", "reachable frontier"],
  ],
  renderer: Graph,
  makeSteps({ text, extra }) {
    const { graph, weights, wadj } = parseWeightedGraph(text);
    const start = String(extra ?? "").trim().toUpperCase();
    if (!graph.adj[start]) {
      throw new Error(`Start node "${start || "?"}" isn't in the graph. Nodes: ${graph.nodes.join(", ")}.`);
    }
    const steps: Step<GraphState>[] = [];
    const inTree = new Set<string>([start]);
    const tread: [string, string][] = [];
    const pq: [number, string, string][] = []; // [weight, from, to]
    let total = 0;
    const aux = () =>
      `frontier: [${[...pq].sort((a, b) => a[0] - b[0]).map(([w, f, t]) => `${f}–${t}:${w}`).join(", ") || "—"}]  ·  total: ${total}`;
    const snap = (line: number, desc: string, extraState: Partial<GraphState> = {}) =>
      steps.push({
        line,
        desc,
        aux: aux(),
        state: {
          graph,
          weights,
          visited: [...inTree],
          seen: pq.map((e) => e[2]),
          tread: [...tread],
          ...extraState,
        },
      });

    snap(4, `Start the tree at ${start}. It is the only node in the tree so far.`, { current: start });
    for (const [v, w] of wadj[start]) pq.push([w, start, v]);
    snap(5, `Add every edge leaving ${start} to the frontier queue.`, { current: start });

    while (pq.length && inTree.size < graph.nodes.length) {
      pq.sort((a, b) => a[0] - b[0] || (a[2] < b[2] ? -1 : 1));
      const [w, from, to] = pq.shift()!;
      snap(8, `Cheapest edge leaving the tree is ${from}–${to} at weight ${w}.`, {
        activeEdge: [from, to],
        current: from,
      });
      if (inTree.has(to)) {
        snap(9, `${to} is already in the tree — taking this edge would close a cycle. Skip it.`, {
          activeEdge: [from, to],
        });
        continue;
      }
      inTree.add(to);
      total += w;
      tread.push([from, to]);
      snap(11, `Add ${to} to the tree via ${from}–${to}. Running total: ${total}.`, {
        activeEdge: [from, to],
        current: to,
      });
      for (const [nb, nw] of wadj[to]) {
        if (!inTree.has(nb)) pq.push([nw, to, nb]);
      }
      snap(13, `Push ${to}'s edges to nodes still outside the tree onto the frontier.`, { current: to });
    }
    if (inTree.size < graph.nodes.length) {
      snap(15, `The frontier is empty but only ${inTree.size} of ${graph.nodes.length} nodes were reached — the graph is disconnected, so no spanning tree exists.`);
    } else {
      snap(15, `Every node is connected using ${tread.length} edges (V − 1) for a minimum total weight of ${total}.`);
    }
    return steps;
  },
  quiz: [
    {
      q: "How does Prim's priority differ from Dijkstra's?",
      opts: [
        "Prim ranks by the single edge weight attaching a node; Dijkstra ranks by total distance from the source",
        "They are identical",
        "Prim uses a stack instead of a heap",
        "Prim requires negative weights",
      ],
      answer: 0,
      why: "That one difference in the key is the whole difference between minimum-spanning-tree and shortest-paths — the loop structure is otherwise the same.",
    },
    {
      q: "How many edges does a minimum spanning tree of V nodes contain?",
      opts: ["V − 1", "V", "E − V", "2V"],
      answer: 0,
      why: "A tree spanning V nodes always has exactly V − 1 edges — one fewer would disconnect it, one more would create a cycle.",
    },
    {
      q: "Why must the algorithm check inTree again after polling an edge?",
      opts: [
        "Both endpoints may have joined the tree since the edge was queued; taking it would form a cycle",
        "To handle negative weights",
        "The queue can corrupt entries",
        "It doesn't need to",
      ],
      answer: 0,
      why: "Edges are queued when their source joins and are never removed. By the time one surfaces, its target may already be in the tree — that entry is stale.",
    },
  ],
};
