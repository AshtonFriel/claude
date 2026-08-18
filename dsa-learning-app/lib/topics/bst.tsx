import { Tree } from "@/components/renderers/Tree";
import type { NumsTopic, Step, TreeNode, TreeState } from "@/lib/types";
import { TREE_LEGEND } from "./legends";

export const bst: NumsTopic<TreeState> = {
  id: "bst",
  category: "Trees",
  title: "Binary Search Tree",
  tagline: "Ordered inserts, then an in-order walk",
  complexity: { best: "O(log n)", avg: "O(log n)", worst: "O(n)", space: "O(n)" },
  about: (
    <>
      <p>
        A binary search tree keeps an ordering invariant at every node: everything in the left
        subtree is smaller, everything in the right subtree is larger (ties here go right).
        Inserting or searching just follows comparisons down one path — O(log&nbsp;n) when the
        tree is balanced, but O(n) if inserts arrive in sorted order and the tree degenerates
        into a chain. An <em>in-order traversal</em> (left, node, right) visits the values in
        sorted order.
      </p>
      <p>
        This visualizer builds the tree from your values one insert at a time, then runs the
        in-order traversal.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the concept behind ordered maps and sets (as
      self-balancing variants like AVL and red-black trees), database indexes, and any
      &ldquo;keep data sorted while inserting&rdquo; problem.
    </>
  ),
  code: [
    "static Node insert(Node root, int v) {",
    "  if (root == null) return new Node(v);",
    "  if (v < root.val)",
    "    root.left = insert(root.left, v);",
    "  else",
    "    root.right = insert(root.right, v);",
    "  return root;",
    "}",
    "static void inorder(Node n, List<Integer> out) {",
    "  if (n == null) return;",
    "  inorder(n.left, out);",
    "  out.add(n.val);",
    "  inorder(n.right, out);",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function insert(root, v) {",
      "  if (root === null) return new Node(v);",
      "  if (v < root.val)",
      "    root.left = insert(root.left, v);",
      "  else",
      "    root.right = insert(root.right, v);",
      "  return root;",
      "}",
      "function inorder(node, out) {",
      "  if (node === null) return;",
      "  inorder(node.left, out);",
      "  out.push(node.val);",
      "  inorder(node.right, out);",
      "}",
    ],
    python: {
      lines: [
        "def insert(root, v):",
        "    if root is None:",
        "        return Node(v)",
        "    if v < root.val:",
        "        root.left = insert(root.left, v)",
        "    else:",
        "        root.right = insert(root.right, v)",
        "    return root",
        "",
        "def inorder(node, out):",
        "    if node is None:",
        "        return",
        "    inorder(node.left, out)",
        "    out.append(node.val)",
        "    inorder(node.right, out)",
      ],
      map: [1, 2, 4, 5, 6, 7, 8, 0, 10, 11, 13, 14, 15, 0],
    },
  },
  mistakes: [
    "Forgetting to reassign the recursive result (root.left = insert(...)) — the new node is created and immediately lost.",
    "Validating a BST by checking only parent vs children instead of full min/max bounds per subtree.",
    "Assuming O(log n) without balancing — sorted inserts silently degrade every operation to O(n).",
  ],
  interview: [
    "\"Validate a binary search tree\" — the bounds-passing classic.",
    "\"K-th smallest element in a BST\" — in-order traversal with a counter.",
    "\"Lowest common ancestor in a BST\" — walk down using the ordering invariant.",
  ],
  inputs: { kind: "nums", label: "Insert order", defaultValue: "50, 30, 70, 20, 40, 60, 80", max: 10, allowDup: false },
  legend: TREE_LEGEND,
  renderer: Tree,
  makeSteps(vals) {
    const nodes: TreeNode[] = []; // ids are array indexes
    let root: number | null = null;
    const steps: Step<TreeState>[] = [];
    const snap = (line: number, desc: string, extra: Partial<TreeState> = {}, aux?: string) =>
      steps.push({ line, desc, aux, state: { nodes: structuredClone(nodes), root, ...extra } });

    for (const v of vals) {
      if (root === null) {
        nodes.push({ v, left: null, right: null });
        root = 0;
        snap(2, `insert(${v}): the tree is empty, so ${v} becomes the root.`, { current: root, settled: true });
        continue;
      }
      snap(1, `insert(${v}): start comparing at the root.`, { current: root, pending: v });
      let cur = root;
      for (;;) {
        const cv = nodes[cur].v;
        if (v < cv) {
          if (nodes[cur].left === null) {
            nodes.push({ v, left: null, right: null });
            nodes[cur].left = nodes.length - 1;
            snap(4, `${v} < ${cv} and the left slot is free — attach ${v} as the left child of ${cv}.`, {
              current: nodes[cur].left!,
              settled: true,
            });
            break;
          }
          cur = nodes[cur].left!;
          snap(4, `${v} < ${cv} — descend left.`, { current: cur, pending: v });
        } else {
          if (nodes[cur].right === null) {
            nodes.push({ v, left: null, right: null });
            nodes[cur].right = nodes.length - 1;
            snap(6, `${v} ≥ ${cv} and the right slot is free — attach ${v} as the right child of ${cv}.`, {
              current: nodes[cur].right!,
              settled: true,
            });
            break;
          }
          cur = nodes[cur].right!;
          snap(6, `${v} ≥ ${cv} — descend right.`, { current: cur, pending: v });
        }
      }
    }

    // in-order traversal
    const out: number[] = [];
    const visited: number[] = [];
    const auxOf = () => `output: [${out.join(", ")}]`;
    snap(9, "The tree is built. Now walk it in-order: left subtree, node, right subtree.", { visited: [] }, auxOf());
    const walk = (id: number | null) => {
      if (id === null) return;
      if (nodes[id].left !== null) {
        snap(11, `At ${nodes[id].v}: recurse into the left subtree first.`, { current: id, visited: [...visited] }, auxOf());
      }
      walk(nodes[id].left);
      out.push(nodes[id].v);
      visited.push(id);
      snap(12, `Visit ${nodes[id].v} — append it to the output.`, { current: id, visited: [...visited] }, auxOf());
      if (nodes[id].right !== null) {
        snap(13, `At ${nodes[id].v}: now recurse into the right subtree.`, { current: id, visited: [...visited] }, auxOf());
      }
      walk(nodes[id].right);
    };
    walk(root);
    snap(9, `Traversal complete — in-order output is sorted: [${out.join(", ")}].`, { visited: [...visited] }, auxOf());
    return steps;
  },
  quiz: [
    {
      q: "What does an in-order traversal of a binary search tree produce?",
      opts: ["Values in insertion order", "Values in sorted order", "Values level by level", "A random permutation"],
      answer: 1,
      why: "Left subtree (all smaller) → node → right subtree (all larger). Applied recursively, that is exactly ascending order.",
    },
    {
      q: "Inserting 1, 2, 3, 4, 5 in that order into an empty BST produces what shape — and what search cost?",
      opts: [
        "A perfectly balanced tree, O(log n)",
        "A right-leaning chain, O(n)",
        "A left-leaning chain, O(log n)",
        "It depends on the values, not the order",
      ],
      answer: 1,
      why: "Each new value is the largest so far, so it always goes right: the tree degenerates into a linked list with O(n) search.",
    },
    {
      q: "What is the average-case cost of search in a BST built from randomly ordered inserts?",
      opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      answer: 1,
      why: "Random insert order keeps the expected height logarithmic, and search follows a single root-to-leaf path.",
    },
  ],
};
