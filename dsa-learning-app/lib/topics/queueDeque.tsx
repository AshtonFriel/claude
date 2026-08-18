import { Cells } from "@/components/renderers/Cells";
import { parseOps } from "@/lib/parse";
import type { CellsState, Step, TextTopic } from "@/lib/types";

export const queueDeque: TextTopic<CellsState> = {
  id: "queue-deque",
  category: "Stacks & Queues",
  title: "Queue & Deque",
  tagline: "First in, first out — a fair waiting line",
  complexity: { best: "O(1)", avg: "O(1)", worst: "O(1)", space: "O(n)" },
  about: (
    <>
      <p>
        A queue is a waiting line: elements <code>enqueue</code> at the back and{" "}
        <code>dequeue</code> from the front, so whoever arrived first is served first (FIFO). A{" "}
        <em>deque</em> (&ldquo;double-ended queue&rdquo;, like Java&apos;s{" "}
        <code>ArrayDeque</code>) generalizes this by allowing O(1) adds and removes at{" "}
        <em>both</em> ends — which is why it&apos;s the standard backing class for both queues
        and stacks in Java.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> BFS frontiers, task schedulers and message queues,
      printer/job spooling, rate limiters, and sliding-window problems (monotonic deque). Any
      &ldquo;process in arrival order&rdquo; requirement is a queue.
    </>
  ),
  code: [
    "class ArrayQueue {",
    "  private Deque<Integer> items = new ArrayDeque<>();",
    "  void enqueue(int x) {",
    "    items.addLast(x);",
    "  }",
    "  int dequeue() {",
    "    return items.removeFirst();",
    "  }",
    "  int front() {",
    "    return items.peekFirst();",
    "  }",
    "}",
  ],
  inputs: {
    kind: "text",
    label: "Operations",
    defaultValue: "enqueue 5, enqueue 12, enqueue 3, dequeue, enqueue 8, front, dequeue",
  },
  legend: [
    ["--c-done", "enqueued (back)"],
    ["--c-active", "dequeuing (front)"],
    ["--c-compare", "front()"],
  ],
  renderer: Cells,
  makeSteps({ text }) {
    const ops = parseOps(text, { enqueue: true, dequeue: false, front: false });
    const steps: Step<CellsState>[] = [];
    const items: number[] = [];
    const log: string[] = [];
    const aux = () => (log.length ? `returned: ${log.join(", ")}` : "returned: (nothing yet)");
    const state = (extra: Partial<CellsState> = {}): CellsState => ({
      a: [...items],
      hideIndex: true,
      empty: "(empty queue)",
      ptrs: items.length
        ? [
            { name: "front", idx: 0, color: "var(--c-active)" },
            ...(items.length > 1 ? [{ name: "back", idx: items.length - 1, color: "var(--c-pointer)" }] : []),
          ]
        : [],
      ...extra,
    });
    const snap = (line: number, desc: string, extra: Partial<CellsState> = {}) =>
      steps.push({ line, desc, aux: aux(), state: state(extra) });

    snap(2, "Start with an empty queue. The front is on the left, the back on the right.");
    for (const { op, arg } of ops) {
      if (op === "enqueue") {
        items.push(arg!);
        snap(4, `enqueue(${arg}) — ${arg} joins at the BACK of the line.`, { done: [items.length - 1] });
      } else if (op === "dequeue") {
        if (!items.length) {
          snap(7, "dequeue() on an empty queue — underflow! Real code would throw. Skipping.");
          continue;
        }
        const first = items[0];
        snap(6, `dequeue() — the front is ${first}; it arrived earliest, so it leaves first.`, { active: [0] });
        items.shift();
        log.push(String(first));
        snap(7, `${first} is removed and returned. Everyone behind steps forward.`);
      } else {
        if (!items.length) {
          snap(10, "front() on an empty queue — nothing to look at. Skipping.");
          continue;
        }
        log.push(`${items[0]} (front)`);
        snap(10, `front() — read the front (${items[0]}) without removing it.`, { compare: [0] });
      }
    }
    snap(1, `Script finished — ${items.length} item${items.length === 1 ? "" : "s"} still waiting in line.`);
    return steps;
  },
  quiz: [
    {
      q: "After enqueue(1), enqueue(2), dequeue(), enqueue(3) — what does dequeue() return next?",
      opts: ["1", "2", "3", "Nothing — the queue is empty"],
      answer: 1,
      why: "FIFO: 1 already left. Of the remaining [2, 3], 2 arrived first, so it's served next.",
    },
    {
      q: "Why is a plain array a poor queue if you dequeue with shift-everything-left?",
      opts: [
        "Dequeue becomes O(n) — every element must move",
        "Arrays can't shrink in Java",
        "It breaks FIFO order",
        "It's fine — that's how ArrayDeque works internally",
      ],
      answer: 0,
      why: "Removing index 0 from a contiguous array shifts all n−1 remaining elements. Ring buffers (like ArrayDeque) and linked lists dequeue in O(1) instead.",
    },
    {
      q: "What extra ability does a deque have over a plain queue?",
      opts: [
        "O(1) insertion and removal at BOTH ends",
        "O(1) access to the middle",
        "Automatic sorting",
        "Thread safety",
      ],
      answer: 0,
      why: "A deque serves as queue (addLast/removeFirst) or stack (addFirst/removeFirst) — which is why ArrayDeque backs both in Java.",
    },
  ],
};
