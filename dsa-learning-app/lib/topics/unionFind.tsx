import { Graph } from "@/components/renderers/Graph";
import { parseGraph } from "@/lib/parse";
import type { GraphState, Step, TextTopic } from "@/lib/types";

export const unionFind: TextTopic<GraphState> = {
  id: "union-find",
  category: "Graphs",
  title: "Union-Find (DSU)",
  tagline: "Merge sets, ask 'same group?' in almost O(1)",
  complexity: { best: "O(α(n))", avg: "O(α(n))", worst: "O(α(n))", space: "O(n)" },
  about: (
    <>
      <p>
        A disjoint-set union structure answers one question fast: are these two things in the same
        group? Each element points at a parent; follow parents to reach the set&apos;s{" "}
        <em>root</em>, which is its identity. <code>union</code> hangs one root under the other,
        merging two sets in constant time.
      </p>
      <p>
        Two optimisations keep the trees flat. <em>Union by size</em> always hangs the smaller tree
        under the larger; <em>path compression</em> re-points every node visited during a find
        straight at the root. Together they make the amortized cost the inverse Ackermann function
        α(n) — under 5 for any input that fits in the universe.
      </p>
      <p>The label under each node is its current parent.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> Kruskal&apos;s minimum spanning tree (to detect cycles),
      connected components, network connectivity, image segmentation, and account/entity merging.
      Any &ldquo;are these connected?&rdquo; question over a growing set of links.
    </>
  ),
  code: [
    "int[] parent, size;",
    "int find(int x) {",
    "  while (parent[x] != x) {",
    "    parent[x] = parent[parent[x]];  // path compression",
    "    x = parent[x];",
    "  }",
    "  return x;",
    "}",
    "boolean union(int a, int b) {",
    "  int ra = find(a), rb = find(b);",
    "  if (ra == rb) return false;      // already joined",
    "  if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }",
    "  parent[rb] = ra;",
    "  size[ra] += size[rb];",
    "  return true;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "let parent = [], size = [];",
      "function find(x) {",
      "  while (parent[x] !== x) {",
      "    parent[x] = parent[parent[x]];  // path compression",
      "    x = parent[x];",
      "  }",
      "  return x;",
      "}",
      "function union(a, b) {",
      "  let ra = find(a), rb = find(b);",
      "  if (ra === rb) return false;      // already joined",
      "  if (size[ra] < size[rb]) [ra, rb] = [rb, ra];",
      "  parent[rb] = ra;",
      "  size[ra] += size[rb];",
      "  return true;",
      "}",
    ],
  },
  mistakes: [
    "Comparing the elements themselves instead of their roots — find() must run on both sides before deciding.",
    "Skipping union by size, which lets the structure degenerate into a linked list and find() into O(n).",
    "Assuming a union always merges; if both are already in one set it must be a no-op (that's exactly the cycle check Kruskal needs).",
  ],
  interview: [
    "\"Number of connected components in an undirected graph.\"",
    "\"Redundant connection\" — the first edge whose union returns false closes a cycle.",
    "\"Accounts merge\" and \"number of islands II\" — DSU over a growing set of links.",
  ],
  inputs: { kind: "text", label: "Unions to apply", defaultValue: "A-B, C-D, B-C, E-F, A-D" },
  legend: [
    ["--c-compare", "current union"],
    ["--c-done", "merged into one set"],
    ["--c-pointer", "parent labels"],
  ],
  renderer: Graph,
  makeSteps({ text }) {
    const graph = parseGraph(text);
    const nodes = graph.nodes;
    const parent: Record<string, string> = {};
    const size: Record<string, number> = {};
    nodes.forEach((n) => {
      parent[n] = n;
      size[n] = 1;
    });
    const tread: [string, string][] = [];
    const steps: Step<GraphState>[] = [];

    const find = (x: string) => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    const groups = () => {
      const by: Record<string, string[]> = {};
      nodes.forEach((n) => {
        const r = find(n);
        (by[r] ??= []).push(n);
      });
      return Object.values(by)
        .map((g) => `{${g.join(",")}}`)
        .join(" ");
    };
    const sub = () => Object.fromEntries(nodes.map((n) => [n, parent[n]]));
    const snap = (line: number, desc: string, extra: Partial<GraphState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `sets: ${groups()}`,
        state: { graph, sub: sub(), tread: [...tread], ...extra },
      });

    snap(1, `Start with ${nodes.length} singleton sets — every node is its own parent and its own root.`);
    for (const [u, v] of graph.edges) {
      snap(9, `union(${u}, ${v}): find the root of each side first.`, { activeEdge: [u, v], current: u });
      const ru = find(u);
      const rv = find(v);
      if (ru === rv) {
        snap(10, `Both already have root ${ru} — they are in the same set, so this union does nothing. (This is exactly how Kruskal detects a cycle.)`, {
          activeEdge: [u, v],
        });
        continue;
      }
      let big = ru;
      let small = rv;
      if (size[big] < size[small]) {
        [big, small] = [small, big];
        snap(11, `Set ${small} (size ${size[small]}) is larger than ${big} — swap so the smaller tree hangs under the larger.`, {
          activeEdge: [u, v],
        });
      }
      parent[small] = big;
      size[big] += size[small];
      tread.push([u, v]);
      snap(12, `Hang root ${small} under root ${big}. The merged set now holds ${size[big]} nodes.`, {
        activeEdge: [u, v],
        visited: [big],
      });
    }
    const roots = new Set(nodes.map((n) => find(n)));
    snap(15, `All unions applied — ${roots.size} disjoint set${roots.size === 1 ? "" : "s"} remain: ${groups()}`, {
      visited: [...roots],
    });
    return steps;
  },
  quiz: [
    {
      q: "What does union() return false mean, and why is it useful?",
      opts: [
        "Both elements were already in the same set — which is exactly Kruskal's cycle check",
        "The union failed due to an error",
        "One element doesn't exist",
        "The sets were the same size",
      ],
      answer: 0,
      why: "Adding an edge between two already-connected nodes would close a cycle, so Kruskal simply skips any edge whose union returns false.",
    },
    {
      q: "What does path compression do during a find?",
      opts: [
        "Re-points the nodes it walks past directly at the root, flattening the tree for later finds",
        "Deletes unused nodes",
        "Sorts the set members",
        "Reduces memory by half",
      ],
      answer: 0,
      why: "The first find pays the traversal; every later find on that branch is nearly O(1). Combined with union by size it gives the α(n) bound.",
    },
    {
      q: "Why is union by size (or rank) necessary alongside path compression?",
      opts: [
        "Without it, repeatedly hanging large trees under small roots can build a long chain",
        "It saves memory",
        "It keeps the sets sorted",
        "It isn't — compression alone is enough for the α(n) bound",
      ],
      answer: 0,
      why: "The near-constant amortized bound is proved for the two together. Either alone gives a weaker guarantee, and neither alone bounds the worst single operation as tightly.",
    },
  ],
};
