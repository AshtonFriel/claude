import { Cells } from "@/components/renderers/Cells";
import { parseIntField } from "@/lib/parse";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const twoPointers: NumsTopic<CellsState> = {
  id: "two-pointers",
  category: "Arrays",
  title: "Two Pointers",
  tagline: "Squeeze a sorted array from both ends",
  complexity: { best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  about: (
    <>
      <p>
        The two-pointer technique walks a <em>sorted</em> array from both ends at once. For the
        classic pair-sum problem: if the current sum is too small, only moving the left pointer
        right can increase it; if too big, only moving the right pointer left can decrease it.
        Every step safely discards one element, so the whole array is processed in a single
        linear pass — no nested loops.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> pair/triplet sum problems, removing duplicates in place,
      container-with-most-water, merging sorted arrays, and palindrome checks. Whenever a
      brute-force answer is O(n²) over a sorted array, ask whether two pointers can make it
      O(n).
    </>
  ),
  code: [
    "static int[] pairSum(int[] a, int target) {",
    "  int i = 0;",
    "  int j = a.length - 1;",
    "  while (i < j) {",
    "    int sum = a[i] + a[j];",
    "    if (sum == target) return new int[]{i, j};",
    "    if (sum < target) i++;",
    "    else j--;",
    "  }",
    "  return null;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "Array",
    defaultValue: "4, 11, 15, 23, 28, 37, 42",
    max: 10,
    allowDup: false,
    extraField: { label: "Target", defaultValue: "43" },
  },
  legend: [
    ["--c-pointer", "i (left)"],
    ["--c-pivot", "j (right)"],
    ["--c-compare", "summing"],
    ["--c-done", "found pair"],
  ],
  renderer: Cells,
  makeSteps(input, extra) {
    const target = parseIntField(extra, "Target", -1998, 1998);
    const a = [...input].sort((x, y) => x - y);
    const changed = a.some((v, k) => v !== input[k]);
    const steps: Step<CellsState>[] = [];
    let i = 0;
    let j = a.length - 1;
    const snap = (line: number, desc: string, extraState: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        state: {
          a: [...a],
          range: [i, j],
          dimOutside: true,
          ptrs: [
            { name: "i", idx: i, color: "var(--c-pointer)" },
            { name: "j", idx: j, color: "var(--c-pivot)" },
          ],
          ...extraState,
        },
      });

    snap(1, `Find two values that sum to ${target}.${changed ? " (Input sorted first — two pointers needs sorted data.)" : ""}`);
    snap(2, "i starts at the smallest value, the left end.");
    snap(3, "j starts at the largest value, the right end.");
    while (i < j) {
      const sum = a[i] + a[j];
      snap(5, `sum = a[${i}] + a[${j}] = ${a[i]} + ${a[j]} = ${sum}.`, { compare: [i, j] });
      if (sum === target) {
        snap(6, `${sum} equals the target — found the pair (${a[i]}, ${a[j]}) at indexes ${i} and ${j}.`, {
          done: [i, j],
          range: undefined,
        });
        return steps;
      }
      if (sum < target) {
        i++;
        snap(7, `${sum} < ${target} — the sum must grow, and only moving i right can grow it.`);
      } else {
        j--;
        snap(8, `${sum} > ${target} — the sum must shrink, and only moving j left can shrink it.`);
      }
    }
    snap(10, `The pointers met — no two values sum to ${target}.`, { range: undefined });
    return steps;
  },
  quiz: [
    {
      q: "Why does pair-sum with two pointers require the array to be sorted?",
      opts: [
        "Sorting makes the array smaller",
        "So moving a pointer has a predictable effect on the sum",
        "Because pointers only work on sorted memory",
        "It doesn't — sorting is optional",
      ],
      answer: 1,
      why: "In sorted order, moving i right can only increase the sum and moving j left can only decrease it — that's what lets each step safely discard an element.",
    },
    {
      q: "What is the time complexity of the two-pointer pass itself (after sorting)?",
      opts: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
      answer: 2,
      why: "Each iteration moves one of the two pointers inward, so there are at most n−1 iterations.",
    },
    {
      q: "For pair-sum on an UNSORTED array, what is the usual O(n) alternative?",
      opts: [
        "A hash set of values seen so far",
        "Bubble sort first",
        "Binary search for each element",
        "There is none — O(n²) is optimal",
      ],
      answer: 0,
      why: "Scan once, and for each value x check whether target − x is already in a hash set. Two pointers trades that O(n) extra space for a sort.",
    },
  ],
};
