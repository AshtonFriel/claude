"use client";

import { useEffect, useMemo, useState } from "react";
import { topicById } from "@/lib/topics";
import type { BarsState, NumsTopic, Step } from "@/lib/types";

const SEED = [42, 78, 15, 63, 91, 34, 57, 22, 88, 49, 71, 10, 60, 37, 95, 26, 53, 81, 18, 68];

/** Condensed listings for the hero, with a map from the topic's real
    Java line number to the line shown here. */
const DEMOS: Record<string, { id: string; code: string[]; map: Record<number, number> }> = {
  "Bubble Sort": {
    id: "bubble-sort",
    code: ["for i in 0 .. n-1", "  for j in 0 .. n-i-2", "    if a[j] > a[j+1]", "      swap a[j], a[j+1]", "return a"],
    map: { 2: 1, 3: 1, 4: 1, 5: 2, 6: 3, 7: 4, 11: 5, 13: 5 },
  },
  "Quick Sort": {
    id: "quick-sort",
    code: ["quickSort(a, lo, hi):", "  if lo >= hi: return", "  p = partition(a, lo, hi)", "  quickSort(a, lo, p-1)", "  quickSort(a, p+1, hi)"],
    map: { 1: 1, 2: 2, 8: 3, 11: 3, 12: 3, 13: 3, 16: 3, 5: 5 },
  },
  "Merge Sort": {
    id: "merge-sort",
    code: ["mergeSort(a, lo, hi):", "  mid = (lo+hi)/2", "  mergeSort(a, lo, mid)", "  mergeSort(a, mid+1, hi)", "  merge(a, lo, mid, hi)"],
    map: { 1: 1, 2: 1, 3: 2, 6: 5, 12: 5, 13: 5, 14: 5, 16: 5 },
  },
};

const NAMES = Object.keys(DEMOS);

export function HeroDemo() {
  const [name, setName] = useState(NAMES[0]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);

  const run = useMemo(() => {
    const demo = DEMOS[name];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topic = topicById(demo.id) as NumsTopic<any>;
    const steps = topic.makeSteps([...SEED]) as Step<BarsState>[];
    // running totals so the counter reads like a real profiler
    let cmp = 0;
    let wr = 0;
    const stats = steps.map((s) => {
      if (s.state.compare?.length) cmp++;
      if (s.state.swapped?.length) wr++;
      return { cmp, wr };
    });
    return { demo, steps, stats };
  }, [name]);

  const max = Math.max(...SEED);
  const total = run.steps.length - 1;

  useEffect(() => {
    setIdx(0);
    setPlaying(true);
  }, [run]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setIdx((i) => (i >= total ? 0 : i + 1)), 70);
    return () => clearTimeout(t);
  }, [playing, idx, total]);

  const step = run.steps[Math.min(idx, total)];
  const st = step.state;
  const stat = run.stats[Math.min(idx, total)];
  const shownLine = run.demo.map[step.line] ?? 0;

  return (
    <div className="card demo">
      <div className="demo-h">
        <div className="demo-tabs" role="group" aria-label="Algorithm">
          {NAMES.map((n) => (
            <button key={n} className={`demo-tab${n === name ? " on" : ""}`} onClick={() => setName(n)}>
              {n}
            </button>
          ))}
        </div>
        <span className="demo-count">
          {stat.cmp} comparisons · {stat.wr} writes
        </span>
      </div>

      <div className="demo-bars" aria-hidden="true">
        {st.a.map((v, i) => {
          const cls =
            st.done || st.sorted?.includes(i)
              ? "srt"
              : st.compare?.includes(i) || st.swapped?.includes(i) || st.pivot === i
                ? "cmp"
                : "";
          return <div key={i} className={`demo-bar ${cls}`} style={{ height: `${Math.round((v / max) * 100)}%` }} />;
        })}
      </div>

      <div className="demo-rule"><i /></div>

      <div className="demo-code">
        {run.demo.code.map((t, i) => (
          <div key={i} className={`demo-code-line${i + 1 === shownLine ? " on" : ""}`}>
            <span>{i + 1}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>

      <div className="demo-foot">
        <button className="btn btn-primary" style={{ minWidth: 84 }} onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </button>
        <button className="btn btn-ghost" onClick={() => { setPlaying(false); setIdx((i) => Math.min(i + 1, total)); }}>
          Step
        </button>
        <button className="btn btn-ghost" onClick={() => { setIdx(0); setPlaying(true); }}>Reset</button>
        <input
          type="range"
          min={0}
          max={total}
          value={Math.min(idx, total)}
          aria-label="Scrub demo steps"
          onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)); }}
        />
      </div>
    </div>
  );
}
