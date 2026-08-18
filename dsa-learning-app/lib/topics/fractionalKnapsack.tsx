import { Cells } from "@/components/renderers/Cells";
import { parseIntField } from "@/lib/parse";
import type { CellsState, Step, TextTopic } from "@/lib/types";

export const fractionalKnapsack: TextTopic<CellsState> = {
  id: "fractional-knapsack",
  category: "Greedy Algorithms",
  title: "Fractional Knapsack",
  tagline: "Best value per kilo first — and you may take a slice",
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
  about: (
    <>
      <p>
        Same setup as 0/1 knapsack — items with weights and values, a capacity — with one change:
        items are divisible. That single relaxation collapses an NP-hard problem into a sort. Rank
        items by value density (value ÷ weight), take them whole while they fit, and slice the last
        one to fill the remaining capacity exactly.
      </p>
      <p>
        The contrast with 0/1 knapsack is the lesson: there, density-greedy fails because a
        half-taken item is worth nothing, so you need the O(n·W) table. Divisibility is what makes
        the greedy exchange argument valid.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> allocating continuous resources — bandwidth, budget,
      compute time, commodity loading. It also supplies the upper bound used to prune branch-and-
      bound solvers for the 0/1 version.
    </>
  ),
  code: [
    "static double fractionalKnapsack(Item[] items, int cap) {",
    "  Arrays.sort(items, (a, b) ->",
    "      Double.compare(b.value / b.weight, a.value / a.weight));",
    "  double total = 0;",
    "  for (Item it : items) {",
    "    if (cap == 0) break;",
    "    if (it.weight <= cap) {",
    "      total += it.value;",
    "      cap -= it.weight;",
    "    } else {",
    "      total += it.value * ((double) cap / it.weight);",
    "      cap = 0;",
    "    }",
    "  }",
    "  return total;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function fractionalKnapsack(items, cap) {",
      "  items.sort((a, b) =>",
      "      b.value / b.weight - a.value / a.weight);",
      "  let total = 0;",
      "  for (const it of items) {",
      "    if (cap === 0) break;",
      "    if (it.weight <= cap) {",
      "      total += it.value;",
      "      cap -= it.weight;",
      "    } else {",
      "      total += it.value * (cap / it.weight);",
      "      cap = 0;",
      "    }",
      "  }",
      "  return total;",
      "}",
    ],
  },
  mistakes: [
    "Sorting by value alone, or by weight alone — the ratio is what matters.",
    "Applying this greedy to 0/1 knapsack, where a partial item earns nothing and the answer can be badly wrong.",
    "Doing the final slice with integer division and silently truncating the fractional value.",
  ],
  interview: [
    "\"Fractional vs 0/1 knapsack — why does greedy work for one and not the other?\" — the classic pairing.",
    "\"Maximum units on a truck\" — fractional knapsack with unit boxes.",
    "\"IPO / maximise capital\" — greedy by a derived ranking key.",
  ],
  inputs: {
    kind: "text",
    label: "Items (w:v)",
    defaultValue: "10:60, 20:100, 30:120",
    extraField: { label: "Capacity", defaultValue: "50" },
  },
  legend: [
    ["--c-compare", "considering"],
    ["--c-done", "taken whole"],
    ["--c-active", "taken as a fraction"],
  ],
  renderer: Cells,
  makeSteps({ text, extra }) {
    const parts = String(text).split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error("Enter items as weight:value pairs, e.g.  10:60, 20:100");
    if (parts.length > 6) throw new Error("Keep it to 6 items or fewer.");
    const items = parts.map((p) => {
      const m = p.match(/^(\d{1,3})\s*:\s*(\d{1,4})$/);
      if (!m) throw new Error(`"${p}" isn't an item. Use  weight:value , e.g.  10:60`);
      const w = Number(m[1]);
      if (w < 1) throw new Error("Weights must be at least 1.");
      return { w, v: Number(m[2]) };
    });
    let cap = parseIntField(extra, "Capacity", 1, 999);

    const sorted = [...items].sort((a, b) => b.v / b.w - a.v / a.w);
    const labels = sorted.map((it) => `${it.w}kg·${it.v}`);
    const whole: number[] = [];
    const partial: number[] = [];
    let total = 0;
    const steps: Step<CellsState>[] = [];
    const snap = (line: number, desc: string, st: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `capacity left: ${cap}  ·  value: ${Math.round(total * 100) / 100}`,
        state: { a: [...labels], hideIndex: true, done: [...whole], active: [...partial], ...st },
      });

    snap(2, `Sorted by value density: ${sorted.map((it) => `${it.w}kg·${it.v} (${(it.v / it.w).toFixed(1)}/kg)`).join(", ")}.`);
    for (let i = 0; i < sorted.length; i++) {
      const it = sorted[i];
      if (cap === 0) {
        snap(6, "The knapsack is full — nothing more fits.", { compare: [i] });
        break;
      }
      snap(7, `Item ${labels[i]} is worth ${(it.v / it.w).toFixed(1)} per kg. Does all ${it.w}kg fit in the remaining ${cap}?`, {
        compare: [i],
      });
      if (it.w <= cap) {
        total += it.v;
        cap -= it.w;
        whole.push(i);
        snap(9, `Yes — take it whole for ${it.v}. Capacity left: ${cap}.`);
      } else {
        const frac = cap / it.w;
        const gained = it.v * frac;
        total += gained;
        partial.push(i);
        snap(12, `Only ${cap} of ${it.w}kg fits — take ${(frac * 100).toFixed(0)}% of it for ${Math.round(gained * 100) / 100}. This slice is exactly what 0/1 knapsack forbids.`);
        cap = 0;
      }
    }
    snap(16, `Maximum value: ${Math.round(total * 100) / 100}. One sort and one pass — no DP table needed.`);
    return steps;
  },
  quiz: [
    {
      q: "Why does the density-greedy work for fractional knapsack but not 0/1?",
      opts: [
        "Divisibility lets the last item be sliced, so capacity is always filled exactly",
        "Fractional knapsack has fewer items",
        "0/1 knapsack has no optimal solution",
        "It works for both",
      ],
      answer: 0,
      why: "In 0/1 a partially taken item earns nothing, so leftover capacity can strand value. Slicing removes that failure mode and makes the exchange argument valid.",
    },
    {
      q: "What is the correct sort key?",
      opts: [
        "value ÷ weight, descending",
        "value, descending",
        "weight, ascending",
        "weight × value, descending",
      ],
      answer: 0,
      why: "Capacity is the scarce resource, so what matters is value per unit of it. Sorting by value alone loses to a slightly cheaper but far lighter item.",
    },
    {
      q: "What dominates the running time?",
      opts: [
        "The sort at O(n log n); the greedy pass is O(n)",
        "The greedy pass at O(n²)",
        "It is O(n · W) like 0/1 knapsack",
        "It is exponential",
      ],
      answer: 0,
      why: "That's the headline result: relaxing to fractions drops an NP-hard O(n·W) problem to a sort. (Quickselect on the median density even gets it to O(n).)",
    },
  ],
};
