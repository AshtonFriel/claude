import { Grid } from "@/components/renderers/Grid";
import { parseIntField } from "@/lib/parse";
import type { GridState, Step, TextTopic } from "@/lib/types";

interface Item {
  w: number;
  v: number;
}

function parseItems(text: string): Item[] {
  const parts = String(text).split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Enter items as weight:value pairs, e.g.  1:1, 3:4, 4:5");
  if (parts.length > 6) throw new Error("Keep it to 6 items or fewer so the table stays readable.");
  return parts.map((p) => {
    const m = p.match(/^(\d{1,2})\s*:\s*(\d{1,3})$/);
    if (!m) throw new Error(`"${p}" isn't an item. Use  weight:value , e.g.  3:4`);
    const w = Number(m[1]);
    const v = Number(m[2]);
    if (w < 1 || w > 12) throw new Error("Weights must be between 1 and 12.");
    return { w, v };
  });
}

export const knapsack: TextTopic<GridState> = {
  id: "knapsack",
  category: "Dynamic Programming",
  title: "0/1 Knapsack",
  tagline: "Take it or leave it — a table remembers every choice",
  complexity: { best: "O(n·W)", avg: "O(n·W)", worst: "O(n·W)", space: "O(n·W)" },
  about: (
    <>
      <p>
        Given items with weights and values and a knapsack of capacity W, pick a subset
        maximizing value — each item taken whole or not at all (hence 0/1). Greedy fails here;
        instead a table <code>dp[i][c]</code> answers: &ldquo;best value using the first i
        items within capacity c&rdquo;. Each cell is a single choice: <em>skip</em> item i
        (copy the value from the row above) or <em>take</em> it (its value + the best of the
        remaining capacity, up-and-left in the row above). The answer accumulates in the
        bottom-right corner.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> budget allocation, cargo loading, cutting stock,
      subset-sum problems, and as the template for a huge family of &ldquo;choose under a
      constraint&rdquo; DP problems.
    </>
  ),
  code: [
    "static int knapsack(Item[] items, int W) {",
    "  int n = items.length;",
    "  int[][] dp = new int[n + 1][W + 1];",
    "  for (int i = 1; i <= n; i++) {",
    "    Item it = items[i - 1];",
    "    for (int c = 0; c <= W; c++) {",
    "      dp[i][c] = dp[i - 1][c];",
    "      if (it.w <= c) {",
    "        int take = it.v + dp[i - 1][c - it.w];",
    "        if (take > dp[i][c]) dp[i][c] = take;",
    "      }",
    "    }",
    "  }",
    "  return dp[n][W];",
    "}",
  ],
  inputs: {
    kind: "text",
    label: "Items (w:v)",
    defaultValue: "1:1, 3:4, 4:5, 5:7",
    extraField: { label: "Capacity", defaultValue: "7" },
  },
  codeAlt: {
    javascript: [
      "function knapsack(items, W) {",
      "  const n = items.length;",
      "  const dp = zeros(n + 1, W + 1);",
      "  for (let i = 1; i <= n; i++) {",
      "    const it = items[i - 1];",
      "    for (let c = 0; c <= W; c++) {",
      "      dp[i][c] = dp[i - 1][c];",
      "      if (it.w <= c) {",
      "        const take = it.v + dp[i - 1][c - it.w];",
      "        if (take > dp[i][c]) dp[i][c] = take;",
      "      }",
      "    }",
      "  }",
      "  return dp[n][W];",
      "}",
    ],
  },
  mistakes: [
    "Reading dp[i][c − w] (current row) instead of dp[i − 1][c − w] — that quietly allows taking an item twice, which is unbounded knapsack.",
    "Off-by-one between items[i − 1] and row i — the +1 rows exist for the empty baseline.",
    "Trying value-per-weight greedy — it's optimal for fractional knapsack only, and interviewers know it.",
  ],
  interview: [
    "\"Partition equal subset sum\" — knapsack where value = weight and target = half the total.",
    "\"Target sum\" — knapsack over +/− sign assignments.",
    "\"Coin change II (count combinations)\" — the unbounded cousin; know which row you read from.",
  ],
  legend: [
    ["--c-compare", "cell being computed"],
    ["--c-pointer", "cells it reads (row above)"],
    ["--c-done", "final answer"],
  ],
  renderer: Grid,
  makeSteps({ text, extra }) {
    const items = parseItems(text);
    const W = parseIntField(extra, "Capacity", 1, 12);
    const n = items.length;
    const steps: Step<GridState>[] = [];
    const cells: (number | null)[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(null));
    for (let c = 0; c <= W; c++) cells[0][c] = 0;
    const colLabels = Array.from({ length: W + 1 }, (_, c) => String(c));
    const rowLabels = ["no items", ...items.map((it, k) => `#${k + 1} w${it.w} v${it.v}`)];
    const snap = (line: number, desc: string, state: Partial<GridState> = {}) =>
      steps.push({
        line,
        desc,
        state: { colLabels, rowLabels, cells: cells.map((r) => [...r]), ...state },
      });

    snap(3, "Row 0 is the no-items baseline: with zero items the best value is 0 at every capacity.");
    for (let i = 1; i <= n; i++) {
      const it = items[i - 1];
      snap(5, `Row ${i}: item #${i} enters the picture (weight ${it.w}, value ${it.v}). Each cell asks: skip it or take it?`);
      for (let c = 0; c <= W; c++) {
        const skip = cells[i - 1][c]!;
        if (it.w > c) {
          cells[i][c] = skip;
          snap(7, `cap ${c}: item #${i} weighs ${it.w} — too heavy to fit. Skip: copy ${skip} from the row above.`, {
            cur: [i, c],
            refs: [[i - 1, c]],
          });
        } else {
          const take = it.v + cells[i - 1][c - it.w]!;
          cells[i][c] = Math.max(skip, take);
          snap(
            10,
            `cap ${c}: skip keeps ${skip}; take gives ${it.v} + dp[${i - 1}][${c - it.w}] = ${take}. ` +
              (take > skip ? `Take wins → ${take}.` : `Skip wins → ${skip}.`),
            { cur: [i, c], refs: [[i - 1, c], [i - 1, c - it.w]] },
          );
        }
      }
    }
    snap(14, `The bottom-right cell holds the answer: best value ${cells[n][W]} within capacity ${W}.`, {
      goal: [n, W],
    });
    return steps;
  },
  quiz: [
    {
      q: "What does the cell dp[i][c] mean?",
      opts: [
        "The best value achievable using only the first i items within capacity c",
        "The weight of the first i items",
        "Whether item i fits in capacity c",
        "The number of ways to fill capacity c",
      ],
      answer: 0,
      why: "Each cell is a complete mini-answer; the recurrence combines them so the final cell dp[n][W] answers the whole problem.",
    },
    {
      q: "The two candidates for dp[i][c] are dp[i−1][c] and v + dp[i−1][c−w]. What do they represent?",
      opts: [
        "Skipping item i, vs taking item i and solving the rest with the remaining capacity",
        "The best and worst cases",
        "Taking item i once vs twice",
        "The left and right halves of the array",
      ],
      answer: 0,
      why: "Skip = same capacity, one fewer item. Take = earn v, but the remaining c−w capacity must be filled optimally by earlier items only — that's the 0/1 constraint.",
    },
    {
      q: "Knapsack's O(n·W) is called pseudo-polynomial. Why?",
      opts: [
        "W is a numeric value, not an input size — it can be exponential in the number of input bits",
        "The constant factors are large",
        "It only works for small n",
        "Because the answer is approximate",
      ],
      answer: 0,
      why: "Doubling the digits of W squares its magnitude. In the input's bit-length the runtime is exponential — knapsack remains NP-hard in general.",
    },
  ],
};
