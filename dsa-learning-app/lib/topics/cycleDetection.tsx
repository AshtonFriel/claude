import { LinkedList } from "@/components/renderers/LinkedList";
import { parseIntField } from "@/lib/parse";
import type { ListChip, ListState, NumsTopic, Step } from "@/lib/types";

export const cycleDetection: NumsTopic<ListState> = {
  id: "cycle-detection",
  category: "Linked Lists",
  title: "Cycle Detection",
  tagline: "Floyd's tortoise and hare: two speeds, one meeting",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  about: (
    <>
      <p>
        If a linked list&apos;s last node points back into the chain, every traversal loops
        forever. Floyd&apos;s algorithm detects this with two pointers moving at different
        speeds: <code>slow</code> advances one node per step, <code>fast</code> advances two.
        In a cycle, fast gains on slow by exactly one node per step, so they <em>must</em> meet
        — with no cycle, fast simply falls off the end. All in O(1) extra space.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> a top-tier interview classic; detecting loops in
      corrupted data structures; finding duplicate numbers (the array-as-linked-list trick);
      and cycle finding in sequences like pseudo-random generators.
    </>
  ),
  code: [
    "static boolean hasCycle(Node head) {",
    "  Node slow = head;",
    "  Node fast = head;",
    "  while (fast != null && fast.next != null) {",
    "    slow = slow.next;",
    "    fast = fast.next.next;",
    "    if (slow == fast) return true;",
    "  }",
    "  return false;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "List values",
    defaultValue: "1, 2, 3, 4, 5, 6",
    max: 7,
    allowDup: false,
    extraField: { label: "Loop to #", defaultValue: "2" },
  },
  codeAlt: {
    javascript: [
      "function hasCycle(head) {",
      "  let slow = head;",
      "  let fast = head;",
      "  while (fast !== null && fast.next !== null) {",
      "    slow = slow.next;",
      "    fast = fast.next.next;",
      "    if (slow === fast) return true;",
      "  }",
      "  return false;",
      "}",
    ],
  },
  mistakes: [
    "Checking only fast !== null — fast.next.next then throws on the last node of an acyclic list.",
    "Comparing node values instead of node references; duplicate values give false positives.",
    "Testing slow === fast before moving them — they start equal at head, so it returns true instantly.",
  ],
  interview: [
    "\"Linked list cycle II\" — after they meet, reset one pointer to head; they meet again at the cycle start.",
    "\"Find the duplicate number\" — treat the array as a linked list, run Floyd on it.",
    "\"Happy number\" — cycle detection over the digit-square-sum sequence.",
  ],
  legend: [
    ["--c-compare", "slow (1×)"],
    ["--c-active", "fast (2×)"],
    ["--c-done", "cycle link"],
  ],
  renderer: LinkedList,
  makeSteps(vals, extra) {
    const n = vals.length;
    const cycleTo = parseIntField(extra, "Loop to #", -1, n - 1);
    const steps: Step<ListState>[] = [];
    const next: Record<number, number | null> = {};
    for (let i = 0; i < n; i++) next[i] = i < n - 1 ? i + 1 : cycleTo === -1 ? null : cycleTo;

    let slow: number | null = 0;
    let fast: number | null = 0;
    const chipsNow = (): ListChip[] => {
      const out: ListChip[] = [];
      if (slow !== null) out.push({ name: "slow", target: slow, color: "var(--c-compare)", lane: 0 });
      if (fast !== null) out.push({ name: "fast", target: fast, color: "var(--c-active)", lane: 0.9 });
      return out;
    };
    const snap = (line: number, desc: string) =>
      steps.push({ line, desc, state: { vals: [...vals], next: { ...next }, chips: chipsNow() } });
    const hop = (from: number | null): number | null => (from === null ? null : next[from] ?? null);

    snap(
      2,
      cycleTo === -1
        ? "This list ends normally at ∅. Both pointers start at the head."
        : `The last node loops back to node ${vals[cycleTo]} (the green arc) — a cycle. Both pointers start at the head.`,
    );
    snap(3, "slow will move one node per step; fast will move two.");
    let guard = 0;
    while (fast !== null && hop(fast) !== null && guard++ < 60) {
      slow = hop(slow);
      snap(5, `slow takes one hop → node ${slow === null ? "∅" : vals[slow]}.`);
      fast = hop(hop(fast));
      snap(6, `fast takes two hops → ${fast === null ? "∅ (off the end)" : `node ${vals[fast]}`}.`);
      if (slow !== null && slow === fast) {
        snap(7, `slow == fast at node ${vals[slow]} — they collided inside the loop. Cycle detected: return true.`);
        return steps;
      }
      if (fast !== null && hop(fast) !== null) {
        snap(4, "Not equal — fast hasn't hit the end, keep chasing.");
      }
    }
    snap(9, "fast ran off the end of the list — a cycle would never let that happen. Return false.");
    return steps;
  },
  quiz: [
    {
      q: "Inside a cycle, why are slow and fast guaranteed to meet?",
      opts: [
        "They both visit every node eventually",
        "fast gains exactly one node on slow per step, so the gap shrinks to zero",
        "They meet only if the cycle length is even",
        "It's probabilistic — they usually meet",
      ],
      answer: 1,
      why: "Relative to slow, fast moves +1 node per step. A gap that shrinks by 1 each step must reach 0 — fast can't 'jump over' slow.",
    },
    {
      q: "What's the advantage of Floyd's algorithm over storing visited nodes in a HashSet?",
      opts: [
        "It's asymptotically faster",
        "It uses O(1) space instead of O(n)",
        "It also works on arrays",
        "The HashSet version can loop forever",
      ],
      answer: 1,
      why: "Both are O(n) time, but the hashset stores up to n nodes; the two-pointer version needs just two references.",
    },
    {
      q: "In a list with NO cycle, how does the algorithm terminate?",
      opts: [
        "slow catches up to fast",
        "fast (or fast.next) becomes null — it falls off the end",
        "After exactly n iterations of a for-loop",
        "It doesn't — that's the flaw",
      ],
      answer: 1,
      why: "The while condition checks fast and fast.next. Without a cycle the chain ends in null, and fast reaches it first.",
    },
  ],
};
