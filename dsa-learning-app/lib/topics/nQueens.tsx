import { Board } from "@/components/renderers/Board";
import type { BoardState, NumsTopic, Step } from "@/lib/types";

export const nQueens: NumsTopic<BoardState> = {
  id: "n-queens",
  category: "Recursion & Backtracking",
  title: "N-Queens",
  tagline: "Place, recurse, undo — the backtracking template",
  complexity: { best: "O(n!)", avg: "O(n!)", worst: "O(n!)", space: "O(n)" },
  about: (
    <>
      <p>
        Place n queens on an n×n board so none attacks another — no shared row, column, or
        diagonal. Backtracking solves it row by row: try each column in the current row;
        if a square is safe, place a queen and recurse into the next row. When a row has no
        safe square, the mistake was earlier — <em>undo</em> the previous placement and try its
        next option. Placing one queen per row handles the row constraint automatically.
      </p>
      <p>Watch the red flashes: each one is a pruned branch that brute force would have wasted time on.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the canonical backtracking exercise. The same
      try–recurse–undo skeleton solves Sudoku, crosswords, graph coloring, SAT solving, and
      constraint satisfaction in schedulers.
    </>
  ),
  code: [
    "static boolean solve(Board board, int row) {",
    "  if (row == board.n) return true;",
    "  for (int col = 0; col < board.n; col++) {",
    "    if (board.safe(row, col)) {",
    "      board.place(row, col);",
    "      if (solve(board, row + 1)) return true;",
    "      board.remove(row, col);",
    "    }",
    "  }",
    "  return false;",
    "}",
  ],
  inputs: { kind: "nums", label: "Board size n", defaultValue: "5", min: 1, max: 1 },
  legend: [
    ["--c-compare", "trying this square"],
    ["--c-active", "attacked / conflict"],
    ["--c-done", "solution"],
  ],
  renderer: Board,
  makeSteps(input) {
    const n = input[0];
    if (n < 4 || n > 7) throw new Error("Pick n between 4 and 7 (n=2 and 3 have no solutions; larger boards make very long runs).");
    const steps: Step<BoardState>[] = [];
    const queens: (number | null)[] = Array(n).fill(null);
    const snap = (line: number, desc: string, extra: Partial<BoardState> = {}) =>
      steps.push({ line, desc, state: { n, queens: [...queens], ...extra } });

    const attackers = (row: number, col: number): [number, number][] => {
      const out: [number, number][] = [];
      for (let r = 0; r < row; r++) {
        const c = queens[r];
        if (c === null) continue;
        if (c === col || Math.abs(c - col) === row - r) out.push([r, c]);
      }
      return out;
    };

    snap(1, `Place ${n} queens on a ${n}×${n} board, one per row, so none can attack another.`);
    const solve = (row: number): boolean => {
      if (row === n) {
        snap(2, `Row ${n} reached — all ${n} queens are placed and none attacks another. Solved! 👑`, { solved: true });
        return true;
      }
      for (let col = 0; col < n; col++) {
        const att = attackers(row, col);
        if (att.length) {
          const [ar, ac] = att[0];
          snap(4, `Row ${row}, column ${col}: attacked by the queen at (${ar}, ${ac}) — unsafe, try the next column.`, {
            tryCell: [row, col],
            conflicts: att,
          });
          continue;
        }
        snap(4, `Row ${row}, column ${col}: safe — no queen shares its column or diagonals.`, { tryCell: [row, col] });
        queens[row] = col;
        snap(5, `Place queen ${row + 1} at (${row}, ${col}) and recurse into row ${row + 1}.`);
        if (solve(row + 1)) return true;
        queens[row] = null;
        snap(7, `Every option below (${row}, ${col}) failed — undo this placement and keep scanning row ${row}.`, {
          tryCell: [row, col],
        });
      }
      snap(10, `No safe column in row ${row} at all — the mistake is earlier. Backtrack.`);
      return false;
    };
    if (!solve(0)) snap(10, `No solution exists for n=${n}.`);
    return steps;
  },
  quiz: [
    {
      q: "What distinguishes backtracking from plain brute force?",
      opts: [
        "It abandons a partial solution the moment it becomes invalid, pruning whole subtrees",
        "It uses iteration instead of recursion",
        "It always finds the optimal solution faster",
        "It requires sorting the input first",
      ],
      answer: 0,
      why: "Brute force enumerates complete arrangements; backtracking kills a branch at the first conflict — never exploring the exponentially many completions of a doomed prefix.",
    },
    {
      q: "Why does placing exactly one queen per row simplify the safety check?",
      opts: [
        "Row conflicts become impossible by construction — only columns and diagonals need checking",
        "It makes the board smaller",
        "Diagonals no longer matter",
        "It guarantees a solution exists",
      ],
      answer: 0,
      why: "The recursion structure itself enforces one constraint, shrinking both the search space and the safe() test.",
    },
    {
      q: "What happens immediately after a recursive call solve(row+1) returns false?",
      opts: [
        "The queen just placed in this row is removed, and the next column is tried",
        "The algorithm gives up",
        "The whole board resets",
        "A queen is added to the same square again",
      ],
      answer: 0,
      why: "That's the 'undo' that gives backtracking its name: unwind the choice, restore the state, try the next candidate.",
    },
  ],
};
