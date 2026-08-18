import { StackBox } from "@/components/renderers/StackBox";
import type { StackState, Step, TextTopic } from "@/lib/types";

const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

export const balancedParens: TextTopic<StackState> = {
  id: "balanced-parentheses",
  category: "Stacks & Queues",
  title: "Balanced Parentheses",
  tagline: "The most recent opener must close first",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(n)" },
  about: (
    <>
      <p>
        Nesting is last-in-first-out, which is exactly what a stack models. Scan the string: push
        every opening bracket; on a closing bracket, pop and check the popped opener matches. Three
        things can go wrong — a closer with an empty stack (nothing was open), a closer that
        doesn&apos;t match the top (crossed nesting like <code>([)]</code>), or leftovers on the
        stack at the end (something never closed).
      </p>
      <p>Counting brackets instead of stacking them cannot work: <code>([)]</code> has equal counts and is still invalid.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> every compiler and JSON/XML parser, editor bracket matching
      and auto-indent, and expression evaluators. It is the canonical demonstration that some
      grammars need a stack rather than a counter.
    </>
  ),
  code: [
    "static boolean isBalanced(String s) {",
    "  Deque<Character> stack = new ArrayDeque<>();",
    "  for (char c : s.toCharArray()) {",
    "    if (c == '(' || c == '[' || c == '{') {",
    "      stack.push(c);",
    "    } else {",
    "      if (stack.isEmpty()) return false;",
    "      if (stack.pop() != match(c)) return false;",
    "    }",
    "  }",
    "  return stack.isEmpty();",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function isBalanced(s) {",
      "  const stack = [];",
      "  for (const c of s) {",
      "    if (c === '(' || c === '[' || c === '{') {",
      "      stack.push(c);",
      "    } else {",
      "      if (stack.length === 0) return false;",
      "      if (stack.pop() !== MATCH[c]) return false;",
      "    }",
      "  }",
      "  return stack.length === 0;",
      "}",
    ],
  },
  mistakes: [
    "Counting openers and closers instead of stacking them — \"([)]\" passes a counter and is still invalid.",
    "Forgetting the empty-stack check before popping on a closing bracket.",
    "Returning true at the end without checking the stack is empty, so \"(((\" is reported balanced.",
  ],
  interview: [
    "\"Valid parentheses\" — asked verbatim, constantly.",
    "\"Longest valid parentheses substring\" — a stack of indices.",
    "\"Remove invalid parentheses\" / \"minimum add to make valid\" — same machinery, harder bookkeeping.",
  ],
  inputs: { kind: "text", label: "Brackets", defaultValue: "{[()]}([])" },
  legend: [
    ["--c-done", "pushed opener"],
    ["--c-active", "popping to match"],
    ["--c-compare", "mismatch"],
  ],
  renderer: StackBox,
  makeSteps({ text }) {
    const s = String(text).replace(/\s+/g, "");
    if (!s) throw new Error("Enter a bracket string, e.g.  {[()]}");
    if (s.length > 18) throw new Error("Keep it to 18 characters or fewer so the animation stays readable.");
    if (!/^[()[\]{}]+$/.test(s)) throw new Error("Use only these characters:  ( ) [ ] { }");

    const steps: Step<StackState>[] = [];
    const stack: string[] = [];
    const snap = (line: number, desc: string, hl?: StackState["hl"], mark = -1) =>
      steps.push({
        line,
        desc,
        aux: `input: ${[...s].map((c, i) => (i === mark ? `[${c}]` : c)).join("")}`,
        state: { items: [...stack], hl },
      });

    snap(2, `Scan "${s}" left to right with an empty stack.`);
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (!PAIRS[c]) {
        stack.push(c);
        snap(5, `'${c}' opens a group — push it. The stack now remembers ${stack.length} unclosed bracket${stack.length === 1 ? "" : "s"}.`, "push", i);
        continue;
      }
      if (!stack.length) {
        snap(7, `'${c}' closes a group, but the stack is empty — nothing was open. Not balanced.`, undefined, i);
        return steps;
      }
      const top = stack[stack.length - 1];
      snap(8, `'${c}' must match the most recent opener, which is '${top}'.`, "pop", i);
      stack.pop();
      if (top !== PAIRS[c]) {
        snap(8, `'${top}' does not match '${c}' — the groups cross, like ([)]. Not balanced.`, undefined, i);
        return steps;
      }
      snap(8, `'${top}' matches '${c}' — that group is closed and leaves the stack.`, undefined, i);
    }
    if (stack.length) {
      snap(10, `End of string, but ${stack.length} bracket${stack.length === 1 ? "" : "s"} never closed. Not balanced.`);
    } else {
      snap(10, "End of string with an empty stack — every group opened and closed in the right order. Balanced ✓");
    }
    return steps;
  },
  quiz: [
    {
      q: "Why can't you validate brackets by counting openers and closers?",
      opts: [
        "Counting ignores order, so \"([)]\" passes despite crossed nesting",
        "Counting is too slow",
        "Counting uses more memory",
        "You can — counting is equivalent",
      ],
      answer: 0,
      why: "A counter tracks how many are open, not which. The stack records identity and order, which is exactly what nesting requires.",
    },
    {
      q: "Which three failure cases must the algorithm handle?",
      opts: [
        "Closer on an empty stack, closer that mismatches the top, and a non-empty stack at the end",
        "Only mismatched pairs",
        "Only unclosed brackets",
        "Only an empty input string",
      ],
      answer: 0,
      why: "Miss the last one and \"(((\" is reported valid; miss the first and a leading \")\" crashes or passes.",
    },
    {
      q: "What is the worst-case space complexity?",
      opts: [
        "O(n) — an input of all openers stacks every character",
        "O(1)",
        "O(log n)",
        "O(n²)",
      ],
      answer: 0,
      why: "\"((((((\" pushes every character before discovering the failure at the end, so the stack grows to the length of the input.",
    },
  ],
};
