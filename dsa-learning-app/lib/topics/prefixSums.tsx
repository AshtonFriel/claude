import { Cells } from "@/components/renderers/Cells";
import { parseIntField } from "@/lib/parse";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const prefixSums: NumsTopic<CellsState> = {
  id: "prefix-sums",
  category: "Arrays",
  title: "Prefix Sums",
  tagline: "Pay O(n) once, answer range sums in O(1) forever",
  complexity: { best: "O(n) build", avg: "O(1) query", worst: "O(n) build", space: "O(n)" },
  about: (
    <>
      <p>
        Summing a range a[l..r] naively costs O(r − l). If you have to answer many such queries
        that adds up fast. A <em>prefix sum</em> array precomputes it: <code>p[i]</code> holds the
        sum of everything before index i. Then any range sum is a single subtraction —{" "}
        <code>p[r+1] − p[l]</code> — because the shared prefix cancels out.
      </p>
      <p>
        This run builds the prefix array, then answers one range query with it. Note that p has
        n + 1 entries: the leading 0 is what makes l = 0 work without a special case.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> range-sum queries, subarray-sum-equals-k (with a hash map),
      2-D image integral tables, difference arrays for bulk range updates, and any problem where
      the same aggregate is recomputed inside a loop.
    </>
  ),
  code: [
    "static int[] buildPrefix(int[] a) {",
    "  int[] p = new int[a.length + 1];",
    "  for (int i = 0; i < a.length; i++) {",
    "    p[i + 1] = p[i] + a[i];",
    "  }",
    "  return p;",
    "}",
    "static int rangeSum(int[] p, int l, int r) {",
    "  return p[r + 1] - p[l];",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function buildPrefix(a) {",
      "  const p = new Array(a.length + 1).fill(0);",
      "  for (let i = 0; i < a.length; i++) {",
      "    p[i + 1] = p[i] + a[i];",
      "  }",
      "  return p;",
      "}",
      "function rangeSum(p, l, r) {",
      "  return p[r + 1] - p[l];",
      "}",
    ],
  },
  mistakes: [
    "Sizing p as n instead of n + 1, then needing an if-statement for l = 0 — the leading zero exists precisely to avoid that.",
    "Writing p[r] − p[l] instead of p[r + 1] − p[l], which silently drops the last element of the range.",
    "Rebuilding the prefix array after every update; if values change often you want a Fenwick or segment tree instead.",
  ],
  interview: [
    "\"Range sum query — immutable\" — this exact structure.",
    "\"Subarray sum equals k\" — prefix sums plus a hash map of seen prefixes.",
    "\"Product of array except self\" — the same idea run as prefix and suffix products.",
  ],
  inputs: {
    kind: "nums",
    label: "Array",
    defaultValue: "3, 1, 4, 1, 5, 9, 2",
    max: 10,
    extraField: { label: "Sum l..r", defaultValue: "2" },
  },
  legend: [
    ["--c-compare", "cell being computed"],
    ["--c-pointer", "cells it reads"],
    ["--c-done", "query result"],
  ],
  renderer: Cells,
  makeSteps(a, extra) {
    const n = a.length;
    const l = parseIntField(extra, "Range start l", 0, n - 1);
    const r = Math.min(n - 1, l + 3);
    const p = new Array(n + 1).fill(0);
    const steps: Step<CellsState>[] = [];
    const cells = () => p.map((v, i) => (i === 0 || v !== 0 || i <= filled ? String(v) : "·"));
    let filled = 0;
    const snap = (line: number, desc: string, extra2: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `input: [${a.join(", ")}]`,
        state: { a: cells(), ...extra2 },
      });

    snap(2, `Build p with ${n + 1} slots. p[0] = 0 — the sum of nothing — which is what makes l = 0 need no special case.`, {
      done: [0],
    });
    for (let i = 0; i < n; i++) {
      p[i + 1] = p[i] + a[i];
      filled = i + 1;
      snap(4, `p[${i + 1}] = p[${i}] + a[${i}] = ${p[i]} + ${a[i]} = ${p[i + 1]}.`, {
        active: [i + 1],
        compare: [i],
      });
    }
    snap(6, `The prefix array is built in one O(n) pass. Every range sum is now a single subtraction.`, {
      done: p.map((_, i) => i),
    });
    const want = p[r + 1] - p[l];
    snap(9, `Query a[${l}..${r}]: p[${r + 1}] − p[${l}] = ${p[r + 1]} − ${p[l]} = ${want}. The shared prefix cancels.`, {
      compare: [l, r + 1],
    });
    snap(9, `Answer: the elements a[${l}..${r}] sum to ${want} — found in O(1), no matter how long the range is.`, {
      done: [l, r + 1],
    });
    return steps;
  },
  quiz: [
    {
      q: "Why does the prefix array have n + 1 entries rather than n?",
      opts: [
        "The leading p[0] = 0 lets the formula work when the range starts at index 0",
        "To store the total twice",
        "For cache alignment",
        "It doesn't — n entries is standard",
      ],
      answer: 0,
      why: "With p[r+1] − p[l], a query starting at l = 0 subtracts p[0]. Without the leading zero that read is out of bounds and needs a branch.",
    },
    {
      q: "After building the prefix array, what does a single range-sum query cost?",
      opts: ["O(1)", "O(log n)", "O(n)", "O(r − l)"],
      answer: 0,
      why: "One array read, one array read, one subtraction — independent of how wide the range is. The O(n) cost was paid once at build time.",
    },
    {
      q: "The array's values change frequently between queries. What should you use instead?",
      opts: [
        "A Fenwick (binary indexed) tree or segment tree — O(log n) update and query",
        "A plain prefix array, rebuilt each time",
        "A hash map",
        "A sorted array with binary search",
      ],
      answer: 0,
      why: "A prefix array makes updates O(n) because every later entry shifts. Fenwick and segment trees trade O(1) queries for O(log n) on both operations.",
    },
  ],
};
