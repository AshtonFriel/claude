import { Cells } from "@/components/renderers/Cells";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const nextGreater: NumsTopic<CellsState> = {
  id: "next-greater-element",
  category: "Stacks & Queues",
  title: "Next Greater Element",
  tagline: "A monotonic stack answers every element at once",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)" },
  about: (
    <>
      <p>
        For each element, find the first larger value to its right. Brute force scans right from
        every index — O(n²). A <em>monotonic stack</em> does it in one pass by keeping indices whose
        answers are still unknown, in decreasing order of value. When a new element arrives, it is
        the answer for every pending index it beats, so those get popped and resolved.
      </p>
      <p>
        Each index is pushed once and popped at most once, so despite the inner while loop the total
        work is O(n) — a classic amortized-analysis example. The strip shows the pending stack.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> stock span and daily-temperature problems, largest rectangle
      in a histogram, trapping rain water, and sliding-window maximum (with a monotonic deque). Any
      &ldquo;nearest larger/smaller to the left/right&rdquo; question is this pattern.
    </>
  ),
  code: [
    "static int[] nextGreater(int[] a) {",
    "  int n = a.length;",
    "  int[] res = new int[n];",
    "  Arrays.fill(res, -1);",
    "  Deque<Integer> stack = new ArrayDeque<>();",
    "  for (int i = 0; i < n; i++) {",
    "    while (!stack.isEmpty() && a[stack.peek()] < a[i]) {",
    "      res[stack.pop()] = a[i];",
    "    }",
    "    stack.push(i);",
    "  }",
    "  return res;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function nextGreater(a) {",
      "  const n = a.length;",
      "  const res = new Array(n).fill(-1);",
      "  ",
      "  const stack = [];",
      "  for (let i = 0; i < n; i++) {",
      "    while (stack.length && a[stack.at(-1)] < a[i]) {",
      "      res[stack.pop()] = a[i];",
      "    }",
      "    stack.push(i);",
      "  }",
      "  return res;",
      "}",
    ],
  },
  mistakes: [
    "Storing values on the stack instead of indices — you then can't write the answer back to the right slot.",
    "Using an if instead of a while, so one arriving element resolves only the single top entry.",
    "Forgetting that whatever remains on the stack at the end has no greater element and must keep its −1.",
  ],
  interview: [
    "\"Daily temperatures\" — this algorithm, answering in days rather than values.",
    "\"Largest rectangle in a histogram\" — a monotonic stack of increasing heights.",
    "\"Trapping rain water\" — solvable with the same stack, or with two pointers.",
  ],
  inputs: { kind: "nums", label: "Array", defaultValue: "2, 1, 5, 6, 2, 3", max: 10 },
  legend: [
    ["--c-compare", "arriving element"],
    ["--c-pointer", "waiting on the stack"],
    ["--c-done", "answer resolved"],
  ],
  renderer: Cells,
  makeSteps(a) {
    const n = a.length;
    const res: (number | string)[] = new Array(n).fill("−1");
    const stack: number[] = [];
    const resolved: number[] = [];
    const steps: Step<CellsState>[] = [];
    const snap = (line: number, desc: string, extra: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `pending stack (top last): [${stack.map((i) => `a[${i}]=${a[i]}`).join(", ")}]  ·  answers: [${res.join(", ")}]`,
        state: { a: [...a], done: [...resolved], ...extra },
      });

    snap(4, "Every answer starts at −1: assume nothing greater exists until proven otherwise.");
    for (let i = 0; i < n; i++) {
      snap(6, `a[${i}] = ${a[i]} arrives. Does it resolve anything still waiting?`, {
        compare: [i],
        active: [...stack],
      });
      while (stack.length && a[stack[stack.length - 1]] < a[i]) {
        const j = stack.pop()!;
        res[j] = a[i];
        resolved.push(j);
        snap(8, `${a[i]} is the first larger value to the right of a[${j}] = ${a[j]} — pop it and record the answer.`, {
          compare: [i],
          active: [...stack],
        });
      }
      if (stack.length) {
        snap(7, `a[${stack[stack.length - 1]}] = ${a[stack[stack.length - 1]]} is not smaller than ${a[i]} — it keeps waiting.`, {
          compare: [i],
          active: [...stack],
        });
      }
      stack.push(i);
      snap(10, `Push index ${i}; its own answer is still unknown. The stack stays decreasing.`, {
        active: [...stack],
      });
    }
    snap(12, `Done in one pass. ${stack.length ? `Indices ${stack.join(", ")} kept −1 — nothing to their right is larger.` : "Every index found an answer."}`, {
      done: resolved.length ? [...resolved] : undefined,
    });
    return steps;
  },
  quiz: [
    {
      q: "Why is this O(n) despite having a while loop nested inside a for loop?",
      opts: [
        "Each index is pushed once and popped at most once, so total pops are bounded by n",
        "The while loop runs at most twice",
        "Because the array is sorted first",
        "It isn't — it's O(n²)",
      ],
      answer: 0,
      why: "This is amortized analysis: a single iteration may pop many entries, but across the whole run there can be at most n pops total.",
    },
    {
      q: "Why does the stack hold indices rather than values?",
      opts: [
        "The index says where to write the answer; the value alone loses that",
        "Indices use less memory",
        "Values can't be compared",
        "It makes the stack sorted",
      ],
      answer: 0,
      why: "You can always read a[i] from the index, but you cannot recover the position from a value — especially with duplicates.",
    },
    {
      q: "What is true of the values on the stack at any moment?",
      opts: [
        "They are in decreasing order from bottom to top",
        "They are in increasing order",
        "They are sorted alphabetically",
        "They are all equal",
      ],
      answer: 0,
      why: "Anything smaller than the arriving element is popped, so a smaller value never sits above a larger one — that invariant is what 'monotonic stack' names.",
    },
  ],
};
