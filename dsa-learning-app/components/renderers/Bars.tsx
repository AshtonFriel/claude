"use client";

import type { BarsState } from "@/lib/types";

/** Array-of-bars renderer used by all sorting topics. */
export function Bars({ state }: { state: BarsState }) {
  const { a } = state;
  const max = Math.max(...a.map(Math.abs), 1);
  const inRange = (i: number) => !state.range || (i >= state.range[0] && i <= state.range[1]);

  return (
    <div className="bars">
      {a.map((v, i) => {
        const cls = ["bar-slot"];
        if (state.done || state.sorted?.includes(i)) cls.push("sorted");
        else if (state.swapped?.includes(i)) cls.push("swapped");
        else if (state.compare?.includes(i)) cls.push("compare");
        else if (state.pivot === i) cls.push("pivot");
        if (state.range && !inRange(i) && !cls.includes("sorted")) cls.push("dim");
        else if (state.range && inRange(i)) cls.push("in-range");
        const h = Math.max(8, Math.round((Math.abs(v) / max) * 180));
        return (
          <div key={i} className={cls.join(" ")}>
            <div className="bar" style={{ height: h }} />
            <div className="bar-val">{v}</div>
          </div>
        );
      })}
    </div>
  );
}
