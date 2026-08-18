import { LinkedList } from "@/components/renderers/LinkedList";
import type { ListChip, ListState, NumsTopic, Step } from "@/lib/types";
import { LIST_LEGEND } from "./legends";

export const linkedListReverse: NumsTopic<ListState> = {
  id: "linked-list-reverse",
  category: "Linked Lists",
  title: "Reverse a Linked List",
  tagline: "Three pointers walk the chain and flip every arrow",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(1)" },
  about: (
    <>
      <p>
        A singly linked list is a chain of nodes where each node stores a value and a pointer to
        the next node. To reverse it in place we walk the chain once with three pointers:{" "}
        <code>prev</code> (the reversed part built so far), <code>curr</code> (the node being
        flipped), and <code>next</code> (a bookmark saving the rest of the chain before we
        overwrite <code>curr.next</code>). Each iteration flips exactly one arrow.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the single most-asked linked-list interview question, and
      the building block for problems like palindrome checking and reversing in k-groups. The
      save-before-you-overwrite pattern shows up in all pointer surgery.
    </>
  ),
  code: [
    "static Node reverseList(Node head) {",
    "  Node prev = null;",
    "  Node curr = head;",
    "  while (curr != null) {",
    "    Node next = curr.next;",
    "    curr.next = prev;",
    "    prev = curr;",
    "    curr = next;",
    "  }",
    "  return prev;",
    "}",
  ],
  inputs: { kind: "nums", label: "List values", defaultValue: "3, 8, 12, 5, 9", max: 7 },
  legend: LIST_LEGEND,
  renderer: LinkedList,
  makeSteps(vals) {
    const n = vals.length;
    const steps: Step<ListState>[] = [];
    const next: Record<number, number | null> = {};
    for (let i = 0; i < n; i++) next[i] = i < n - 1 ? i + 1 : null;

    // undefined = pointer not introduced yet; null = points at ∅
    let prev: number | null | undefined;
    let curr: number | null | undefined;
    let nxt: number | null | undefined;
    let newHead: number | undefined;

    const chipsNow = (): ListChip[] => {
      const out: ListChip[] = [];
      if (prev !== undefined) {
        out.push({ name: "prev", target: prev, color: "var(--c-done)", lane: prev !== null && prev === curr ? 1 : 0 });
      }
      if (curr !== undefined) out.push({ name: "curr", target: curr, color: "var(--c-compare)", lane: 0.55 });
      if (nxt !== undefined) out.push({ name: "next", target: nxt, color: "var(--c-pointer)", lane: 1.15 });
      return out;
    };
    const snap = (line: number, desc: string) =>
      steps.push({ line, desc, state: { vals: [...vals], next: { ...next }, chips: chipsNow(), newHead } });
    const name = (i: number | null | undefined) => (i === null || i === undefined ? "null" : `node ${vals[i]}`);

    prev = null;
    snap(2, "prev starts at null — the reversed portion of the list is empty so far.");
    curr = 0;
    snap(3, "curr starts at the head. next isn't needed until the loop begins.");
    snap(4, `Loop check: curr is ${name(curr)}, not null — enter the loop.`);
    while (curr !== null && curr !== undefined) {
      nxt = next[curr];
      snap(5, `Bookmark the rest of the chain: next = curr.next (${name(nxt)}).`);
      next[curr] = prev === null ? -1 : prev!;
      snap(6, `Flip the arrow: ${name(curr)} now points back to ${prev === null ? "∅ (null)" : name(prev)}.`);
      prev = curr;
      snap(7, `Advance prev to ${name(prev)} — the reversed portion grew by one node.`);
      curr = nxt ?? null;
      nxt = undefined;
      snap(8, `Advance curr to the bookmarked node (${name(curr)}).`);
      snap(
        4,
        curr === null
          ? "Loop check: curr is null — every arrow has been flipped."
          : `Loop check: curr is ${name(curr)}, not null — flip another arrow.`,
      );
    }
    newHead = prev ?? undefined;
    snap(10, `Return prev — ${name(prev)} is the head of the reversed list.`);
    return steps;
  },
  quiz: [
    {
      q: "Why must next = curr.next be saved before setting curr.next = prev?",
      opts: [
        "To keep the loop O(1) per step",
        "Overwriting curr.next first would lose the rest of the list",
        "Because prev might be null",
        "It is only needed for doubly linked lists",
      ],
      answer: 1,
      why: "curr.next is the only reference to the unvisited remainder of the chain. Overwrite it first and those nodes become unreachable.",
    },
    {
      q: "What are the time and space complexities of iterative in-place reversal of n nodes?",
      opts: ["O(n) time, O(n) space", "O(n²) time, O(1) space", "O(n) time, O(1) space", "O(log n) time, O(1) space"],
      answer: 2,
      why: "One visit per node (O(n)) using only the three pointer variables (O(1)).",
    },
    {
      q: "When the loop exits, which pointer holds the new head?",
      opts: ["curr", "next", "head", "prev"],
      answer: 3,
      why: "The loop ends when curr walks off the end (null). prev is then the last real node — the old tail, now the new head.",
    },
  ],
};
