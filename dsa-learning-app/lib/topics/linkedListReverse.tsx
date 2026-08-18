import { LinkedList } from "@/components/renderers/LinkedList";
import type { ListState, NumsTopic, Step } from "@/lib/types";
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
    "function reverseList(head) {",
    "  let prev = null;",
    "  let curr = head;",
    "  while (curr !== null) {",
    "    const next = curr.next;",
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
    const ptrs: { prev?: number | null; curr?: number | null; next?: number | null } = {};
    let newHead: number | undefined;
    const snap = (line: number, desc: string) =>
      steps.push({ line, desc, state: { vals: [...vals], next: { ...next }, ptrs: { ...ptrs }, newHead } });
    const name = (i: number | null | undefined) => (i === null || i === undefined ? "null" : `node ${vals[i]}`);

    snap(2, "prev starts at null — the reversed portion of the list is empty so far.");
    ptrs.prev = null;
    snap(3, "curr starts at the head. next isn't needed until the loop begins.");
    ptrs.curr = 0;
    snap(4, `Loop check: curr is ${name(ptrs.curr)}, not null — enter the loop.`);
    while (ptrs.curr !== null && ptrs.curr !== undefined) {
      ptrs.next = next[ptrs.curr];
      snap(5, `Bookmark the rest of the chain: next = curr.next (${name(ptrs.next)}).`);
      next[ptrs.curr] = ptrs.prev === null ? -1 : ptrs.prev!;
      snap(6, `Flip the arrow: ${name(ptrs.curr)} now points back to ${ptrs.prev === null ? "∅ (null)" : name(ptrs.prev)}.`);
      ptrs.prev = ptrs.curr;
      snap(7, `Advance prev to ${name(ptrs.prev)} — the reversed portion grew by one node.`);
      ptrs.curr = ptrs.next ?? null;
      delete ptrs.next;
      snap(8, `Advance curr to the bookmarked node (${name(ptrs.curr)}).`);
      snap(
        4,
        ptrs.curr === null
          ? "Loop check: curr is null — every arrow has been flipped."
          : `Loop check: curr is ${name(ptrs.curr)}, not null — flip another arrow.`,
      );
    }
    newHead = ptrs.prev ?? undefined;
    snap(10, `Return prev — ${name(ptrs.prev)} is the head of the reversed list.`);
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
