import { StackBox } from "@/components/renderers/StackBox";
import { parseOps } from "@/lib/parse";
import type { StackState, Step, TextTopic } from "@/lib/types";

export const stackOps: TextTopic<StackState> = {
  id: "stack-ops",
  category: "Stacks & Queues",
  title: "Stack Operations",
  tagline: "Last in, first out — everything happens at the top",
  complexity: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(n)" },
  about: (
    <>
      <p>
        A stack is a pile: you can only <code>push</code> onto the top, <code>pop</code> off the
        top, or <code>peek</code> at the top. That last-in-first-out (LIFO) discipline is the
        whole data structure — and it&apos;s exactly the shape of nested things: function
        calls, brackets, undo history. Every operation touches only the top, so each is O(1).
      </p>
      <p>Write your own script of operations below and watch the pile grow and shrink.</p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the call stack itself, undo/redo, balanced-bracket
      checking, expression evaluation (postfix), browser back button, and DFS — recursion is
      just a stack you don&apos;t see.
    </>
  ),
  code: [
    "class Stack {",
    "  private List<Integer> items = new ArrayList<>();",
    "  void push(int x) {",
    "    items.add(x);",
    "  }",
    "  int pop() {",
    "    return items.remove(items.size() - 1);",
    "  }",
    "  int peek() {",
    "    return items.get(items.size() - 1);",
    "  }",
    "}",
  ],
  inputs: {
    kind: "text",
    label: "Operations",
    defaultValue: "push 4, push 9, push 2, pop, push 7, peek, pop, pop",
  },
  legend: [
    ["--c-done", "pushed"],
    ["--c-active", "popping"],
    ["--c-compare", "peeking"],
  ],
  renderer: StackBox,
  makeSteps({ text }) {
    const ops = parseOps(text, { push: true, pop: false, peek: false });
    const steps: Step<StackState>[] = [];
    const items: number[] = [];
    const log: string[] = [];
    const aux = () => (log.length ? `returned: ${log.join(", ")}` : "returned: (nothing yet)");
    const snap = (line: number, desc: string, hl?: StackState["hl"]) =>
      steps.push({ line, desc, aux: aux(), state: { items: [...items], hl } });

    snap(2, `Start with an empty stack. Script: ${ops.length} operation${ops.length > 1 ? "s" : ""}.`);
    for (const { op, arg } of ops) {
      if (op === "push") {
        items.push(arg!);
        snap(4, `push(${arg}) — ${arg} goes on top of the pile.`, "push");
      } else if (op === "pop") {
        if (!items.length) {
          snap(7, "pop() on an empty stack — underflow! Real code would throw an exception. Skipping.");
          continue;
        }
        const top = items[items.length - 1];
        snap(6, `pop() — the top is ${top}; it's the most recent survivor, so it leaves first.`, "pop");
        items.pop();
        log.push(String(top));
        snap(7, `${top} is removed and returned. The element under it is the new top.`);
      } else {
        if (!items.length) {
          snap(10, "peek() on an empty stack — nothing to look at. Skipping.");
          continue;
        }
        const top = items[items.length - 1];
        log.push(`${top} (peek)`);
        snap(10, `peek() — read the top (${top}) without removing it.`, "peek");
      }
    }
    snap(1, `Script finished — ${items.length} item${items.length === 1 ? "" : "s"} left on the stack.`);
    return steps;
  },
  quiz: [
    {
      q: "After push(1), push(2), push(3), pop(), push(4), pop() — what remains on the stack (bottom → top)?",
      opts: ["[1, 2]", "[1, 4]", "[3, 4]", "[1, 2, 3]"],
      answer: 0,
      why: "pop() removes 3, push(4) adds 4, the final pop() removes 4 — leaving [1, 2].",
    },
    {
      q: "What is the time complexity of push, pop, and peek?",
      opts: [
        "O(1) each — they only touch the top",
        "O(n) each — the whole pile shifts",
        "push O(1), pop O(n)",
        "O(log n) each",
      ],
      answer: 0,
      why: "No traversal ever happens; the stack keeps a direct handle on its top element.",
    },
    {
      q: "Checking balanced brackets like \"([{}])\" uses a stack how?",
      opts: [
        "Push opening brackets; on a closing bracket, pop and check it matches",
        "Push every character and count them at the end",
        "Pop opening brackets, push closing ones",
        "A stack can't check brackets — that needs a queue",
      ],
      answer: 0,
      why: "The most recently opened bracket must close first — exactly LIFO. A mismatch or leftover items means unbalanced.",
    },
  ],
};
