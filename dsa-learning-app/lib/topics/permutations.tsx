import { Cells } from "@/components/renderers/Cells";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const permutations: NumsTopic<CellsState> = {
  id: "permutations",
  category: "Recursion & Backtracking",
  title: "Permutations",
  tagline: "Fix a position, swap every candidate into it",
  complexity: { best: "O(n!)", avg: "O(n!)", worst: "O(n·n!)", space: "O(n)" },
  about: (
    <>
      <p>
        There are n! orderings of n distinct items, and the swap-based generator produces every one
        without any extra storage. At depth k, position k is fixed: swap each of the remaining
        elements into it, recurse on k + 1, then <em>swap back</em> so the array is restored for the
        next candidate. Reaching depth n means every position is decided — record the arrangement.
      </p>
      <p>
        That swap-back is the entire discipline of backtracking: mutate, explore, undo. Skip it and
        every later branch inherits a corrupted array.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> brute-forcing small travelling-salesman instances, puzzle and
      anagram generation, exhaustive test-case ordering, and as the template for constrained
      arrangement problems. Beyond about n = 10, n! makes enumeration impossible — recognising that
      is often the point of the question.
    </>
  ),
  code: [
    "static void permute(int[] a, int k, List<int[]> out) {",
    "  if (k == a.length) {",
    "    out.add(a.clone());",
    "    return;",
    "  }",
    "  for (int i = k; i < a.length; i++) {",
    "    swap(a, k, i);",
    "    permute(a, k + 1, out);",
    "    swap(a, k, i);   // undo",
    "  }",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function permute(a, k, out) {",
      "  if (k === a.length) {",
      "    out.push([...a]);",
      "    return;",
      "  }",
      "  for (let i = k; i < a.length; i++) {",
      "    swap(a, k, i);",
      "    permute(a, k + 1, out);",
      "    swap(a, k, i);   // undo",
      "  }",
      "}",
    ],
  },
  mistakes: [
    "Recording the array itself instead of a copy — every stored entry then aliases the same array and ends up identical.",
    "Omitting the swap-back, so sibling branches explore a corrupted array and permutations go missing.",
    "Starting the inner loop at 0 rather than k, which regenerates arrangements already fixed at earlier positions.",
  ],
  interview: [
    "\"Permutations\" and \"Permutations II\" (with duplicates — sort, then skip equal siblings).",
    "\"Letter case permutation\" and \"generate parentheses\" — the same explore/undo skeleton.",
    "\"Next permutation\" — the O(n) in-place alternative when you only need the successor.",
  ],
  inputs: { kind: "nums", label: "Elements", defaultValue: "1, 2, 3", max: 4, allowDup: false },
  legend: [
    ["--c-done", "fixed prefix"],
    ["--c-compare", "candidate being swapped in"],
  ],
  renderer: Cells,
  makeSteps(a0) {
    const a = [...a0];
    const n = a.length;
    if (n > 4) throw new Error("Keep it to 4 elements — 5! = 120 permutations makes for a very long run.");
    const out: string[] = [];
    const steps: Step<CellsState>[] = [];
    const fact = (k: number): number => (k <= 1 ? 1 : k * fact(k - 1));
    const prefix = (k: number) => Array.from({ length: k }, (_, i) => i);
    const snap = (line: number, desc: string, st: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `found ${out.length}/${fact(n)}: ${out.join("  ") || "—"}`,
        state: { a: [...a], ...st },
      });

    snap(6, `Generate all ${n}! = ${fact(n)} orderings by fixing one position at a time.`);
    const go = (k: number) => {
      if (k === n) {
        out.push(`(${a.join(",")})`);
        snap(3, `Depth ${n} reached — every position is fixed. Record (${a.join(", ")}).`, { done: prefix(n) });
        return;
      }
      for (let i = k; i < n; i++) {
        if (i === k) {
          snap(7, `Position ${k}: try leaving ${a[k]} where it is.`, { done: prefix(k), compare: [i] });
        } else {
          snap(7, `Position ${k}: try ${a[i]} here instead — swap it in from index ${i}.`, {
            done: prefix(k),
            compare: [k, i],
          });
        }
        [a[k], a[i]] = [a[i], a[k]];
        snap(8, `Position ${k} is now fixed as ${a[k]}. Recurse to decide position ${k + 1}.`, {
          done: prefix(k + 1),
        });
        go(k + 1);
        [a[k], a[i]] = [a[i], a[k]];
        snap(9, `Backtrack: undo the swap so position ${k} is free to try the next candidate.`, {
          done: prefix(k),
          compare: [k, i],
        });
      }
    };
    go(0);
    snap(11, `Done — all ${out.length} permutations generated in place: ${out.join("  ")}`);
    return steps;
  },
  quiz: [
    {
      q: "Why must the recorded permutation be a copy of the array?",
      opts: [
        "The array keeps mutating, so every stored reference would end up showing the same final state",
        "Copies are faster to compare",
        "To keep them sorted",
        "It doesn't have to be a copy",
      ],
      answer: 0,
      why: "One array is reused throughout. Storing the reference n! times stores the same object n! times — a classic aliasing bug.",
    },
    {
      q: "What does the swap-back after the recursive call accomplish?",
      opts: [
        "It restores the array so the next candidate for this position starts from the same state",
        "It sorts the array",
        "It prevents stack overflow",
        "It removes duplicates",
      ],
      answer: 0,
      why: "Backtracking is mutate, explore, undo. Without the undo the loop's later iterations operate on an array the previous branch left rearranged.",
    },
    {
      q: "Roughly how many permutations does n = 10 produce?",
      opts: ["About 3.6 million", "About 1,000", "About 100", "Exactly 1,024"],
      answer: 0,
      why: "10! = 3,628,800. Factorial growth means enumeration is only viable for tiny n — recognising that is usually the real interview point.",
    },
  ],
};
