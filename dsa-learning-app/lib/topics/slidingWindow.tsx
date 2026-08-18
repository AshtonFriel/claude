import { Cells } from "@/components/renderers/Cells";
import { parseIntField } from "@/lib/parse";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const slidingWindow: NumsTopic<CellsState> = {
  id: "sliding-window",
  category: "Arrays",
  title: "Sliding Window",
  tagline: "Reuse the last window instead of recomputing",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  about: (
    <>
      <p>
        A sliding window tracks a contiguous run of elements. The trick: when the window moves
        one step right, don&apos;t re-add all k elements — just <em>add the one entering</em> and{" "}
        <em>subtract the one leaving</em>. That turns the brute-force O(n·k) &ldquo;recompute
        every window&rdquo; into a single O(n) pass. Here the window has fixed size k and we
        hunt for the window with the largest sum.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> maximum/minimum subarray of size k, moving averages in
      time-series data, longest substring problems (with a variable-size window), and rate
      limiting. The moment a problem says &ldquo;contiguous subarray/substring&rdquo;, think
      window.
    </>
  ),
  code: [
    "static int maxWindowSum(int[] a, int k) {",
    "  int sum = 0;",
    "  for (int i = 0; i < k; i++) sum += a[i];",
    "  int best = sum, bestStart = 0;",
    "  for (int r = k; r < a.length; r++) {",
    "    sum += a[r] - a[r - k];",
    "    if (sum > best) {",
    "      best = sum;",
    "      bestStart = r - k + 1;",
    "    }",
    "  }",
    "  return best;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "Array",
    defaultValue: "2, 5, 1, 8, 2, 9, 1",
    max: 12,
    extraField: { label: "k", defaultValue: "3" },
  },
  legend: [
    ["--c-pointer", "current window"],
    ["--c-active", "entering"],
    ["--c-compare", "leaving"],
    ["--c-done", "best window"],
  ],
  renderer: Cells,
  makeSteps(a, extra) {
    const k = parseIntField(extra, "k", 1, a.length);
    const steps: Step<CellsState>[] = [];
    let sum = 0;
    let best = 0;
    let bestStart = 0;
    const aux = () => `sum: ${sum} · best: ${best} (start ${bestStart})`;
    const snap = (line: number, desc: string, state: Partial<CellsState> = {}) =>
      steps.push({ line, desc, aux: aux(), state: { a: [...a], ...state } });

    steps.push({
      line: 2,
      desc: `Build the first window of size ${k}, one element at a time.`,
      state: { a: [...a] },
    });
    for (let i = 0; i < k; i++) {
      sum += a[i];
      snap(3, `Add a[${i}] = ${a[i]} to the initial window — sum is now ${sum}.`, { range: [0, i], active: [i] });
    }
    best = sum;
    snap(4, `The first window sums to ${sum}. That's the best so far.`, { range: [0, k - 1] });
    for (let r = k; r < a.length; r++) {
      sum += a[r] - a[r - k];
      snap(6, `Slide right: add a[${r}] = ${a[r]}, drop a[${r - k}] = ${a[r - k]} — sum is now ${sum}.`, {
        range: [r - k + 1, r],
        active: [r],
        compare: [r - k],
      });
      if (sum > best) {
        best = sum;
        bestStart = r - k + 1;
        snap(8, `${sum} beats the previous best — remember this window, starting at index ${bestStart}.`, {
          range: [r - k + 1, r],
        });
      } else {
        snap(7, `${sum} doesn't beat the best (${best}) — keep sliding.`, { range: [r - k + 1, r] });
      }
    }
    const win = Array.from({ length: k }, (_, d) => bestStart + d);
    snap(12, `Done — the best window is [${bestStart}..${bestStart + k - 1}] with sum ${best}, found in one O(n) pass.`, {
      done: win,
    });
    return steps;
  },
  quiz: [
    {
      q: "Why is the sliding update `sum += a[r] − a[r−k]` better than re-summing the window?",
      opts: [
        "It avoids integer overflow",
        "It turns O(n·k) total work into O(n)",
        "It works on unsorted arrays",
        "It uses less memory",
      ],
      answer: 1,
      why: "Recomputing each of ~n windows costs k additions; reusing the previous sum costs 2 operations per slide — O(n) overall.",
    },
    {
      q: "How many size-k windows does an array of length n contain?",
      opts: ["n", "n − k + 1", "n·k", "k"],
      answer: 1,
      why: "Windows start at indexes 0 through n−k, which is n−k+1 starting positions.",
    },
    {
      q: "\"Longest substring without repeating characters\" uses which window variant?",
      opts: [
        "A fixed-size window",
        "A variable-size window that grows and shrinks",
        "Two windows moving in opposite directions",
        "No window — it needs DP",
      ],
      answer: 1,
      why: "The right edge expands while the substring is valid; the left edge advances to restore validity when a repeat appears.",
    },
  ],
};
