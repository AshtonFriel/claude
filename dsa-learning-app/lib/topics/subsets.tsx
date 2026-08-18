import { Cells } from "@/components/renderers/Cells";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const subsets: NumsTopic<CellsState> = {
  id: "subsets",
  category: "Recursion & Backtracking",
  title: "Subset Generation",
  tagline: "Every element is a yes/no fork in the road",
  complexity: { best: "O(2ⁿ)", avg: "O(2ⁿ)", worst: "O(n·2ⁿ)", space: "O(n)" },
  about: (
    <>
      <p>
        The power set of n elements has 2ⁿ subsets, because each element independently is
        either <em>in</em> or <em>out</em>. Recursion mirrors that perfectly: at element i,
        first explore every subset that <em>includes</em> it, then backtrack and explore every
        subset that <em>excludes</em> it. Reaching the end of the array means one complete
        in/out decision per element — record the subset. The recursion tree is a perfect
        binary tree with 2ⁿ leaves.
      </p>
      <p>Green cells are the elements currently included; the strip below collects every finished subset.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the template for combination/permutation generators,
      feature-flag and configuration enumeration, brute-force solutions to small subset-sum
      instances, and the include/exclude pattern inside many DP derivations.
    </>
  ),
  code: [
    "static void subsets(int[] a, int i,",
    "    List<Integer> cur, List<List<Integer>> out) {",
    "  if (i == a.length) {",
    "    out.add(new ArrayList<>(cur));",
    "    return;",
    "  }",
    "  cur.add(a[i]);                 // include a[i]",
    "  subsets(a, i + 1, cur, out);",
    "  cur.remove(cur.size() - 1);    // exclude a[i]",
    "  subsets(a, i + 1, cur, out);",
    "}",
  ],
  inputs: { kind: "nums", label: "Elements", defaultValue: "1, 2, 3", max: 4, allowDup: false },
  codeAlt: {
    javascript: [
      "function subsets(a, i = 0,",
      "    cur = [], out = []) {",
      "  if (i === a.length) {",
      "    out.push([...cur]);",
      "    return;",
      "  }",
      "  cur.push(a[i]);                // include a[i]",
      "  subsets(a, i + 1, cur, out);",
      "  cur.pop();                     // exclude a[i]",
      "  subsets(a, i + 1, cur, out);",
      "}",
    ],
  },
  mistakes: [
    "Recording `cur` itself instead of a copy — every entry in the output ends up aliasing the same (finally empty) list.",
    "Forgetting the pop/backtrack, so the exclude branch inherits the include branch's element.",
    "Calling it on n = 30 'just to see' — 2³⁰ subsets is a billion; know the size before you enumerate.",
  ],
  interview: [
    "\"Subsets I & II\" — the power set, then with duplicate handling.",
    "\"Combination sum\" — the include branch can repeat an element.",
    "\"Letter combinations of a phone number\" — the same tree with k-way branching.",
  ],
  legend: [
    ["--c-done", "included in current subset"],
    ["--c-compare", "deciding this element"],
  ],
  renderer: Cells,
  makeSteps(a) {
    const n = a.length;
    const steps: Step<CellsState>[] = [];
    const included: number[] = [];
    const out: string[] = [];
    const setStr = () => `{${included.map((k) => a[k]).join(", ")}}`;
    const aux = () => `found ${out.length}/${2 ** n}: ${out.join(" ") || "—"}`;
    const snap = (line: number, desc: string, state: Partial<CellsState> = {}) =>
      steps.push({ line, desc, aux: aux(), state: { a: [...a], done: [...included], ...state } });

    snap(3, `Generate all 2^${n} = ${2 ** n} subsets. Each element gets an in/out decision.`);
    const go = (i: number) => {
      if (i === n) {
        out.push(setStr());
        snap(4, `Reached the end — every element decided. Record subset ${setStr()}.`);
        return;
      }
      included.push(i);
      snap(7, `Decision for a[${i}] = ${a[i]}: INCLUDE it, then explore everything below.`, { compare: [i] });
      go(i + 1);
      included.pop();
      snap(9, `Backtrack: EXCLUDE a[${i}] = ${a[i]}, then explore the other half of the tree.`, { compare: [i] });
      go(i + 1);
    };
    go(0);
    snap(10, `Done — ${out.length} subsets, from the full set down to the empty set {}.`);
    return steps;
  },
  quiz: [
    {
      q: "How many subsets does a set of n elements have, and why?",
      opts: [
        "2ⁿ — each element is independently in or out",
        "n² — pairs of elements",
        "n! — orderings of elements",
        "n — one per element",
      ],
      answer: 0,
      why: "Each of the n elements doubles the count: n independent binary choices multiply to 2ⁿ.",
    },
    {
      q: "In the include/exclude recursion, what does the 'backtrack' line (removing a[i] from cur) achieve?",
      opts: [
        "It restores the shared state so the exclude branch starts from the same point as the include branch did",
        "It deletes the recorded subset",
        "It prevents stack overflow",
        "It sorts the current subset",
      ],
      answer: 0,
      why: "cur is one shared list. Undoing the choice on the way out is what lets a single mutable structure explore the whole tree correctly.",
    },
    {
      q: "What does the recursion tree of this algorithm look like?",
      opts: [
        "A perfect binary tree of depth n with 2ⁿ leaves — one leaf per subset",
        "A chain of n nodes",
        "A random shape depending on values",
        "A balanced BST of the input values",
      ],
      answer: 0,
      why: "Every internal node forks exactly twice (include/exclude) and every path makes n decisions — the leaves enumerate the power set.",
    },
  ],
};
