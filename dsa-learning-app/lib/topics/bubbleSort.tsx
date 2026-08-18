import { Bars } from "@/components/renderers/Bars";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const bubbleSort: NumsTopic<BarsState> = {
  id: "bubble-sort",
  category: "Sorting Algorithms",
  title: "Bubble Sort",
  tagline: "Adjacent swaps until nothing moves",
  complexity: { best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  about: (
    <p>
      Bubble sort repeatedly walks the array, comparing each pair of neighbours and swapping them
      when they&apos;re out of order. After each pass the largest remaining value has
      &ldquo;bubbled&rdquo; to its final position on the right, so the unsorted region shrinks by
      one. If a whole pass finishes with no swaps, the array is sorted and the algorithm exits
      early.
    </p>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> almost never in production — but it&apos;s the classic
      first sorting algorithm because every operation is visible. The early-exit trick makes it
      O(n) on already-sorted input, which is a nice intro to best-case analysis.
    </>
  ),
  code: [
    "static int[] bubbleSort(int[] a) {",
    "  int n = a.length;",
    "  for (int i = 0; i < n - 1; i++) {",
    "    boolean swapped = false;",
    "    for (int j = 0; j < n - 1 - i; j++) {",
    "      if (a[j] > a[j + 1]) {",
    "        swap(a, j, j + 1);",
    "        swapped = true;",
    "      }",
    "    }",
    "    if (!swapped) break;",
    "  }",
    "  return a;",
    "}",
  ],
  inputs: { kind: "nums", label: "Array", defaultValue: "29, 10, 14, 37, 13, 8, 21" },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    const n = a.length;
    const steps: Step<BarsState>[] = [];
    const sorted: number[] = [];
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], sorted: [...sorted], ...extra } });

    snap(2, `Start with ${n} elements. Nothing is in its final place yet.`);
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      snap(3, `Pass ${i + 1}: walk the unsorted region and bubble its largest value to the right.`);
      for (let j = 0; j < n - 1 - i; j++) {
        snap(6, `Compare a[${j}] = ${a[j]} with a[${j + 1}] = ${a[j + 1]}.`, { compare: [j, j + 1] });
        if (a[j] > a[j + 1]) {
          const x = a[j];
          const y = a[j + 1];
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          snap(7, `${x} > ${y}, so swap them.`, { swapped: [j, j + 1] });
          swapped = true;
        }
      }
      sorted.push(n - 1 - i);
      if (!swapped) {
        snap(11, "No swaps in that whole pass — everything is already in order. Exit early.");
        break;
      }
      snap(5, `End of pass ${i + 1}: a[${n - 1 - i}] = ${a[n - 1 - i]} is locked into its final position.`);
    }
    snap(13, "Done — the array is sorted.", { done: true });
    return steps;
  },
  quiz: [
    {
      q: "What is the worst-case time complexity of bubble sort on n elements?",
      opts: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
      answer: 2,
      why: "A reversed array forces a swap at nearly every comparison: about n passes of about n comparisons each, so O(n²).",
    },
    {
      q: "Starting with [4, 2, 3, 1], what does the array look like after one full pass?",
      opts: ["[2, 3, 1, 4]", "[1, 2, 3, 4]", "[2, 4, 3, 1]", "[4, 2, 3, 1]"],
      answer: 0,
      why: "4 swaps rightward past 2, 3 and 1, ending in the last slot: [2, 3, 1, 4]. One pass only guarantees the largest value lands.",
    },
    {
      q: "With the “swapped” early-exit flag, what is the best-case complexity — and when does it happen?",
      opts: [
        "O(1), on an empty array only",
        "O(n), when the input is already sorted",
        "O(n log n), on random input",
        "O(n²) — the flag never helps",
      ],
      answer: 1,
      why: "On sorted input the first pass makes n−1 comparisons, no swaps, and the flag breaks the loop: linear time.",
    },
  ],
};
