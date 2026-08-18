"use client";

import type { StackState } from "@/lib/types";

/** Vertical stack renderer: last-in on top. */
export function StackBox({ state }: { state: StackState }) {
  const n = state.items.length;
  return (
    <div className="stackbox">
      {n === 0 && <div className="stack-empty mono">(empty)</div>}
      {[...state.items].reverse().map((v, k) => {
        const isTop = k === 0;
        const cls = ["stack-item"];
        if (isTop && state.hl) cls.push(state.hl);
        return (
          <div key={n - 1 - k} className={cls.join(" ")}>
            {v}
            {isTop && <span className="stack-top-tag">← top</span>}
          </div>
        );
      })}
      <div className="stack-base" />
    </div>
  );
}
