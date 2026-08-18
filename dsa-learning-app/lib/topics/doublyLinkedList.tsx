import { LinkedList } from "@/components/renderers/LinkedList";
import { parseIntField } from "@/lib/parse";
import type { ListChip, ListState, NumsTopic, Step } from "@/lib/types";

export const doublyLinkedList: NumsTopic<ListState> = {
  id: "doubly-linked-list",
  category: "Linked Lists",
  title: "Doubly Linked List",
  tagline: "Every node knows its neighbour on both sides",
  complexity: { best: "O(1)", avg: "O(n)", worst: "O(n)", space: "O(n)" },
  about: (
    <>
      <p>
        A doubly linked list gives every node <em>two</em> pointers: <code>next</code> (blue,
        along the top) and <code>prev</code> (purple, underneath). The payoff is symmetric
        movement — you can walk either direction, and once you&apos;re holding a node you can
        unlink it in O(1) by stitching its neighbours together. This visualizer finds a value
        and removes its node, one pointer update at a time.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> Java&apos;s <code>LinkedList</code>, LRU caches (O(1)
      removal of the least-recently-used node), browser history, undo/redo chains, and music
      playlists — anywhere you delete from the middle or walk both directions.
    </>
  ),
  code: [
    "static void remove(DoublyList list, int v) {",
    "  Node node = list.head;",
    "  while (node != null && node.val != v)",
    "    node = node.next;",
    "  if (node == null) return;",
    "  Node before = node.prev;",
    "  Node after = node.next;",
    "  if (before != null) before.next = after;",
    "  else list.head = after;",
    "  if (after != null) after.prev = before;",
    "  else list.tail = before;",
    "  node.prev = node.next = null;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "List values",
    defaultValue: "7, 3, 9, 4",
    max: 6,
    allowDup: false,
    extraField: { label: "Remove", defaultValue: "9" },
  },
  codeAlt: {
    javascript: [
      "function remove(list, v) {",
      "  let node = list.head;",
      "  while (node !== null && node.val !== v)",
      "    node = node.next;",
      "  if (node === null) return;",
      "  const before = node.prev;",
      "  const after = node.next;",
      "  if (before !== null) before.next = after;",
      "  else list.head = after;",
      "  if (after !== null) after.prev = before;",
      "  else list.tail = before;",
      "  node.prev = node.next = null;",
      "}",
    ],
  },
  mistakes: [
    "Updating next but forgetting prev (or vice versa) — the list works one direction and is corrupt the other.",
    "Not special-casing head/tail removal, leaving list.head or list.tail pointing at a detached node.",
    "Leaving the removed node's own pointers set, keeping the rest of the list reachable from 'deleted' data.",
  ],
  interview: [
    "\"Design an LRU cache\" — the doubly linked list + hash map combo.",
    "\"Flatten a multilevel doubly linked list.\"",
    "\"Design a browser history\" — back/forward is prev/next.",
  ],
  legend: [
    ["--c-pointer", "next links"],
    ["--c-pivot", "prev links"],
    ["--c-compare", "node being removed"],
    ["--c-done", "after"],
  ],
  renderer: LinkedList,
  makeSteps(vals, extra) {
    const target = parseIntField(extra, "Remove", -999, 999);
    const n = vals.length;
    const steps: Step<ListState>[] = [];
    const next: Record<number, number | null> = {};
    const prevLinks: Record<number, number | null> = {};
    for (let i = 0; i < n; i++) {
      next[i] = i < n - 1 ? i + 1 : null;
      prevLinks[i] = i > 0 ? i - 1 : null;
    }
    const gone: number[] = [];

    let node: number | null | undefined;
    let before: number | null | undefined;
    let after: number | null | undefined;
    const chipsNow = (): ListChip[] => {
      const out: ListChip[] = [];
      if (before !== undefined) out.push({ name: "before", target: before, color: "var(--c-pointer)", lane: 0 });
      if (node !== undefined && node !== null) out.push({ name: "node", target: node, color: "var(--c-compare)", lane: 0.6 });
      if (after !== undefined) out.push({ name: "after", target: after, color: "var(--c-done)", lane: 1.2 });
      return out;
    };
    const snap = (line: number, desc: string) =>
      steps.push({
        line,
        desc,
        state: { vals: [...vals], next: { ...next }, prevLinks: { ...prevLinks }, chips: chipsNow(), gone: [...gone] },
      });

    node = 0;
    snap(2, `Every node has both next (top) and prev (bottom) pointers. Find ${target}, starting at the head.`);
    while (node !== null && vals[node] !== target) {
      snap(3, `node.val = ${vals[node]} ≠ ${target} — not this one.`);
      node = next[node] === -1 ? null : (next[node] as number | null);
      if (node !== null) snap(4, `Follow next to node ${vals[node]}.`);
    }
    if (node === null) {
      snap(5, `Reached the end — ${target} isn't in the list. Nothing to remove.`);
      return steps;
    }
    snap(3, `node.val = ${target} — this is the node to remove.`);
    before = prevLinks[node];
    snap(6, `Grab its left neighbour: before = node.prev (${before === null ? "∅ — we're removing the head" : `node ${vals[before]}`}).`);
    after = next[node] as number | null;
    snap(7, `Grab its right neighbour: after = node.next (${after === null ? "∅ — we're removing the tail" : `node ${vals[after]}`}).`);
    if (before !== null) {
      next[before] = after;
      snap(8, `Stitch forward: before.next now skips over ${target} straight to ${after === null ? "∅" : vals[after]}.`);
    } else {
      snap(9, `No before — ${target} was the head, so list.head moves to ${after === null ? "∅" : vals[after]}.`);
    }
    if (after !== null) {
      prevLinks[after] = before;
      snap(10, `Stitch backward: after.prev now points to ${before === null ? "∅" : vals[before]}.`);
    } else {
      snap(11, `No after — ${target} was the tail, so list.tail moves to ${before === null ? "∅" : vals[before]}.`);
    }
    next[node] = null;
    delete prevLinks[node];
    gone.push(node);
    snap(12, `Clear the removed node's own pointers. It's fully unlinked — the neighbours never noticed a gap.`);
    return steps;
  },
  quiz: [
    {
      q: "You already hold a reference to a middle node. What does removing it cost in a doubly vs singly linked list?",
      opts: [
        "O(1) in both",
        "O(1) doubly, O(n) singly — a singly list must walk from the head to find the predecessor",
        "O(n) in both",
        "O(log n) doubly, O(n) singly",
      ],
      answer: 1,
      why: "Unlinking needs the predecessor. A doubly linked node carries it in .prev; a singly linked list has to search for it.",
    },
    {
      q: "What is the space cost of the doubly linked list's flexibility?",
      opts: [
        "One extra pointer per node",
        "A full copy of the list",
        "O(log n) extra pointers total",
        "Nothing — prev is computed on demand",
      ],
      answer: 0,
      why: "Every node stores prev alongside next — one more reference per node, plus a bit more bookkeeping on every insert/remove.",
    },
    {
      q: "Why do LRU caches pair a hash map with a doubly linked list?",
      opts: [
        "The map finds the node in O(1); the list moves/evicts it in O(1)",
        "The list makes the map faster",
        "To keep keys sorted",
        "Tradition — a dynamic array would be just as fast",
      ],
      answer: 0,
      why: "Hash lookup jumps straight to a node; prev/next pointers let it be unlinked and moved to the front (or evicted from the back) in constant time.",
    },
  ],
};
