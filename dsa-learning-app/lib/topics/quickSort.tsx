import { Bars } from "@/components/renderers/Bars";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const quickSort: NumsTopic<BarsState> = {
  id: "quick-sort",
  category: "Sorting Algorithms",
  title: "Quick Sort",
  tagline: "Partition around a pivot, recurse on both sides",
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)" },
  about: (
    <p>
      Quick sort picks a <em>pivot</em> (here: the last element) and partitions the range so
      everything smaller sits to the pivot&apos;s left and everything larger to its right. That
      drops the pivot into its final position, and the two sides are sorted recursively. On
      average the pivot splits the range roughly in half — O(n&nbsp;log&nbsp;n) — but a
      consistently terrible pivot (e.g. sorted input with a last-element pivot) degrades it to
      O(n²).
    </p>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the workhorse behind many standard-library sorts (usually
      as introsort — quick sort with safeguards). In-place, cache-friendly, and typically the
      fastest comparison sort in practice.
    </>
  ),
  code: [
    "static void quickSort(int[] a, int lo, int hi) {",
    "  if (lo >= hi) return;",
    "  int p = partition(a, lo, hi);",
    "  quickSort(a, lo, p - 1);",
    "  quickSort(a, p + 1, hi);",
    "}",
    "static int partition(int[] a, int lo, int hi) {",
    "  int pivot = a[hi];",
    "  int i = lo;",
    "  for (int j = lo; j < hi; j++) {",
    "    if (a[j] < pivot) {",
    "      swap(a, i, j);",
    "      i++;",
    "    }",
    "  }",
    "  swap(a, i, hi);",
    "  return i;",
    "}",
  ],
  inputs: { kind: "nums", label: "Array", defaultValue: "33, 76, 12, 51, 8, 44, 27" },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    const steps: Step<BarsState>[] = [];
    const sorted: number[] = [];
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], sorted: [...sorted], ...extra } });

    snap(1, "Sort by partitioning each range around a pivot.", { range: [0, a.length - 1] });
    const qs = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        sorted.push(lo);
        snap(2, `[${lo}..${hi}] is a single element (${a[lo]}) — it's already in place.`);
        return;
      }
      snap(8, `Partition [${lo}..${hi}]: choose the last element, a[${hi}] = ${a[hi]}, as pivot.`, {
        range: [lo, hi],
        pivot: hi,
      });
      let i = lo;
      const pivotVal = a[hi];
      for (let j = lo; j < hi; j++) {
        snap(11, `Is a[${j}] = ${a[j]} smaller than pivot ${pivotVal}?`, {
          range: [lo, hi],
          pivot: hi,
          compare: [j],
        });
        if (a[j] < pivotVal) {
          if (i !== j) {
            const x = a[i];
            const y = a[j];
            [a[i], a[j]] = [a[j], a[i]];
            snap(12, `Yes — swap ${y} and ${x} so ${y} joins the "smaller than pivot" zone.`, {
              range: [lo, hi],
              pivot: hi,
              swapped: [i, j],
            });
          } else {
            snap(13, "Yes — it's already at the zone boundary, just advance i.", {
              range: [lo, hi],
              pivot: hi,
              compare: [j],
            });
          }
          i++;
        }
      }
      [a[i], a[hi]] = [a[hi], a[i]];
      sorted.push(i);
      snap(16, `Swap the pivot into the boundary: ${pivotVal} lands in its final position, index ${i}.`, {
        range: [lo, hi],
        swapped: [i, hi],
      });
      qs(lo, i - 1);
      qs(i + 1, hi);
    };
    qs(0, a.length - 1);
    snap(5, "Every pivot has landed — the array is sorted.", { done: true });
    return steps;
  },
  quiz: [
    {
      q: "What input makes last-element-pivot quick sort hit its O(n²) worst case?",
      opts: ["Random input", "Already-sorted input", "All values equal to zero", "Input of odd length"],
      answer: 1,
      why: "On sorted input the last element is always the maximum, so every partition splits into sizes n−1 and 0 — n levels of O(n) work.",
    },
    {
      q: "What is guaranteed about the pivot immediately after one partition call?",
      opts: [
        "It is the median of the range",
        "It sits in its final sorted position",
        "It is the smallest element",
        "Nothing until recursion finishes",
      ],
      answer: 1,
      why: "Partitioning puts all smaller values left of the pivot and all larger values right — exactly its place in the final order.",
    },
    {
      q: "What is quick sort’s average-case time complexity?",
      opts: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      answer: 1,
      why: "On average the pivot splits ranges reasonably evenly, giving about log n levels of O(n) partitioning.",
    },
  ],
};
