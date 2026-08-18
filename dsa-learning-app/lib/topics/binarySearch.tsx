import { Cells } from "@/components/renderers/Cells";
import { parseIntField } from "@/lib/parse";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const binarySearch: NumsTopic<CellsState> = {
  id: "binary-search",
  category: "Searching Algorithms",
  title: "Binary Search",
  tagline: "Halve the search space with every comparison",
  complexity: { best: "O(1)", avg: "O(log n)", worst: "O(log n)", space: "O(1)" },
  about: (
    <>
      <p>
        Binary search finds a value in a <em>sorted</em> array by repeatedly checking the middle
        of the remaining range. One comparison tells you which half the target could be in, so
        the other half — however large — is discarded. The search space halves every step:
        1,000,000 elements need at most 20 comparisons.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> lookups in sorted data everywhere —{" "}
      <code>Arrays.binarySearch</code>, database indexes, git bisect, finding boundaries
      (&ldquo;first bad version&rdquo;), and &ldquo;binary search on the answer&rdquo; for
      optimization problems.
    </>
  ),
  code: [
    "static int binarySearch(int[] a, int target) {",
    "  int lo = 0;",
    "  int hi = a.length - 1;",
    "  while (lo <= hi) {",
    "    int mid = (lo + hi) / 2;",
    "    if (a[mid] == target) return mid;",
    "    if (a[mid] < target) lo = mid + 1;",
    "    else hi = mid - 1;",
    "  }",
    "  return -1;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "Sorted array",
    defaultValue: "8, 13, 21, 29, 37, 45, 60, 74",
    max: 12,
    allowDup: false,
    extraField: { label: "Target", defaultValue: "37" },
  },
  legend: [
    ["--c-pointer", "lo / hi range"],
    ["--c-compare", "mid (comparing)"],
    ["--c-done", "found"],
  ],
  renderer: Cells,
  makeSteps(input, extra) {
    const target = parseIntField(extra, "Target", -999, 999);
    const a = [...input].sort((x, y) => x - y);
    const changed = a.some((v, k) => v !== input[k]);
    const steps: Step<CellsState>[] = [];
    let lo = 0;
    let hi = a.length - 1;
    const snap = (line: number, desc: string, state: Partial<CellsState> = {}, mid?: number) =>
      steps.push({
        line,
        desc,
        state: {
          a: [...a],
          range: lo <= hi ? [lo, hi] : undefined,
          dimOutside: true,
          ptrs: [
            ...(lo <= hi
              ? [
                  { name: "lo", idx: lo, color: "var(--c-pointer)" },
                  { name: "hi", idx: hi, color: "var(--c-pivot)" },
                ]
              : []),
            ...(mid !== undefined ? [{ name: "mid", idx: mid, color: "var(--c-compare)" }] : []),
          ],
          ...state,
        },
      });

    snap(1, `Search for ${target}.${changed ? " (Input sorted first — binary search requires sorted data.)" : ""}`);
    snap(2, "lo starts at the first index.");
    snap(3, "hi starts at the last index. The answer, if present, is always inside [lo..hi].");
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      snap(5, `mid = (${lo} + ${hi}) / 2 = ${mid}. Check a[${mid}] = ${a[mid]}.`, { compare: [mid] }, mid);
      if (a[mid] === target) {
        snap(6, `a[${mid}] = ${target} — found the target at index ${mid} 🎯`, { done: [mid], range: undefined, dimOutside: false });
        return steps;
      }
      if (a[mid] < target) {
        lo = mid + 1;
        snap(7, `${a[mid]} < ${target} — the target must be right of mid. Discard the left half: lo = ${lo}.`);
      } else {
        hi = mid - 1;
        snap(8, `${a[mid]} > ${target} — the target must be left of mid. Discard the right half: hi = ${hi}.`);
      }
    }
    snap(10, `lo passed hi — the range is empty, so ${target} isn't in the array. Return -1.`, { dimOutside: false });
    return steps;
  },
  quiz: [
    {
      q: "Roughly how many comparisons does binary search need for n = 1,000,000?",
      opts: ["About 20", "About 1,000", "About 500,000", "About 1,000,000"],
      answer: 0,
      why: "Each comparison halves the range: log₂(1,000,000) ≈ 20.",
    },
    {
      q: "What precondition must hold before binary search can be used?",
      opts: [
        "All values are positive",
        "The array is sorted",
        "The array length is a power of two",
        "There are no duplicate values",
      ],
      answer: 1,
      why: "The whole algorithm rests on one comparison telling you which half the target is in — only true when the data is ordered.",
    },
    {
      q: "The loop condition is `lo <= hi`, not `lo < hi`. Why?",
      opts: [
        "It's a stylistic choice with no effect",
        "A one-element range (lo == hi) still needs to be checked",
        "It prevents integer overflow",
        "It makes the search stable",
      ],
      answer: 1,
      why: "When lo == hi one candidate remains. With `lo < hi` the loop would exit without ever comparing it, missing targets at that position.",
    },
  ],
};
