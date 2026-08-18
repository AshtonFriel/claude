import { Cells } from "@/components/renderers/Cells";
import type { CellsState, Step, TextTopic } from "@/lib/types";

interface Iv { s: number; e: number; }

export const intervalScheduling: TextTopic<CellsState> = {
  id: "interval-scheduling",
  category: "Greedy Algorithms",
  title: "Interval Scheduling",
  tagline: "Always take the meeting that ends soonest",
  complexity: { best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)" },
  about: (
    <>
      <p>
        Given a pile of intervals, select the most that don&apos;t overlap. The winning rule is
        counter-intuitive: sort by <em>end</em> time and greedily take any interval starting at or
        after the last one you took. Sorting by start time, or by shortest duration, both fail on
        easy counterexamples.
      </p>
      <p>
        The proof is an exchange argument: the interval that finishes earliest leaves the maximum
        room for everything after it, so some optimal solution can always be rewritten to begin with
        it. Greedy is safe here — unlike coin change, where it isn&apos;t.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> conference-room and CPU scheduling, ad-slot and broadcast
      allocation, and the &ldquo;minimum removals to make intervals non-overlapping&rdquo; family.
      The end-time sort also drives interval merging and the meeting-rooms problems.
    </>
  ),
  code: [
    "static int maxNonOverlapping(Interval[] iv) {",
    "  Arrays.sort(iv, (x, y) -> x.end - y.end);",
    "  int count = 0;",
    "  int lastEnd = Integer.MIN_VALUE;",
    "  for (Interval i : iv) {",
    "    if (i.start >= lastEnd) {",
    "      count++;",
    "      lastEnd = i.end;",
    "    }",
    "  }",
    "  return count;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function maxNonOverlapping(iv) {",
      "  iv.sort((x, y) => x.end - y.end);",
      "  let count = 0;",
      "  let lastEnd = -Infinity;",
      "  for (const i of iv) {",
      "    if (i.start >= lastEnd) {",
      "      count++;",
      "      lastEnd = i.end;",
      "    }",
      "  }",
      "  return count;",
      "}",
    ],
  },
  mistakes: [
    "Sorting by start time — [0,10] then gets picked first and blocks everything behind it.",
    "Sorting by shortest duration — a short interval straddling two others can knock out both.",
    "Using > instead of >= when intervals that merely touch (one ends exactly as the next begins) should be allowed.",
  ],
  interview: [
    "\"Non-overlapping intervals\" — total minus this count is the number to remove.",
    "\"Meeting rooms II\" — the related question of how many rooms are needed at once.",
    "\"Minimum number of arrows to burst balloons\" — the same end-time greedy.",
  ],
  inputs: { kind: "text", label: "Intervals (s-e)", defaultValue: "1-4, 3-5, 0-6, 5-7, 3-9, 5-9, 6-10, 8-11" },
  legend: [
    ["--c-compare", "under consideration"],
    ["--c-done", "selected"],
    ["--c-active", "rejected — overlaps"],
  ],
  renderer: Cells,
  makeSteps({ text }) {
    const parts = String(text).split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) throw new Error("Enter intervals like  1-4, 3-5, 0-6");
    if (parts.length > 10) throw new Error("Keep it to 10 intervals or fewer so the row stays readable.");
    const raw: Iv[] = parts.map((p) => {
      const m = p.match(/^(\d{1,3})\s*-\s*(\d{1,3})$/);
      if (!m) throw new Error(`"${p}" isn't an interval. Use  start-end , e.g.  1-4`);
      const s = Number(m[1]);
      const e = Number(m[2]);
      if (e <= s) throw new Error(`"${p}" must end after it starts.`);
      return { s, e };
    });

    const iv = [...raw].sort((x, y) => x.e - y.e || x.s - y.s);
    const labels = iv.map((i) => `${i.s}-${i.e}`);
    const chosen: number[] = [];
    const rejected: number[] = [];
    const steps: Step<CellsState>[] = [];
    let lastEnd = -Infinity;
    const snap = (line: number, desc: string, st: Partial<CellsState> = {}) =>
      steps.push({
        line,
        desc,
        aux: `last end: ${lastEnd === -Infinity ? "—" : lastEnd}  ·  selected: ${chosen.map((k) => labels[k]).join(", ") || "none"}`,
        state: { a: [...labels], hideIndex: true, done: [...chosen], active: [...rejected], ...st },
      });

    snap(2, `Sorted by END time: ${labels.join(", ")}. This ordering is the whole algorithm.`);
    snap(4, "Nothing selected yet, so any interval is compatible.");
    for (let i = 0; i < iv.length; i++) {
      const it = iv[i];
      snap(6, `Consider ${labels[i]}. Does it start at or after the last selected end (${lastEnd === -Infinity ? "—" : lastEnd})?`, {
        compare: [i],
      });
      if (it.s >= lastEnd) {
        chosen.push(i);
        lastEnd = it.e;
        snap(8, `Yes — take ${labels[i]}. It finishes at ${it.e}, leaving the most room for what follows.`);
      } else {
        rejected.push(i);
        snap(6, `No — ${labels[i]} starts at ${it.s}, before ${lastEnd}. It overlaps, so skip it.`);
      }
    }
    snap(11, `Maximum compatible set: ${chosen.length} intervals — ${chosen.map((k) => labels[k]).join(", ")}.`);
    return steps;
  },
  quiz: [
    {
      q: "Why sort by end time rather than start time?",
      opts: [
        "Finishing earliest leaves the most room for the remaining intervals",
        "End times are easier to compare",
        "Start times may be negative",
        "It doesn't matter — both work",
      ],
      answer: 0,
      why: "Sorting by start lets a single long interval like [0,10] get picked first and block everything. The earliest finisher is provably safe by an exchange argument.",
    },
    {
      q: "Why does greedy provably work here when it fails for coin change?",
      opts: [
        "An exchange argument shows some optimal solution can always start with the earliest finisher",
        "Because intervals are sorted",
        "Because the input is small",
        "It doesn't work — this is also just a heuristic",
      ],
      answer: 0,
      why: "Greedy needs a proof, not intuition. Here you can swap the first interval of any optimal solution for the earliest finisher without losing anything.",
    },
    {
      q: "What dominates the running time?",
      opts: [
        "The sort, at O(n log n) — the scan afterwards is only O(n)",
        "The scan, at O(n²)",
        "Nothing — it is O(1)",
        "The comparison of start times",
      ],
      answer: 0,
      why: "One linear pass follows the sort, so the sort dominates. If the intervals arrive pre-sorted by end time, the whole thing is O(n).",
    },
  ],
};
