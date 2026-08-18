"use client";

import type { CellsState } from "@/lib/types";

/** Boxes-in-a-row renderer: searches, windows, memo tables, queues, subsets. */
export function Cells({ state }: { state: CellsState }) {
  if (!state.a.length) return <p className="cells-empty mono">{state.empty ?? "(empty)"}</p>;
  const inRange = (i: number) => !state.range || (i >= state.range[0] && i <= state.range[1]);

  return (
    <div className="cells">
      {state.a.map((v, i) => {
        const cls = ["cell"];
        if (state.done?.includes(i)) cls.push("done");
        else if (state.active?.includes(i)) cls.push("active");
        else if (state.compare?.includes(i)) cls.push("compare");
        if (state.range && inRange(i)) cls.push("in-range");
        if (state.dimOutside && !inRange(i) && !cls.includes("done")) cls.push("dim");
        const myPtrs = (state.ptrs ?? []).filter((p) => p.idx === i);
        return (
          <div key={i} className="cell-slot">
            <div className={cls.join(" ")}>{v}</div>
            {!state.hideIndex && <div className="cell-idx">{i}</div>}
            {myPtrs.map((p) => (
              <div key={p.name} className="cell-ptr" style={{ color: p.color }}>
                ▲ {p.name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
