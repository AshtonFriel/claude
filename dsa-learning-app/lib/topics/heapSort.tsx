import { Bars } from "@/components/renderers/Bars";
import { randomArray } from "@/lib/parse";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const heapSort: NumsTopic<BarsState> = {
  id: "heap-sort",
  category: "Sorting Algorithms",
  title: "Heap Sort",
  tagline: "Heapify, then pull the max off the top n times",
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
  about: (
    <>
      <p>
        Heap sort is selection sort with a better search. First it <em>heapifies</em> the array in
        place — bottom-up sifting turns it into a max-heap in O(n). Then it repeatedly swaps the
        root (the maximum) with the last unsorted slot and sifts the new root down, shrinking the
        heap by one each time. The sorted region grows from the right.
      </p>
      <p>
        It is the only common sort that is both O(n&nbsp;log&nbsp;n) in the worst case and O(1) in
        space — merge sort needs a buffer, quick sort can degrade to O(n²).
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the safety net inside introsort — when quick sort&apos;s
      recursion goes too deep, the standard library switches to heap sort to guarantee
      O(n&nbsp;log&nbsp;n). Also embedded and real-time systems, where a hard worst-case bound and
      zero allocation matter more than raw average speed.
    </>
  ),
  code: [
    "static int[] heapSort(int[] a) {",
    "  int n = a.length;",
    "  for (int i = n / 2 - 1; i >= 0; i--)",
    "    siftDown(a, i, n);",
    "  for (int end = n - 1; end > 0; end--) {",
    "    swap(a, 0, end);",
    "    siftDown(a, 0, end);",
    "  }",
    "  return a;",
    "}",
    "static void siftDown(int[] a, int i, int n) {",
    "  while (2 * i + 1 < n) {",
    "    int c = 2 * i + 1;",
    "    if (c + 1 < n && a[c + 1] > a[c]) c++;",
    "    if (a[i] >= a[c]) return;",
    "    swap(a, i, c);",
    "    i = c;",
    "  }",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function heapSort(a) {",
      "  const n = a.length;",
      "  for (let i = (n >> 1) - 1; i >= 0; i--)",
      "    siftDown(a, i, n);",
      "  for (let end = n - 1; end > 0; end--) {",
      "    swap(a, 0, end);",
      "    siftDown(a, 0, end);",
      "  }",
      "  return a;",
      "}",
      "function siftDown(a, i, n) {",
      "  while (2 * i + 1 < n) {",
      "    let c = 2 * i + 1;",
      "    if (c + 1 < n && a[c + 1] > a[c]) c++;",
      "    if (a[i] >= a[c]) return;",
      "    swap(a, i, c);",
      "    i = c;",
      "  }",
      "}",
    ],
  },
  mistakes: [
    "Building the heap top-down from index 0 — that's O(n log n); the bottom-up loop from n/2 − 1 is O(n).",
    "Passing the original n to siftDown during the extraction phase, which drags already-sorted elements back into the heap.",
    "Sifting down against only the left child instead of the larger of the two.",
  ],
  interview: [
    "\"Sort in O(n log n) worst case with O(1) extra space\" — heap sort is the answer.",
    "\"Why does introsort fall back to heap sort?\" — to cap quick sort's O(n²) worst case.",
    "\"Build a heap from an array in O(n)\" — the bottom-up heapify argument.",
  ],
  chart: { sizes: [4, 8, 12, 16, 20, 24], genInput: (n) => randomArray(n) },
  inputs: { kind: "nums", label: "Array", defaultValue: "19, 46, 8, 33, 57, 24, 11" },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    const n = a.length;
    const steps: Step<BarsState>[] = [];
    const sorted: number[] = [];
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], sorted: [...sorted], ...extra } });

    const siftDown = (i: number, size: number) => {
      for (;;) {
        const l = 2 * i + 1;
        if (l >= size) return;
        let c = l;
        const r = l + 1;
        if (r < size && a[r] > a[l]) {
          c = r;
          snap(14, `Children of index ${i} are ${a[l]} and ${a[r]} — the right child is larger.`, {
            compare: [i],
            pivot: c,
            range: [0, size - 1],
          });
        } else {
          snap(13, `The larger (or only) child of index ${i} is ${a[c]}.`, {
            compare: [i],
            pivot: c,
            range: [0, size - 1],
          });
        }
        if (a[i] >= a[c]) {
          snap(15, `${a[i]} is already ≥ its largest child ${a[c]} — the heap property holds here.`, {
            compare: [i],
            range: [0, size - 1],
          });
          return;
        }
        [a[i], a[c]] = [a[c], a[i]];
        snap(16, `${a[c]} was smaller than ${a[i]} — swap so the larger value rises.`, {
          swapped: [i, c],
          range: [0, size - 1],
        });
        i = c;
      }
    };

    snap(2, `Phase 1: turn the array into a max-heap in place, working bottom-up from the last parent.`);
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      snap(4, `Sift down from index ${i} — every node below it is already a valid heap.`, {
        compare: [i],
        range: [0, n - 1],
      });
      siftDown(i, n);
    }
    snap(5, `The array is now a max-heap: the largest value, ${a[0]}, sits at the root.`, { range: [0, n - 1] });

    for (let end = n - 1; end > 0; end--) {
      const top = a[0];
      [a[0], a[end]] = [a[end], a[0]];
      sorted.push(end);
      snap(6, `Swap the root ${top} into slot ${end} — it is now permanently in place.`, {
        swapped: [0, end],
      });
      snap(7, `Shrink the heap to ${end} elements and sift the new root ${a[0]} back down.`, {
        compare: [0],
        range: [0, end - 1],
      });
      siftDown(0, end);
    }
    sorted.push(0);
    snap(9, "The heap is empty — the array is sorted, using no extra memory.", { done: true });
    return steps;
  },
  quiz: [
    {
      q: "What makes heap sort unique among the common O(n log n) sorts?",
      opts: [
        "It is O(n log n) in the worst case AND O(1) in space",
        "It is the fastest in practice",
        "It is stable",
        "It requires no comparisons",
      ],
      answer: 0,
      why: "Merge sort needs an O(n) buffer and quick sort can hit O(n²). Heap sort gives a hard worst-case bound in place — at the cost of poor cache locality.",
    },
    {
      q: "Why does the bottom-up heapify loop start at index n/2 − 1?",
      opts: [
        "Everything past it is a leaf, and a leaf is already a valid heap",
        "It is the middle of the array",
        "To skip the root",
        "To guarantee stability",
      ],
      answer: 0,
      why: "Indices from n/2 onward have no children, so only the internal nodes need sifting — which is also why heapify is O(n), not O(n log n).",
    },
    {
      q: "During extraction, the root is swapped with the last element of the heap. What happens next?",
      opts: [
        "The heap size shrinks by one and the new root is sifted down",
        "The whole array is re-heapified from scratch",
        "The array is sorted immediately",
        "The new root is sifted up",
      ],
      answer: 0,
      why: "That extracted maximum is now in its final position, so it leaves the heap; one sift-down of O(log n) restores the heap property.",
    },
  ],
};
