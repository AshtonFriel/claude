"use client";

import type { BoardState } from "@/lib/types";

/** N-Queens chessboard renderer. */
export function Board({ state }: { state: BoardState }) {
  const { n } = state;
  const conflicts = new Set((state.conflicts ?? []).map(([r, c]) => `${r}_${c}`));
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cls = ["bd-cell"];
      if ((r + c) % 2 === 1) cls.push("dark");
      const hasQueen = state.queens[r] === c;
      const trying = at(state.tryCell, r, c);
      if (trying) cls.push("try");
      if (conflicts.has(`${r}_${c}`)) cls.push("conflict");
      if (hasQueen && state.solved) cls.push("solved");
      cells.push(
        <div key={`${r}_${c}`} className={cls.join(" ")}>
          {hasQueen ? "♛" : trying ? "♛" : ""}
        </div>,
      );
    }
  }
  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, maxWidth: n * 52 }}>
      {cells}
    </div>
  );
}

const at = (pair: [number, number] | undefined, r: number, c: number) =>
  !!pair && pair[0] === r && pair[1] === c;
