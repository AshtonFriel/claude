import { Bars } from "@/components/renderers/Bars";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const countingSort: NumsTopic<BarsState> = {
  id: "counting-sort",
  category: "Sorting Algorithms",
  title: "Counting Sort",
  tagline: "Don't compare — just tally and rebuild",
  complexity: { best: "O(n + k)", avg: "O(n + k)", worst: "O(n + k)", space: "O(k)" },
  about: (
    <>
      <p>
        Counting sort never compares two elements. It tallies how many times each value occurs,
        then walks the tally from smallest value to largest, writing each value back that many
        times. With n elements drawn from k possible values it runs in O(n + k) — beating the
        Ω(n&nbsp;log&nbsp;n) lower bound, which only applies to <em>comparison</em> sorts.
      </p>
      <p>
        The catch is k. Sorting a hundred values spread across a range of a million means a
        million-slot tally, so counting sort only pays when the value range is small and known.
        The tally is shown beneath the array as it fills.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> sorting ages, grades, bytes, pixel intensities, or any
      small-domain key. It is also the stable inner pass of radix sort, which is how you sort large
      integers and strings in linear time.
    </>
  ),
  code: [
    "static int[] countingSort(int[] a, int max) {",
    "  int[] count = new int[max + 1];",
    "  for (int v : a) count[v]++;",
    "  int idx = 0;",
    "  for (int v = 0; v <= max; v++) {",
    "    while (count[v] > 0) {",
    "      a[idx++] = v;",
    "      count[v]--;",
    "    }",
    "  }",
    "  return a;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function countingSort(a, max) {",
      "  const count = new Array(max + 1).fill(0);",
      "  for (const v of a) count[v]++;",
      "  let idx = 0;",
      "  for (let v = 0; v <= max; v++) {",
      "    while (count[v] > 0) {",
      "      a[idx++] = v;",
      "      count[v]--;",
      "    }",
      "  }",
      "  return a;",
      "}",
    ],
  },
  mistakes: [
    "Sizing the tally as new int[max] instead of max + 1 — the largest value overflows the array.",
    "Reaching for it when the value range is huge or unbounded; O(n + k) becomes O(k) in disguise.",
    "Assuming this simple form is stable — it rebuilds values from scratch, so to sort records by key you need the prefix-sum variant that places originals.",
  ],
  interview: [
    "\"Sort an array of ages / grades in linear time\" — counting sort is the expected answer.",
    "\"Sort colors (Dutch national flag)\" — a counting sort with k = 3, or a one-pass three-pointer partition.",
    "\"How can radix sort beat O(n log n)?\" — because its per-digit pass is a stable counting sort.",
  ],
  inputs: { kind: "nums", label: "Array (0–20)", defaultValue: "4, 2, 7, 1, 4, 0, 6, 2", max: 12 },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    if (a.some((v) => v < 0 || v > 20)) {
      throw new Error("Counting sort needs small non-negative values — use 0 to 20.");
    }
    const max = Math.max(...a);
    const count = new Array(max + 1).fill(0);
    const steps: Step<BarsState>[] = [];
    const tally = () => `tally: [${count.map((c, v) => `${v}:${c}`).join("  ")}]`;
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, aux: tally(), state: { a: [...a], ...extra } });

    snap(2, `Values run from 0 to ${max}, so the tally needs ${max + 1} slots, all starting at zero.`);
    for (let i = 0; i < a.length; i++) {
      count[a[i]]++;
      snap(3, `Count a[${i}] = ${a[i]} — slot ${a[i]} of the tally is now ${count[a[i]]}. No comparison happened.`, {
        compare: [i],
      });
    }
    snap(4, "Every element is tallied. Now rebuild the array by walking the tally low to high.");
    let idx = 0;
    const done: number[] = [];
    for (let v = 0; v <= max; v++) {
      if (count[v] === 0) {
        snap(5, `Value ${v} never appeared — skip it.`, { sorted: [...done] });
        continue;
      }
      while (count[v] > 0) {
        a[idx] = v;
        done.push(idx);
        count[v]--;
        snap(7, `Write ${v} into slot ${idx}${count[v] > 0 ? ` — ${count[v]} more to place` : ""}.`, {
          sorted: [...done],
          swapped: [idx],
        });
        idx++;
      }
    }
    snap(10, `Sorted in O(n + k) with zero comparisons.`, { done: true });
    return steps;
  },
  quiz: [
    {
      q: "How does counting sort beat the Ω(n log n) lower bound for sorting?",
      opts: [
        "That bound only applies to comparison sorts, and counting sort never compares elements",
        "It uses a faster comparison operator",
        "It only works on sorted input",
        "It doesn't — the bound is universal",
      ],
      answer: 0,
      why: "The decision-tree argument bounds algorithms that learn order by comparing. Counting sort learns order from the values themselves, used directly as indices.",
    },
    {
      q: "When is counting sort a bad choice?",
      opts: [
        "When the range of values k is much larger than the element count n",
        "When the array is already sorted",
        "When there are duplicate values",
        "When n is large",
      ],
      answer: 0,
      why: "The tally has one slot per possible value. Sorting 100 numbers ranging over a million allocates a million slots — O(n + k) is dominated by k.",
    },
    {
      q: "Which algorithm uses counting sort as its inner pass?",
      opts: ["Radix sort", "Merge sort", "Quick sort", "Binary search"],
      answer: 0,
      why: "Radix sort runs a stable counting sort per digit, from least significant to most, sorting large integers in linear time.",
    },
  ],
};
