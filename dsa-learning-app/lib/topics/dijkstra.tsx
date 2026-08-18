import { Graph } from "@/components/renderers/Graph";
import { parseWeightedGraph } from "@/lib/parse";
import type { GraphState, Step, TextTopic } from "@/lib/types";

export const dijkstra: TextTopic<GraphState> = {
  id: "dijkstra",
  category: "Graphs",
  title: "Dijkstra's Algorithm",
  tagline: "Greedily finalize the closest node, relax its edges",
  complexity: { best: "O((V+E) log V)", avg: "O((V+E) log V)", worst: "O((V+E) log V)", space: "O(V)" },
  about: (
    <>
      <p>
        Dijkstra finds shortest paths in a graph with <em>non-negative</em> edge weights. It
        keeps a tentative distance for every node (∞ until discovered) and repeatedly pulls the
        closest unfinalized node from a priority queue. That node&apos;s distance is now{" "}
        <em>final</em> — any other route would have to pass through something farther away.
        Then it <em>relaxes</em> the node&apos;s edges: if going through it shortens a
        neighbour&apos;s tentative distance, the table is updated.
      </p>
      <p>The number under each node is its current tentative distance from the start.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> GPS navigation and map routing, network routing
      protocols (OSPF), game pathfinding (as the basis of A*), and any cheapest-path problem
      with non-negative costs.
    </>
  ),
  code: [
    "static Map<String,Integer> dijkstra(Graph g, String start) {",
    "  Map<String,Integer> dist = new HashMap<>();",
    "  PriorityQueue<Entry> pq = new PriorityQueue<>();",
    "  dist.put(start, 0);",
    "  pq.add(new Entry(start, 0));",
    "  while (!pq.isEmpty()) {",
    "    Entry e = pq.poll();               // smallest dist",
    "    if (e.d > dist.get(e.node)) continue;  // stale",
    "    for (Edge edge : g.edges(e.node)) {",
    "      int nd = e.d + edge.weight;",
    "      if (nd < dist.getOrDefault(edge.to, MAX)) {",
    "        dist.put(edge.to, nd);",
    "        pq.add(new Entry(edge.to, nd));",
    "      }",
    "    }",
    "  }",
    "  return dist;",
    "}",
  ],
  inputs: {
    kind: "text",
    label: "Weighted edges",
    defaultValue: "A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2",
    extraField: { label: "Start", defaultValue: "A" },
  },
  legend: [
    ["--c-compare", "current / relaxing edge"],
    ["--c-pointer", "tentative distance set"],
    ["--c-done", "distance finalized"],
  ],
  renderer: Graph,
  makeSteps({ text, extra }) {
    const { graph, weights, wadj } = parseWeightedGraph(text);
    const start = (extra ?? "").trim().toUpperCase();
    if (!graph.adj[start]) {
      throw new Error(`Start node "${start || "?"}" isn't in the graph. Nodes: ${graph.nodes.join(", ")}.`);
    }
    const steps: Step<GraphState>[] = [];
    const dist: Record<string, number> = {};
    const finalized: string[] = [];
    const pq: [number, string][] = [];
    const sub = () => {
      const out: Record<string, string> = {};
      for (const n of graph.nodes) out[n] = dist[n] === undefined ? "∞" : String(dist[n]);
      return out;
    };
    const aux = () =>
      `pq: [${[...pq]
        .sort((a, b) => a[0] - b[0])
        .map(([d, n]) => `${n}:${d}`)
        .join(", ")}]`;
    const snap = (line: number, desc: string, extraState: Partial<GraphState> = {}) =>
      steps.push({
        line,
        desc,
        aux: aux(),
        state: {
          graph,
          weights,
          sub: sub(),
          visited: [...finalized],
          seen: Object.keys(dist),
          ...extraState,
        },
      });

    dist[start] = 0;
    snap(4, `dist[${start}] = 0. Every other node starts at ∞ — unreached.`);
    pq.push([0, start]);
    snap(5, `Seed the priority queue with (${start}, 0).`);
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1));
      const [d, u] = pq.shift()!;
      if (d > dist[u]) {
        snap(8, `Poll (${u}, ${d}) — stale: ${u} was already finalized at ${dist[u]}. Skip it.`, { current: u });
        continue;
      }
      finalized.push(u);
      snap(7, `Poll (${u}, ${d}) — the closest unfinalized node. ${u}'s distance ${d} is now FINAL: any other route would pass through a farther node first.`, { current: u });
      for (const [v, w] of wadj[u]) {
        const nd = d + w;
        snap(10, `Relax edge ${u}–${v} (weight ${w}): candidate distance ${d} + ${w} = ${nd}.`, {
          current: u,
          activeEdge: [u, v],
        });
        if (nd < (dist[v] ?? Infinity)) {
          const old = dist[v] === undefined ? "∞" : dist[v];
          dist[v] = nd;
          pq.push([nd, v]);
          snap(12, `${nd} beats ${old} — update dist[${v}] = ${nd} and push (${v}, ${nd}).`, {
            current: u,
            activeEdge: [u, v],
          });
        } else {
          snap(11, `${nd} ≥ dist[${v}] = ${dist[v]} — the known route is already as good. Keep it.`, {
            current: u,
            activeEdge: [u, v],
          });
        }
      }
    }
    snap(17, `Priority queue empty — the table holds the shortest distance from ${start} to every reachable node.`);
    return steps;
  },
  quiz: [
    {
      q: "Why does Dijkstra require non-negative edge weights?",
      opts: [
        "Finalizing the closest node assumes no later path can be shorter — a negative edge could break that",
        "Priority queues can't store negative numbers",
        "It doesn't — weights may be negative",
        "Negative weights would overflow the distance sum",
      ],
      answer: 0,
      why: "The greedy proof says any alternative route passes through a node at least as far away. A negative edge could then still shrink the total — use Bellman-Ford in that case.",
    },
    {
      q: "When a polled entry's distance is larger than the node's recorded distance, the code skips it. Why do such entries exist?",
      opts: [
        "The node was re-pushed later with a better distance; the old entry became stale",
        "It's a bug in the algorithm",
        "The priority queue occasionally corrupts entries",
        "Negative weights created them",
      ],
      answer: 0,
      why: "Rather than update entries inside the queue, we push a new better one — cheap and simple. Old entries surface later and are recognized as stale.",
    },
    {
      q: "What is Dijkstra's complexity with a binary-heap priority queue?",
      opts: ["O((V + E) log V)", "O(V²) always", "O(V + E)", "O(E²)"],
      answer: 0,
      why: "Each node is polled and each edge can push one entry; every heap operation costs O(log V).",
    },
  ],
};
