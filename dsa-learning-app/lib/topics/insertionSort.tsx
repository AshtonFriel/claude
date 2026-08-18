import { Bars } from "@/components/renderers/Bars";
import { randomArray } from "@/lib/parse";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const insertionSort: NumsTopic<BarsState> = {
  id: "insertion-sort",
  category: "Sorting Algorithms",
  title: "Insertion Sort",
  tagline: "Build a sorted prefix, one card at a time",
  complexity: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  about: (
    <p>
      Insertion sort grows a sorted region on the left, one element per pass. It lifts the next
      element out as <code>key</code>, slides every larger element in the sorted region one slot
      right, and drops the key into the gap — exactly how people sort a hand of cards. Because it
      stops sliding the moment it meets a smaller value, nearly-sorted input costs almost nothing:
      O(n).
    </p>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the base case inside industrial sorts — Timsort and
      introsort both switch to insertion sort for small runs, because its low overhead beats
      recursion below ~16 elements. Also the natural choice for streaming data that arrives almost
      in order.
    </>
  ),
  code: [
    "static int[] insertionSort(int[] a) {",
    "  for (int i = 1; i < a.length; i++) {",
    "    int key = a[i];",
    "    int j = i - 1;",
    "    while (j >= 0 && a[j] > key) {",
    "      a[j + 1] = a[j];",
    "      j--;",
    "    }",
    "    a[j + 1] = key;",
    "  }",
    "  return a;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function insertionSort(a) {",
      "  for (let i = 1; i < a.length; i++) {",
      "    const key = a[i];",
      "    let j = i - 1;",
      "    while (j >= 0 && a[j] > key) {",
      "      a[j + 1] = a[j];",
      "      j--;",
      "    }",
      "    a[j + 1] = key;",
      "  }",
      "  return a;",
      "}",
    ],
  },
  mistakes: [
    "Starting the outer loop at i = 0 — the first element is already a sorted region of one, and a[-1] is out of bounds.",
    "Checking a[j] > key after decrementing j, which skips a comparison and leaves the key one slot too far left.",
    "Swapping repeatedly instead of shifting; a shift writes once per move, a swap writes three times.",
  ],
  interview: [
    "\"Sort a nearly-sorted (k-sorted) array\" — insertion sort is O(n·k) here and beats O(n log n).",
    "\"Insertion sort a linked list\" — a LeetCode classic.",
    "\"Why does Timsort fall back to insertion sort?\" — constant factors below small n.",
  ],
  chart: { sizes: [4, 8, 12, 16, 20, 24], genInput: (n) => randomArray(n) },
  inputs: { kind: "nums", label: "Array", defaultValue: "23, 7, 41, 15, 62, 9, 30" },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    const steps: Step<BarsState>[] = [];
    const sortedIdx = () => Array.from({ length: a.length }, (_, k) => k);
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], ...extra } });

    snap(2, "Element 0 alone counts as a sorted region. Everything to its right still has to be placed.", {
      sorted: [0],
    });
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      snap(3, `Lift a[${i}] = ${key} out as the key, leaving a gap to slide into.`, {
        sorted: Array.from({ length: i }, (_, k) => k),
        compare: [i],
      });
      let j = i - 1;
      while (j >= 0 && a[j] > key) {
        snap(5, `a[${j}] = ${a[j]} is bigger than the key ${key} — it has to move right.`, {
          sorted: Array.from({ length: i }, (_, k) => k),
          compare: [j],
        });
        a[j + 1] = a[j];
        snap(6, `Slide ${a[j]} into slot ${j + 1}. The gap moves left.`, {
          sorted: Array.from({ length: i }, (_, k) => k),
          swapped: [j + 1],
        });
        j--;
      }
      if (j >= 0) {
        snap(5, `a[${j}] = ${a[j]} is not bigger than ${key} — stop sliding, the spot is found.`, {
          sorted: Array.from({ length: i }, (_, k) => k),
          compare: [j],
        });
      }
      a[j + 1] = key;
      snap(9, `Drop the key ${key} into slot ${j + 1}. The sorted region is now ${i + 1} long.`, {
        sorted: Array.from({ length: i + 1 }, (_, k) => k),
        swapped: [j + 1],
      });
    }
    snap(11, "Every element has been inserted — the array is sorted.", { sorted: sortedIdx(), done: true });
    return steps;
  },
  quiz: [
    {
      q: "On an already-sorted array, what does insertion sort cost?",
      opts: ["O(n) — the inner while loop never runs", "O(n log n)", "O(n²) regardless", "O(1)"],
      answer: 0,
      why: "Each key is immediately ≥ its left neighbour, so the while condition fails on the first test: n−1 comparisons, zero shifts.",
    },
    {
      q: "Why do Timsort and introsort switch to insertion sort for small subarrays?",
      opts: [
        "Its low constant overhead beats recursion below roughly 16 elements",
        "It is asymptotically faster than merge sort",
        "It uses less memory than any other sort",
        "It is the only stable sort available",
      ],
      answer: 0,
      why: "Big-O hides constants. For tiny n the recursion, partitioning and buffer costs of the fancier sorts dominate their asymptotic edge.",
    },
    {
      q: "Insertion sort shifts elements rather than swapping them. Why does that matter?",
      opts: [
        "A shift performs one write per moved element; a swap performs three",
        "Shifting changes the algorithm's complexity class",
        "Swapping would break stability",
        "It doesn't — they're identical",
      ],
      answer: 0,
      why: "The key is held in a temporary, so each displaced element is copied once and the key is written once at the end.",
    },
  ],
};
