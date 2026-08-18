import { Cells } from "@/components/renderers/Cells";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const fibMemo: NumsTopic<CellsState> = {
  id: "fib-memo",
  category: "Dynamic Programming",
  title: "Fibonacci & Memoization",
  tagline: "Never solve the same subproblem twice",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)" },
  about: (
    <>
      <p>
        Naive recursive Fibonacci recomputes the same values over and over —{" "}
        <code>fib(n−2)</code> is computed once inside <code>fib(n−1)</code> and again directly —
        exploding to O(2ⁿ) calls. <em>Memoization</em> fixes this with a table: before
        computing, check the table; after computing, store the result. Every subproblem is then
        solved exactly once, collapsing the exponential tree to O(n). This is dynamic
        programming in its simplest form: <em>overlapping subproblems + caching</em>.
      </p>
      <p>The boxes below are the memo table — watch it fill left-to-right, and watch later calls hit the cache.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the gateway to all dynamic programming — climbing
      stairs, coin change, edit distance. The same cache-your-subproblems idea powers React
      memoization, compiler common-subexpression elimination, and HTTP caches.
    </>
  ),
  code: [
    "static long fib(int n, long[] memo) {",
    "  if (n <= 1) return n;",
    "  if (memo[n] != 0) {",
    "    return memo[n];        // cache hit",
    "  }",
    "  memo[n] = fib(n - 1, memo)",
    "          + fib(n - 2, memo);",
    "  return memo[n];",
    "}",
  ],
  inputs: { kind: "nums", label: "n", defaultValue: "8", min: 1, max: 1 },
  codeAlt: {
    javascript: [
      "function fib(n, memo = []) {",
      "  if (n <= 1) return n;",
      "  if (memo[n] !== undefined) {",
      "    return memo[n];        // cache hit",
      "  }",
      "  memo[n] = fib(n - 1, memo)",
      "          + fib(n - 2, memo);",
      "  return memo[n];",
      "}",
    ],
  },
  mistakes: [
    "Creating a fresh memo object inside every call — each branch gets its own empty cache and nothing is shared.",
    "Checking the cache but forgetting to *write* to it after computing.",
    "Using 0 as the 'unset' sentinel for functions that legitimately return 0 (fib(0) does!).",
  ],
  interview: [
    "\"Climbing stairs\" — fib with different names.",
    "\"House robber\" — the same take/skip recurrence one level up.",
    "\"Coin change\" — memoization over remaining amount.",
  ],
  legend: [
    ["--c-compare", "current call"],
    ["--c-active", "writing result"],
    ["--c-done", "cache hit"],
  ],
  renderer: Cells,
  makeSteps(input) {
    const n = input[0];
    if (n < 2 || n > 12) throw new Error("Pick n between 2 and 12 so the table stays readable.");
    const steps: Step<CellsState>[] = [];
    const memo: (number | null)[] = Array(n + 1).fill(null);
    memo[0] = 0;
    if (n >= 1) memo[1] = 1;
    const stack: string[] = [];
    const cellsNow = () => memo.map((v) => (v === null ? "·" : v));
    const snap = (line: number, desc: string, state: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `call stack: ${stack.join(" → ") || "(empty)"}`,
        state: { a: cellsNow(), ...state },
      });

    snap(1, `Compute fib(${n}). Indexes 0 and 1 are base cases (0 and 1) — everything else starts unknown (·).`);
    const go = (k: number): number => {
      stack.push(`fib(${k})`);
      if (k <= 1) {
        snap(2, `fib(${k}) is a base case — return ${k} immediately.`, { compare: [k] });
        stack.pop();
        return k;
      }
      if (memo[k] !== null) {
        snap(4, `fib(${k}): memo[${k}] already holds ${memo[k]} — cache hit, no recursion needed. 🎯`, { done: [k] });
        stack.pop();
        return memo[k]!;
      }
      snap(6, `fib(${k}) isn't cached — recurse into fib(${k - 1}) and fib(${k - 2}).`, { compare: [k] });
      const a = go(k - 1);
      const b = go(k - 2);
      memo[k] = a + b;
      snap(7, `fib(${k}) = ${a} + ${b} = ${a + b} — store it in memo[${k}] so it's never computed again.`, { active: [k] });
      stack.pop();
      return memo[k]!;
    };
    const result = go(n);
    snap(8, `Done: fib(${n}) = ${result}. Each cell was computed exactly once — ${n - 1} additions instead of ~2^${n} calls.`, {
      done: memo.map((_, i) => i),
    });
    return steps;
  },
  quiz: [
    {
      q: "What is the time complexity of naive recursive Fibonacci vs the memoized version?",
      opts: ["O(2ⁿ) vs O(n)", "O(n²) vs O(n log n)", "O(n) vs O(1)", "They're the same — memoization only saves space"],
      answer: 0,
      why: "Naive recursion doubles the work at each level (an exponential call tree); memoization computes each of the n subproblems once.",
    },
    {
      q: "What two properties make a problem a good fit for memoization?",
      opts: [
        "Overlapping subproblems and optimal substructure",
        "Sorted input and random access",
        "Small numbers and no recursion",
        "A greedy choice property",
      ],
      answer: 0,
      why: "The same subproblems must recur (so caching pays off) and the answer must be composable from subproblem answers.",
    },
    {
      q: "What is the space cost of memoized fib(n)?",
      opts: [
        "O(n) — the table plus a recursion stack up to n deep",
        "O(1)",
        "O(2ⁿ)",
        "O(n²)",
      ],
      answer: 0,
      why: "One table entry per subproblem, and the first descent fib(n)→fib(n−1)→… nests n calls deep. (An iterative bottom-up loop gets it to O(1) extra.)",
    },
  ],
};
