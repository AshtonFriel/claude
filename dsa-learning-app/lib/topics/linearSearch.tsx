import { Cells } from "@/components/renderers/Cells";
import { parseIntField } from "@/lib/parse";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const linearSearch: NumsTopic<CellsState> = {
  id: "linear-search",
  category: "Searching Algorithms",
  title: "Linear Search",
  tagline: "Check every element until you hit the target",
  complexity: { best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  about: (
    <>
      <p>
        Linear search is the baseline: walk the array front to back and compare each element to
        the target. It makes no assumptions — the data can be unsorted, duplicated, or stored
        anywhere you can iterate. That generality costs comparisons: on average half the array,
        and all of it when the target is missing.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> unsorted data (where binary search can&apos;t run),
      tiny arrays where its simplicity beats binary search&apos;s overhead, linked lists (no
      random access), and as the fallback inside hash-bucket and cache lookups.
    </>
  ),
  code: [
    "static int linearSearch(int[] a, int target) {",
    "  for (int i = 0; i < a.length; i++) {",
    "    if (a[i] == target) {",
    "      return i;",
    "    }",
    "  }",
    "  return -1;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "Array",
    defaultValue: "14, 3, 27, 8, 42, 19",
    max: 12,
    extraField: { label: "Target", defaultValue: "42" },
  },
  legend: [
    ["--c-compare", "comparing"],
    ["--c-done", "found"],
  ],
  renderer: Cells,
  makeSteps(a, extra) {
    const target = parseIntField(extra, "Target", -999, 999);
    const steps: Step<CellsState>[] = [];
    const checked: number[] = [];
    const snap = (line: number, desc: string, state: Partial<CellsState> = {}) =>
      steps.push({ line, desc, state: { a: [...a], ...state } });

    snap(2, `Search for ${target}, starting at index 0. No sorting needed.`);
    for (let i = 0; i < a.length; i++) {
      snap(3, `Is a[${i}] = ${a[i]} equal to ${target}?`, {
        compare: [i],
        ptrs: [{ name: "i", idx: i, color: "var(--c-compare)" }],
      });
      if (a[i] === target) {
        snap(4, `Yes — found ${target} at index ${i} after ${i + 1} comparison${i ? "s" : ""}.`, { done: [i] });
        return steps;
      }
      checked.push(i);
    }
    snap(7, `Checked all ${a.length} elements — ${target} isn't here. Return -1.`);
    return steps;
  },
  quiz: [
    {
      q: "On average, how many elements does a successful linear search examine?",
      opts: ["1", "About n/2", "About log n", "Always n"],
      answer: 1,
      why: "The target is equally likely to be anywhere, so the expected position is the middle: about n/2 comparisons.",
    },
    {
      q: "When is linear search the RIGHT choice over binary search?",
      opts: [
        "When the data is unsorted or has no random access (e.g. a linked list)",
        "Never — binary search always wins",
        "Only when n is a prime number",
        "When the target is definitely present",
      ],
      answer: 0,
      why: "Binary search needs sorted, randomly accessible data. Sorting first costs O(n log n) — pointless for a single lookup.",
    },
    {
      q: "What does linear search return when the target appears more than once?",
      opts: [
        "The index of the first occurrence",
        "The index of the last occurrence",
        "All matching indexes",
        "It throws an error",
      ],
      answer: 0,
      why: "The scan runs front to back and returns the moment it finds a match — always the earliest occurrence.",
    },
  ],
};
