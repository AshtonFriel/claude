"use client";

import type { GridState } from "@/lib/types";

const at = (pair: [number, number] | undefined, r: number, c: number) =>
  !!pair && pair[0] === r && pair[1] === c;

/** DP-table renderer (row/column labelled grid of numbers). */
export function Grid({ state }: { state: GridState }) {
  return (
    <div className="grid-wrap">
      <table className="dp-grid">
        <thead>
          <tr>
            <th />
            {state.colLabels.map((l, c) => (
              <th key={c}>{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.cells.map((row, r) => (
            <tr key={r}>
              <th>{state.rowLabels[r]}</th>
              {row.map((v, c) => {
                const cls = [];
                if (at(state.cur, r, c)) cls.push("cur");
                else if ((state.refs ?? []).some((p) => p[0] === r && p[1] === c)) cls.push("ref");
                else if (at(state.goal, r, c)) cls.push("goal");
                if (v === null) cls.push("unset");
                return (
                  <td key={c} className={cls.join(" ") || undefined}>
                    {v ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
