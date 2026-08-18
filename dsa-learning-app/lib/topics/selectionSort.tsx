import { Bars } from "@/components/renderers/Bars";
import { randomArray } from "@/lib/parse";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { SORT_LEGEND } from "./legends";

export const selectionSort: NumsTopic<BarsState> = {
  id: "selection-sort",
  category: "Sorting Algorithms",
  title: "Selection Sort",
  tagline: "Find the smallest, put it in front, repeat",
  complexity: { best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)" },
  about: (
    <p>
      Selection sort scans the unsorted region for its minimum, then swaps that minimum into the
      boundary position. One pass places exactly one element permanently. Unlike bubble and
      insertion sort it has no early exit — the scan must finish to know the minimum — so even
      sorted input costs O(n²) comparisons. Its redeeming feature is <em>writes</em>: exactly n−1
      swaps, the fewest of any comparison sort.
    </p>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> situations where writing is far more expensive than reading —
      EEPROM and flash memory with limited write cycles. Otherwise it&apos;s mostly a teaching
      algorithm and the intuition behind heap sort, which replaces the linear scan with a heap.
    </>
  ),
  code: [
    "static int[] selectionSort(int[] a) {",
    "  int n = a.length;",
    "  for (int i = 0; i < n - 1; i++) {",
    "    int min = i;",
    "    for (int j = i + 1; j < n; j++) {",
    "      if (a[j] < a[min]) min = j;",
    "    }",
    "    swap(a, i, min);",
    "  }",
    "  return a;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function selectionSort(a) {",
      "  const n = a.length;",
      "  for (let i = 0; i < n - 1; i++) {",
      "    let min = i;",
      "    for (let j = i + 1; j < n; j++) {",
      "      if (a[j] < a[min]) min = j;",
      "    }",
      "    swap(a, i, min);",
      "  }",
      "  return a;",
      "}",
    ],
  },
  mistakes: [
    "Tracking the minimum *value* instead of its index — you then have nothing to swap with.",
    "Resetting min = i inside the inner loop rather than before it.",
    "Expecting an early exit on sorted input; unlike bubble sort there is none, so best case is still O(n²).",
  ],
  interview: [
    "\"Which sort minimises the number of writes?\" — selection sort, at exactly n−1 swaps.",
    "\"Turn selection sort into an O(n log n) sort\" — replace the scan with a heap; that's heap sort.",
    "\"Is selection sort stable?\" — the long-swap version isn't; explaining why is the real question.",
  ],
  chart: { sizes: [4, 8, 12, 16, 20, 24], genInput: (n) => randomArray(n) },
  inputs: { kind: "nums", label: "Array", defaultValue: "38, 12, 55, 7, 44, 21, 63" },
  legend: SORT_LEGEND,
  renderer: Bars,
  makeSteps(a0) {
    const a = [...a0];
    const n = a.length;
    const steps: Step<BarsState>[] = [];
    const sorted: number[] = [];
    const snap = (line: number, desc: string, extra: Partial<BarsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], sorted: [...sorted], ...extra } });

    snap(2, `Sort ${n} elements by repeatedly selecting the smallest remaining value.`);
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      snap(4, `Pass ${i + 1}: assume a[${i}] = ${a[i]} is the smallest of the unsorted region.`, {
        pivot: min,
        range: [i, n - 1],
      });
      for (let j = i + 1; j < n; j++) {
        snap(6, `Is a[${j}] = ${a[j]} smaller than the current minimum ${a[min]}?`, {
          pivot: min,
          compare: [j],
          range: [i, n - 1],
        });
        if (a[j] < a[min]) {
          min = j;
          snap(6, `Yes — a[${j}] = ${a[j]} is the new smallest so far.`, { pivot: min, range: [i, n - 1] });
        }
      }
      if (min !== i) {
        const x = a[i];
        [a[i], a[min]] = [a[min], a[i]];
        snap(8, `Swap the minimum ${a[i]} into position ${i}, sending ${x} back into the unsorted region.`, {
          swapped: [i, min],
          range: [i, n - 1],
        });
      } else {
        snap(8, `a[${i}] = ${a[i]} was already the minimum — no swap needed.`, { range: [i, n - 1] });
      }
      sorted.push(i);
    }
    sorted.push(n - 1);
    snap(10, "Only one element remained, so it is already in place — the array is sorted.", { done: true });
    return steps;
  },
  quiz: [
    {
      q: "How many swaps does selection sort perform on an array of n elements?",
      opts: ["At most n − 1", "About n² / 2", "About n log n", "It varies with the input"],
      answer: 0,
      why: "Each outer pass performs at most one swap and there are n−1 passes — which is why it wins when writes are expensive.",
    },
    {
      q: "Why is selection sort's best case still O(n²)?",
      opts: [
        "The inner scan must always run to completion to prove which element is smallest",
        "Because it always swaps every element",
        "Because it uses recursion",
        "It isn't — sorted input is O(n)",
      ],
      answer: 0,
      why: "Unlike bubble sort's swapped flag or insertion sort's early break, nothing about a sorted array lets the scan stop early.",
    },
    {
      q: "Which algorithm is selection sort's direct O(n log n) upgrade?",
      opts: [
        "Heap sort — a heap finds the extreme in O(log n) instead of O(n)",
        "Merge sort",
        "Counting sort",
        "Binary search",
      ],
      answer: 0,
      why: "Heap sort keeps the same select-the-extreme-and-place-it structure, but replaces the linear scan with a heap.",
    },
  ],
};
