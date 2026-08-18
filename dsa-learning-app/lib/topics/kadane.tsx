import { Cells } from "@/components/renderers/Cells";
import type { CellsState, NumsTopic, Step } from "@/lib/types";

export const kadane: NumsTopic<CellsState> = {
  id: "kadane",
  category: "Arrays",
  title: "Kadane's Algorithm",
  tagline: "The best subarray ending here, in one pass",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  about: (
    <>
      <p>
        Find the contiguous subarray with the largest sum. The brute force is O(n²) — try every
        start and end. Kadane&apos;s insight collapses it to one pass by asking a smaller question
        at each index: <em>what is the best subarray ending exactly here?</em> Either you extend
        the previous best, or the previous best was so negative that starting fresh at this element
        is better. Take the max of those two, and keep a running champion.
      </p>
      <p>
        That&apos;s dynamic programming with the table thrown away — only the previous answer is
        ever needed, so the space is O(1).
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> maximum profit windows in time series, brightest streak in
      signal data, and as the classic &ldquo;can you do better than O(n²)?&rdquo; interview
      escalation. The extend-or-restart pattern generalizes to maximum product, circular arrays,
      and 2-D submatrix sums.
    </>
  ),
  code: [
    "static int maxSubarray(int[] a) {",
    "  int best = a[0];",
    "  int here = a[0];",
    "  for (int i = 1; i < a.length; i++) {",
    "    here = Math.max(a[i], here + a[i]);",
    "    best = Math.max(best, here);",
    "  }",
    "  return best;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function maxSubarray(a) {",
      "  let best = a[0];",
      "  let here = a[0];",
      "  for (let i = 1; i < a.length; i++) {",
      "    here = Math.max(a[i], here + a[i]);",
      "    best = Math.max(best, here);",
      "  }",
      "  return best;",
      "}",
    ],
  },
  mistakes: [
    "Initialising best to 0 — on an all-negative array the answer should be the largest single element, not 0.",
    "Updating best before here, so best can never see the subarray that ends at the current index.",
    "Resetting here to 0 instead of to a[i]; that silently drops the current element from the candidate subarray.",
  ],
  interview: [
    "\"Maximum subarray\" — the canonical version, asked constantly.",
    "\"Best time to buy and sell stock\" — Kadane over the day-to-day differences.",
    "\"Maximum product subarray\" — the same shape, but you must track a running minimum too, because a negative times a negative flips.",
  ],
  inputs: { kind: "nums", label: "Array", defaultValue: "-2, 1, -3, 4, -1, 2, 1, -5, 4", max: 12 },
  legend: [
    ["--c-compare", "current element"],
    ["--c-pointer", "best subarray ending here"],
    ["--c-done", "best seen overall"],
  ],
  renderer: Cells,
  makeSteps(a) {
    const steps: Step<CellsState>[] = [];
    let best = a[0];
    let here = a[0];
    let hereStart = 0;
    let bestStart = 0;
    let bestEnd = 0;
    const span = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, k) => s + k);
    const aux = () => `here = ${here} · best = ${best}  (a[${bestStart}..${bestEnd}])`;
    const snap = (line: number, desc: string, extra: Partial<CellsState> = {}) =>
      steps.push({ line, desc, aux: aux(), state: { a: [...a], ...extra } });

    snap(2, `Start with a[0] = ${a[0]} as both the best subarray ending here and the best overall.`, {
      done: [0],
      compare: [0],
    });
    for (let i = 1; i < a.length; i++) {
      const extend = here + a[i];
      snap(5, `At a[${i}] = ${a[i]}: extend the previous run for ${extend}, or restart at ${a[i]}?`, {
        compare: [i],
        active: span(hereStart, i - 1),
      });
      if (a[i] > extend) {
        here = a[i];
        hereStart = i;
        snap(5, `Restarting wins (${a[i]} > ${extend}) — the run before this was dragging the sum down.`, {
          compare: [i],
          active: [i],
        });
      } else {
        here = extend;
        snap(5, `Extending wins (${extend} ≥ ${a[i]}) — the run so far still helps.`, {
          active: span(hereStart, i),
        });
      }
      if (here > best) {
        best = here;
        bestStart = hereStart;
        bestEnd = i;
        snap(6, `${here} beats the old champion — a[${bestStart}..${bestEnd}] is the new best.`, {
          done: span(bestStart, bestEnd),
        });
      } else {
        snap(6, `${here} doesn't beat the champion ${best} — keep a[${bestStart}..${bestEnd}].`, {
          active: span(hereStart, i),
          done: span(bestStart, bestEnd),
        });
      }
    }
    snap(8, `Answer: the largest subarray sum is ${best}, from a[${bestStart}] to a[${bestEnd}].`, {
      done: span(bestStart, bestEnd),
    });
    return steps;
  },
  quiz: [
    {
      q: "What subproblem does Kadane's algorithm solve at each index i?",
      opts: [
        "The largest sum of a subarray that ends exactly at i",
        "The largest sum anywhere in a[0..i]",
        "The number of positive elements so far",
        "The sum of the whole prefix",
      ],
      answer: 0,
      why: "Anchoring the subproblem at 'ends exactly here' is what makes it composable: the next index either extends this run or starts a new one.",
    },
    {
      q: "On the all-negative array [−4, −2, −7], what should the algorithm return?",
      opts: ["−2", "0", "−13", "It is undefined"],
      answer: 0,
      why: "A subarray must be non-empty, so the answer is the largest single element. Initialising best to 0 is the classic bug that returns 0 here.",
    },
    {
      q: "Why is Kadane's space complexity O(1) even though it's dynamic programming?",
      opts: [
        "Each state depends only on the previous one, so no table needs to be kept",
        "It doesn't use dynamic programming",
        "The input array is reused as the table",
        "Because the array is scanned backwards",
      ],
      answer: 0,
      why: "This is the rolling-variable optimisation: when a DP recurrence only looks back one step, the table collapses to a couple of scalars.",
    },
  ],
};
