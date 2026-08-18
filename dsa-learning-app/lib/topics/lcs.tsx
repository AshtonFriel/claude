import { Grid } from "@/components/renderers/Grid";
import type { GridState, Step, TextTopic } from "@/lib/types";

export const lcs: TextTopic<GridState> = {
  id: "lcs",
  category: "Dynamic Programming",
  title: "Longest Common Subsequence",
  tagline: "Match a character, or drop one and try again",
  complexity: { best: "O(m·n)", avg: "O(m·n)", worst: "O(m·n)", space: "O(m·n)" },
  about: (
    <>
      <p>
        A subsequence keeps order but need not be contiguous — &ldquo;ace&rdquo; is a subsequence of
        &ldquo;abcde&rdquo;. The LCS of two strings is the longest sequence appearing in both.
        The recurrence has just two cases: if the current characters match, they must be part of the
        answer, so take the diagonal cell plus one. If they don&apos;t, one of the two characters
        can be dropped — take the better of up and left.
      </p>
      <p>
        Every cell is filled from cells above and to the left, so a simple two-loop sweep in reading
        order works. The bottom-right corner holds the answer&apos;s length.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> <code>git diff</code> and every other diff tool, DNA and
      protein sequence alignment in bioinformatics, plagiarism detection, and file-merge conflict
      resolution. Edit distance is the same table with a different recurrence.
    </>
  ),
  code: [
    "static int lcs(String a, String b) {",
    "  int m = a.length(), n = b.length();",
    "  int[][] dp = new int[m + 1][n + 1];",
    "  for (int i = 1; i <= m; i++) {",
    "    for (int j = 1; j <= n; j++) {",
    "      if (a.charAt(i - 1) == b.charAt(j - 1)) {",
    "        dp[i][j] = dp[i - 1][j - 1] + 1;",
    "      } else {",
    "        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);",
    "      }",
    "    }",
    "  }",
    "  return dp[m][n];",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function lcs(a, b) {",
      "  const m = a.length, n = b.length;",
      "  const dp = zeros(m + 1, n + 1);",
      "  for (let i = 1; i <= m; i++) {",
      "    for (let j = 1; j <= n; j++) {",
      "      if (a[i - 1] === b[j - 1]) {",
      "        dp[i][j] = dp[i - 1][j - 1] + 1;",
      "      } else {",
      "        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);",
      "      }",
      "    }",
      "  }",
      "  return dp[m][n];",
      "}",
    ],
  },
  mistakes: [
    "Mixing up subsequence and substring — LCS allows gaps; longest common substring needs contiguity and a different recurrence.",
    "Indexing the strings with i and j instead of i − 1 and j − 1; row/column 0 represent the empty prefix.",
    "On a match, taking max(up, left) + 1 instead of the diagonal — that can reuse a character twice.",
  ],
  interview: [
    "\"Longest common subsequence\" — asked directly.",
    "\"Edit distance\" — the same grid, minimising operations instead of maximising matches.",
    "\"Delete operation for two strings\" — m + n − 2·LCS.",
  ],
  inputs: {
    kind: "text",
    label: "String A",
    defaultValue: "ABCBDAB",
    extraField: { label: "String B", defaultValue: "BDCABA" },
  },
  legend: [
    ["--c-compare", "cell being computed"],
    ["--c-pointer", "cells it reads"],
    ["--c-done", "answer"],
  ],
  renderer: Grid,
  makeSteps({ text, extra }) {
    const a = String(text).trim().toUpperCase().replace(/[^A-Z]/g, "");
    const b = String(extra ?? "").trim().toUpperCase().replace(/[^A-Z]/g, "");
    if (!a || !b) throw new Error("Enter two non-empty strings of letters.");
    if (a.length > 8 || b.length > 8) throw new Error("Keep both strings to 8 letters or fewer so the table stays readable.");

    const m = a.length;
    const n = b.length;
    const cells: (number | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null));
    for (let j = 0; j <= n; j++) cells[0][j] = 0;
    for (let i = 0; i <= m; i++) cells[i][0] = 0;
    const colLabels = ["ε", ...b.split("")];
    const rowLabels = ["ε", ...a.split("")];
    const steps: Step<GridState>[] = [];
    const snap = (line: number, desc: string, st: Partial<GridState> = {}) =>
      steps.push({ line, desc, state: { colLabels, rowLabels, cells: cells.map((r) => [...r]), ...st } });

    snap(3, `Row and column ε stand for the empty prefix — an empty string shares nothing, so they are all 0.`);
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          cells[i][j] = cells[i - 1][j - 1]! + 1;
          snap(7, `'${a[i - 1]}' = '${b[j - 1]}' — this character joins the subsequence: diagonal ${cells[i - 1][j - 1]} + 1 = ${cells[i][j]}.`, {
            cur: [i, j],
            refs: [[i - 1, j - 1]],
          });
        } else {
          const up = cells[i - 1][j]!;
          const left = cells[i][j - 1]!;
          cells[i][j] = Math.max(up, left);
          snap(9, `'${a[i - 1]}' ≠ '${b[j - 1]}' — drop one character and keep the better option: max(${up}, ${left}) = ${cells[i][j]}.`, {
            cur: [i, j],
            refs: [[i - 1, j], [i, j - 1]],
          });
        }
      }
    }
    snap(13, `The longest common subsequence of "${a}" and "${b}" has length ${cells[m][n]}.`, { goal: [m, n] });
    return steps;
  },
  quiz: [
    {
      q: "What is the difference between a subsequence and a substring?",
      opts: [
        "A subsequence keeps order but allows gaps; a substring must be contiguous",
        "They are the same thing",
        "A subsequence must be sorted",
        "A substring allows reordering",
      ],
      answer: 0,
      why: "\"ace\" is a subsequence of \"abcde\" but not a substring. The two problems need different recurrences.",
    },
    {
      q: "When the two characters match, why take the diagonal cell rather than max(up, left)?",
      opts: [
        "The diagonal is the answer for both prefixes without either character, so adding this pair can't double-count",
        "The diagonal is always the largest",
        "It makes the loop faster",
        "Because the strings are the same length",
      ],
      answer: 0,
      why: "Up and left each still contain one of the current characters. Only the diagonal excludes both, so extending it by this matched pair is safe.",
    },
    {
      q: "What are the time and space complexities for strings of length m and n?",
      opts: [
        "O(m·n) time and O(m·n) space — reducible to O(min(m, n)) space",
        "O(m + n) time",
        "O(2^n) time",
        "O(m·n) time and O(1) space",
      ],
      answer: 0,
      why: "Every cell is filled once. Each row only reads the row above, so keeping two rows suffices if you only need the length — reconstructing the actual subsequence needs the full table.",
    },
  ],
};
