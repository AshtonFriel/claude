import { Grid } from "@/components/renderers/Grid";
import { parseIntField } from "@/lib/parse";
import type { GridState, Step, TextTopic } from "@/lib/types";

export const coinChange: TextTopic<GridState> = {
  id: "coin-change",
  category: "Dynamic Programming",
  title: "Coin Change",
  tagline: "Fewest coins for an amount — greedy won't do",
  complexity: { best: "O(n·A)", avg: "O(n·A)", worst: "O(n·A)", space: "O(A)" },
  about: (
    <>
      <p>
        Given coin denominations and a target amount, use the fewest coins. The greedy
        &ldquo;always take the biggest coin that fits&rdquo; works for ordinary currency but fails
        in general: with coins {"{1, 3, 4}"} and amount 6, greedy takes 4 + 1 + 1 = three coins when
        3 + 3 = two is optimal.
      </p>
      <p>
        The DP is unbounded knapsack: <code>dp[c]</code> is the fewest coins making amount c, built
        from <code>dp[c − coin] + 1</code>. Because a coin may be reused, each row reads the{" "}
        <em>current</em> row — the one detail that separates this from 0/1 knapsack. ∞ marks an
        amount that cannot be made.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> cash registers and vending machines, making change in
      arbitrary currencies, cutting stock to minimise waste, and as the standard demonstration that
      a greedy choice needs proof rather than intuition.
    </>
  ),
  code: [
    "static int coinChange(int[] coins, int amount) {",
    "  int[] dp = new int[amount + 1];",
    "  Arrays.fill(dp, INF);",
    "  dp[0] = 0;",
    "  for (int coin : coins) {",
    "    for (int c = coin; c <= amount; c++) {",
    "      if (dp[c - coin] + 1 < dp[c]) {",
    "        dp[c] = dp[c - coin] + 1;",
    "      }",
    "    }",
    "  }",
    "  return dp[amount] == INF ? -1 : dp[amount];",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function coinChange(coins, amount) {",
      "  const dp = new Array(amount + 1).fill(Infinity);",
      "  ",
      "  dp[0] = 0;",
      "  for (const coin of coins) {",
      "    for (let c = coin; c <= amount; c++) {",
      "      if (dp[c - coin] + 1 < dp[c]) {",
      "        dp[c] = dp[c - coin] + 1;",
      "      }",
      "    }",
      "  }",
      "  return dp[amount] === Infinity ? -1 : dp[amount];",
      "}",
    ],
  },
  mistakes: [
    "Trusting the greedy choice — it is only optimal for canonical coin systems, not arbitrary ones.",
    "Forgetting dp[0] = 0; without that base case every amount stays unreachable.",
    "Iterating the amount loop downward, which turns unbounded knapsack into 0/1 and forbids reusing a coin.",
  ],
  interview: [
    "\"Coin change\" (fewest coins) and \"coin change II\" (count combinations) — note the loop order differs.",
    "\"Perfect squares\" — the same DP with squares as the coins.",
    "\"Minimum number of refuelling stops\" — a greedy/DP contrast in the same spirit.",
  ],
  inputs: {
    kind: "text",
    label: "Coins",
    defaultValue: "1, 3, 4",
    extraField: { label: "Amount", defaultValue: "6" },
  },
  legend: [
    ["--c-compare", "amount being solved"],
    ["--c-pointer", "sub-amount it reads"],
    ["--c-done", "answer"],
  ],
  renderer: Grid,
  makeSteps({ text, extra }) {
    const coins = String(text)
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((p) => {
        const n = Number(p);
        if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error(`"${p}" isn't a coin value between 1 and 20.`);
        return n;
      });
    if (!coins.length) throw new Error("Enter at least one coin value, e.g.  1, 3, 4");
    if (coins.length > 5) throw new Error("Keep it to 5 coin values or fewer.");
    const amount = parseIntField(extra, "Amount", 1, 14);

    const INF = Infinity;
    const dp: number[] = new Array(amount + 1).fill(INF);
    dp[0] = 0;
    const rows: (number | null)[][] = [];
    const rowLabels: string[] = [];
    const colLabels = Array.from({ length: amount + 1 }, (_, c) => String(c));
    const asRow = () => dp.map((v) => (v === INF ? null : v));

    const steps: Step<GridState>[] = [];
    const snap = (line: number, desc: string, st: Partial<GridState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `dp = [${dp.map((v) => (v === INF ? "∞" : v)).join(", ")}]`,
        state: { colLabels, rowLabels: [...rowLabels], cells: rows.map((r) => [...r]), ...st },
      });

    rowLabels.push("start");
    rows.push(asRow());
    snap(4, `dp[0] = 0: zero coins make amount 0. Every other amount starts at ∞ — not yet reachable.`, {
      cur: [0, 0],
    });

    for (let k = 0; k < coins.length; k++) {
      const coin = coins[k];
      rowLabels.push(`+${coin}`);
      rows.push(asRow());
      const r = rows.length - 1;
      snap(5, `Now allow the ${coin}-coin, reusable as many times as you like.`);
      for (let c = coin; c <= amount; c++) {
        const cand = dp[c - coin] + 1;
        if (cand < dp[c]) {
          dp[c] = cand;
          rows[r] = asRow();
          snap(8, `Amount ${c}: take a ${coin} and solve ${c - coin} with ${dp[c - coin]} coin${dp[c - coin] === 1 ? "" : "s"} → ${dp[c]} total. Better than before.`, {
            cur: [r, c],
            refs: [[r, c - coin]],
          });
        } else {
          rows[r] = asRow();
          snap(7, `Amount ${c}: using a ${coin} would need ${cand === INF ? "∞" : cand} coins, no better than the current ${dp[c] === INF ? "∞" : dp[c]}. Keep it.`, {
            cur: [r, c],
            refs: [[r, c - coin]],
          });
        }
      }
    }
    const ans = dp[amount];
    snap(11, ans === INF
      ? `Amount ${amount} cannot be made from these coins — return −1.`
      : `Amount ${amount} needs ${ans} coin${ans === 1 ? "" : "s"} at minimum.`,
      { goal: [rows.length - 1, amount] });
    return steps;
  },
  quiz: [
    {
      q: "With coins {1, 3, 4} and amount 6, what does the greedy 'take the biggest that fits' give — and what is optimal?",
      opts: [
        "Greedy gives 3 coins (4+1+1); optimal is 2 (3+3)",
        "Both give 2 coins",
        "Greedy gives 2; optimal is 3",
        "Neither can make 6",
      ],
      answer: 0,
      why: "This is the standard counterexample showing a greedy choice needs proof. Ordinary currency systems happen to be canonical, which is why greedy feels right.",
    },
    {
      q: "Why does the inner loop run upward (c = coin → amount)?",
      opts: [
        "Ascending order lets dp[c − coin] already include this coin, allowing reuse — that's unbounded knapsack",
        "It is faster in that direction",
        "To avoid array bounds errors",
        "Direction makes no difference",
      ],
      answer: 0,
      why: "Descending order would read the previous row's value, permitting each coin only once — exactly 0/1 knapsack. The loop direction encodes the rule.",
    },
    {
      q: "What does dp[amount] still holding ∞ at the end mean?",
      opts: [
        "No combination of the given coins sums to that amount, so return −1",
        "The amount is too large to store",
        "The algorithm failed",
        "The answer is zero",
      ],
      answer: 0,
      why: "∞ marks unreachable. With coins {2, 4} no odd amount is reachable, so those cells never improve.",
    },
  ],
};
