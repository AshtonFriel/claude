import { Tree } from "@/components/renderers/Tree";
import type { NumsTopic, Step, TreeState } from "@/lib/types";

export const heap: NumsTopic<TreeState> = {
  id: "binary-heap",
  category: "Trees",
  title: "Binary Heap",
  tagline: "A complete tree living inside an array",
  complexity: { best: "O(1) peek", avg: "O(log n)", worst: "O(log n)", space: "O(n)" },
  about: (
    <>
      <p>
        A min-heap is a complete binary tree where every parent ≤ its children, so the smallest
        element is always at the root. Completeness lets it live in a plain array — node{" "}
        <code>i</code>&apos;s children sit at <code>2i+1</code> and <code>2i+2</code>, no
        pointers needed. Inserting appends at the end and <em>sifts up</em>; extracting the
        minimum moves the last element to the root and <em>sifts down</em>. Both walk one
        root-to-leaf path: O(log n).
      </p>
      <p>This run inserts your values one by one, then extracts the minimum three times.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> priority queues (<code>PriorityQueue</code> in Java),
      Dijkstra and A*, heapsort, job schedulers, and streaming top-k / median problems.
    </>
  ),
  code: [
    "static void push(List<Integer> h, int v) {",
    "  h.add(v);",
    "  int i = h.size() - 1;",
    "  while (i > 0) {",
    "    int p = (i - 1) / 2;",
    "    if (h.get(p) <= h.get(i)) break;",
    "    swap(h, p, i);",
    "    i = p;",
    "  }",
    "}",
    "static int popMin(List<Integer> h) {",
    "  int min = h.get(0);",
    "  h.set(0, h.remove(h.size() - 1));",
    "  int i = 0;",
    "  while (true) {",
    "    int s = i, l = 2*i + 1, r = 2*i + 2;",
    "    if (l < h.size() && h.get(l) < h.get(s)) s = l;",
    "    if (r < h.size() && h.get(r) < h.get(s)) s = r;",
    "    if (s == i) break;",
    "    swap(h, i, s);",
    "    i = s;",
    "  }",
    "  return min;",
    "}",
  ],
  inputs: { kind: "nums", label: "Insert order", defaultValue: "23, 8, 41, 5, 17, 30", max: 10, allowDup: false },
  legend: [
    ["--c-compare", "current"],
    ["--c-pointer", "compared with"],
  ],
  renderer: Tree,
  makeSteps(vals) {
    const h: number[] = [];
    const out: number[] = [];
    const steps: Step<TreeState>[] = [];

    const treeState = (extra: Partial<TreeState> = {}): TreeState => ({
      nodes: h.map((v, i) => ({
        v,
        left: 2 * i + 1 < h.length ? 2 * i + 1 : null,
        right: 2 * i + 2 < h.length ? 2 * i + 2 : null,
      })),
      root: h.length ? 0 : null,
      settled: true,
      ...extra,
    });
    const aux = () => `array: [${h.join(", ")}]${out.length ? ` · extracted: ${out.join(", ")}` : ""}`;
    const snap = (line: number, desc: string, extra: Partial<TreeState> = {}) =>
      steps.push({ line, desc, aux: aux(), state: treeState(extra) });

    for (const v of vals) {
      h.push(v);
      let i = h.length - 1;
      snap(2, `push(${v}): append it at the next free slot (index ${i}) to keep the tree complete.`, { current: i });
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (h[p] <= h[i]) {
          snap(6, `Parent ${h[p]} ≤ ${h[i]} — the heap property holds. ${v} stays put.`, { current: i, alt: [p] });
          break;
        }
        snap(6, `Parent ${h[p]} > ${h[i]} — the min-heap property is violated.`, { current: i, alt: [p] });
        [h[p], h[i]] = [h[i], h[p]];
        snap(7, `Sift up: swap ${v} with ${h[i]}.`, { current: p, alt: [i] });
        i = p;
        if (i === 0) snap(8, `${v} reached the root — it's the new minimum.`, { current: 0 });
      }
    }

    const extracts = Math.min(3, h.length);
    for (let e = 0; e < extracts; e++) {
      const min = h[0];
      snap(12, `popMin() #${e + 1}: the root ${min} is the smallest — that's the O(1) peek.`, { current: 0 });
      const last = h.pop()!;
      if (h.length === 0) {
        out.push(min);
        snap(13, `${min} was the only element — the heap is now empty.`);
        continue;
      }
      h[0] = last;
      out.push(min);
      snap(13, `Remove ${min}; move the LAST element (${last}) into the root to keep the tree complete.`, { current: 0 });
      let i = 0;
      for (;;) {
        let s = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < h.length && h[l] < h[s]) s = l;
        if (r < h.length && h[r] < h[s]) s = r;
        const kids = [l, r].filter((k) => k < h.length);
        if (!kids.length) break;
        if (s === i) {
          snap(19, `${h[i]} is ≤ its child${kids.length > 1 ? "ren" : ""} (${kids.map((k) => h[k]).join(", ")}) — sift-down complete.`, {
            current: i,
            alt: kids,
          });
          break;
        }
        snap(18, `Smallest of {${h[i]}, ${kids.map((k) => h[k]).join(", ")}} is ${h[s]} — the parent must be the smallest.`, {
          current: i,
          alt: kids,
        });
        [h[i], h[s]] = [h[s], h[i]];
        snap(20, `Sift down: swap ${h[s]} with ${h[i]}.`, { current: s, alt: [i] });
        i = s;
      }
      if (h.length === 1) snap(19, `Single element left — nothing to sift.`, { current: 0 });
    }
    snap(23, `Extracted ${out.join(", ")} — always in ascending order. Repeat n times and you've invented heapsort.`);
    return steps;
  },
  quiz: [
    {
      q: "In the array form of a binary heap, where are node i's children?",
      opts: ["2i+1 and 2i+2", "i+1 and i+2", "2i and 2i+1", "i/2 and i/2+1"],
      answer: 0,
      why: "Completeness packs the tree level by level, giving the closed-form child positions 2i+1 and 2i+2 (and parent (i−1)/2).",
    },
    {
      q: "What does extracting the minimum cost, and why?",
      opts: [
        "O(log n) — the replacement sifts down at most the tree's height",
        "O(1) — just remove the root",
        "O(n) — the array shifts",
        "O(n log n)",
      ],
      answer: 0,
      why: "Peeking is O(1), but after moving the last element to the root it may sink one level at a time down a height-log n path.",
    },
    {
      q: "A min-heap guarantees which of the following?",
      opts: [
        "Every parent ≤ its children — but siblings are in no particular order",
        "The array is fully sorted",
        "The left child is always smaller than the right",
        "In-order traversal yields sorted output",
      ],
      answer: 0,
      why: "The heap property is only vertical. That's why heaps are cheaper to maintain than BSTs — and why only the root is guaranteed extreme.",
    },
  ],
};
