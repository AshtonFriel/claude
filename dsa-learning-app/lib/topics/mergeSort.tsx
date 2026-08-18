import { Bars } from "@/components/renderers/Bars";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const mergeSort: NumsTopic<BarsState> = {
  id: "merge-sort",
  category: "Sorting Algorithms",
  title: "Merge Sort",
  tagline: "Split in half, sort each half, merge",
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)" },
  about: (
    <p>
      Merge sort is divide &amp; conquer: split the array in half, recursively sort each half,
      then <em>merge</em> the two sorted halves by repeatedly taking the smaller front element.
      The recursion is log&nbsp;n levels deep and each level does O(n) merging work, giving a
      guaranteed O(n&nbsp;log&nbsp;n) — no lucky or unlucky inputs.
    </p>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> stable sorting in standard libraries (it never reorders
      equal elements), sorting linked lists, and external sorting of files too big for memory.
      The trade-off is the O(n) temporary buffer used while merging.
    </>
  ),
  code: [
    "static void mergeSort(int[] a, int lo, int hi) {",
    "  if (lo >= hi) return;",
    "  int mid = (lo + hi) / 2;",
    "  mergeSort(a, lo, mid);",
    "  mergeSort(a, mid + 1, hi);",
    "  merge(a, lo, mid, hi);",
    "}",
    "static void merge(int[] a, int lo, int mid, int hi) {",
    "  int[] tmp = new int[hi - lo + 1];",
    "  int i = lo, j = mid + 1, k = 0;",
    "  while (i <= mid && j <= hi)",
    "    tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];",
    "  while (i <= mid) tmp[k++] = a[i++];",
    "  while (j <= hi) tmp[k++] = a[j++];",
    "  for (k = 0; k < tmp.length; k++)",
    "    a[lo + k] = tmp[k];",
    "}",
  ],
  inputs: { kind: "nums", label: "Array", defaultValue: "38, 27, 43, 3, 9, 82, 10" },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    const steps: Step<BarsState>[] = [];
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], ...extra } });

    snap(1, "Recursively split the array, then merge sorted halves back together.", {
      range: [0, a.length - 1],
    });
    const ms = (lo: number, hi: number) => {
      if (lo >= hi) {
        snap(2, `[${lo}..${hi}] is a single element (${a[lo]}) — trivially sorted.`, { range: [lo, hi] });
        return;
      }
      const mid = (lo + hi) >> 1;
      snap(3, `Split [${lo}..${hi}] into [${lo}..${mid}] and [${mid + 1}..${hi}].`, { range: [lo, hi] });
      ms(lo, mid);
      ms(mid + 1, hi);
      snap(6, `Both halves of [${lo}..${hi}] are sorted — merge them.`, { range: [lo, hi] });
      const tmp: number[] = [];
      let i = lo;
      let j = mid + 1;
      while (i <= mid && j <= hi) {
        snap(12, `Compare front elements ${a[i]} and ${a[j]} — take the smaller into the buffer.`, {
          range: [lo, hi],
          compare: [i, j],
        });
        tmp.push(a[i] <= a[j] ? a[i++] : a[j++]);
      }
      while (i <= mid) {
        snap(13, `Right half is exhausted — copy leftover ${a[i]} across.`, { range: [lo, hi], compare: [i] });
        tmp.push(a[i++]);
      }
      while (j <= hi) {
        snap(14, `Left half is exhausted — copy leftover ${a[j]} across.`, { range: [lo, hi], compare: [j] });
        tmp.push(a[j++]);
      }
      for (let k = 0; k < tmp.length; k++) {
        a[lo + k] = tmp[k];
        snap(16, `Write ${tmp[k]} back into position ${lo + k}.`, { range: [lo, hi], swapped: [lo + k] });
      }
    };
    ms(0, a.length - 1);
    snap(6, "Final merge complete — the whole array is sorted.", { done: true });
    return steps;
  },
  quiz: [
    {
      q: "What is merge sort’s time complexity in the worst case?",
      opts: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
      answer: 1,
      why: "The array always splits into log n levels, and every level does O(n) merge work — no input can make it worse.",
    },
    {
      q: "How much extra space does the classic array merge sort need?",
      opts: ["O(1)", "O(log n) only", "O(n) for the merge buffer", "O(n²)"],
      answer: 2,
      why: "Merging two halves requires a temporary buffer proportional to the range being merged — O(n) at the top level.",
    },
    {
      q: "Merging sorted halves [1, 4] and [2, 3]: which values are placed first and second?",
      opts: ["1 then 2", "1 then 4", "2 then 1", "2 then 3"],
      answer: 0,
      why: "Compare fronts: 1 vs 2 → take 1. Then 4 vs 2 → take 2. The buffer starts [1, 2].",
    },
  ],
};
