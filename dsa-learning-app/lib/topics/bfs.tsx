import { Graph } from "@/components/renderers/Graph";
import type { GraphState, GraphTopic, Step } from "@/lib/types";
import { GRAPH_LEGEND } from "./legends";

export const bfs: GraphTopic<GraphState> = {
  id: "bfs",
  category: "Graphs",
  title: "Breadth-First Search",
  tagline: "Explore in rings, powered by a queue",
  complexity: { best: "O(V + E)", avg: "O(V + E)", worst: "O(V + E)", space: "O(V)" },
  about: (
    <>
      <p>
        BFS explores a graph in expanding &ldquo;rings&rdquo; from the start node: first all
        neighbours at distance 1, then distance 2, and so on. A <em>queue</em> (first-in,
        first-out) enforces that order — newly discovered nodes join the back of the line.
        Because nodes are reached in distance order, BFS finds shortest paths in unweighted
        graphs.
      </p>
      <p>
        Dashed nodes are <em>discovered</em> (in the queue); filled nodes are <em>visited</em>.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> shortest path in unweighted graphs (mazes, word ladders,
      social &ldquo;degrees of separation&rdquo;), level-order tree traversal, web crawling, and
      connectivity checks.
    </>
  ),
  code: [
    "static void bfs(Graph g, String start) {",
    "  Deque<String> queue = new ArrayDeque<>(List.of(start));",
    "  Set<String> visited = new HashSet<>(Set.of(start));",
    "  while (!queue.isEmpty()) {",
    "    String node = queue.poll();",
    "    visit(node);",
    "    for (String next : g.adj(node)) {",
    "      if (!visited.contains(next)) {",
    "        visited.add(next);",
    "        queue.add(next);",
    "      }",
    "    }",
    "  }",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function bfs(graph, start) {",
      "  const queue = [start];",
      "  const visited = new Set([start]);",
      "  while (queue.length > 0) {",
      "    const node = queue.shift();",
      "    visit(node);",
      "    for (const next of graph[node]) {",
      "      if (!visited.has(next)) {",
      "        visited.add(next);",
      "        queue.push(next);",
      "      }",
      "    }",
      "  }",
      "}",
    ],
    python: {
      lines: [
        "def bfs(g, start):",
        "    queue = deque([start])",
        "    visited = {start}",
        "    while queue:",
        "        node = queue.popleft()",
        "        visit(node)",
        "        for nxt in g[node]:",
        "            if nxt not in visited:",
        "                visited.add(nxt)",
        "                queue.append(nxt)",
      ],
      map: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, 0, 4, 0],
    },
  },
  mistakes: [
    "Marking nodes visited on dequeue instead of on enqueue — the same node enters the queue many times and blows up the runtime.",
    "Using an array's shift() in JS or list.pop(0) in Python for huge graphs — that's O(n) per dequeue; use a real deque.",
    "Forgetting that BFS's shortest-path guarantee dies the moment edges have weights (that's Dijkstra's job).",
  ],
  interview: [
    "\"Shortest path in a maze / grid\" — BFS over cells.",
    "\"Word ladder\" — BFS over the graph of one-letter mutations.",
    "\"Binary tree level-order traversal\" — BFS with level boundaries.",
  ],
  inputs: { kind: "graph", label: "Edges", defaultValue: "A-B, A-C, B-D, C-D, C-E, D-F, E-F", startDefault: "A" },
  legend: GRAPH_LEGEND,
  renderer: Graph,
  makeSteps({ graph, start }) {
    const steps: Step<GraphState>[] = [];
    const seen = new Set<string>([start]);
    const visited: string[] = [];
    const queue: string[] = [start];
    const tread: [string, string][] = [];
    const snap = (line: number, desc: string, extra: Partial<GraphState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `queue (front → back): [${queue.join(", ")}]`,
        state: { graph, visited: [...visited], seen: [...seen], tread: [...tread], ...extra },
      });

    snap(2, `Seed the queue with the start node ${start}.`);
    snap(3, `Mark ${start} as discovered so it can never be queued twice.`);
    while (queue.length > 0) {
      const node = queue.shift()!;
      snap(5, `Dequeue ${node} from the front of the queue.`, { current: node });
      visited.push(node);
      snap(6, `Visit ${node}.`, { current: node });
      for (const nb of graph.adj[node]) {
        snap(7, `Look at ${node}'s neighbour ${nb}.`, { current: node, activeEdge: [node, nb] });
        if (!seen.has(nb)) {
          seen.add(nb);
          queue.push(nb);
          tread.push([node, nb]);
          snap(10, `${nb} is new — mark it discovered and enqueue it at the back.`, {
            current: node,
            activeEdge: [node, nb],
          });
        } else {
          snap(8, `${nb} was already discovered — skip it.`, { current: node, activeEdge: [node, nb] });
        }
      }
    }
    snap(13, "The queue is empty — every reachable node has been visited, in order of distance from the start.");
    return steps;
  },
  quiz: [
    {
      q: "Which data structure gives BFS its level-by-level exploration order?",
      opts: ["A stack (LIFO)", "A queue (FIFO)", "A priority queue", "A hash map"],
      answer: 1,
      why: "First-in, first-out means nodes are processed in the order discovered — all of distance k before any of distance k+1.",
    },
    {
      q: "In an unweighted graph, what does BFS from node S guarantee about the first time it reaches node T?",
      opts: [
        "It used the fewest possible edges from S to T",
        "It used the alphabetically smallest path",
        "Nothing — DFS is needed for shortest paths",
        "It visited every other node first",
      ],
      answer: 0,
      why: "BFS reaches nodes in increasing distance order, so the first arrival at T is via a shortest (fewest-edges) path.",
    },
    {
      q: "What is the time complexity of BFS with an adjacency list, for V vertices and E edges?",
      opts: ["O(V²) always", "O(V + E)", "O(E log V)", "O(V · E)"],
      answer: 1,
      why: "Each vertex is enqueued once and each edge is examined a constant number of times: O(V + E).",
    },
  ],
};
