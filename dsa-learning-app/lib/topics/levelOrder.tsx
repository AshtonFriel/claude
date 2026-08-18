import { Tree } from "@/components/renderers/Tree";
import type { NumsTopic, Step, TreeNode, TreeState } from "@/lib/types";
import { TREE_LEGEND } from "./legends";

export const levelOrder: NumsTopic<TreeState> = {
  id: "level-order",
  category: "Trees",
  title: "Level-Order Traversal",
  tagline: "BFS on a tree, one row at a time",
  complexity: { best: "O(n)", avg: "O(n)", worst: "O(n)", space: "O(w)" },
  about: (
    <>
      <p>
        Depth-first traversals (pre-, in-, post-order) dive to a leaf before backtracking.
        Level-order does the opposite: it visits every node at depth 0, then every node at depth 1,
        and so on. It is simply breadth-first search on a tree, driven by a queue rather than the
        call stack.
      </p>
      <p>
        The trick for grouping output <em>by level</em> is to record the queue&apos;s size before
        each round — that count is exactly how many nodes are on the current level, so you can drain
        precisely that many before starting the next row.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> printing or serializing a tree row by row, finding the
      minimum depth, right-side views, connecting nodes at the same level, and any shortest-path
      question on a tree. UI component trees are laid out level by level for the same reason.
    </>
  ),
  code: [
    "static List<List<Integer>> levelOrder(Node root) {",
    "  List<List<Integer>> out = new ArrayList<>();",
    "  if (root == null) return out;",
    "  Deque<Node> queue = new ArrayDeque<>(List.of(root));",
    "  while (!queue.isEmpty()) {",
    "    int size = queue.size();",
    "    List<Integer> level = new ArrayList<>();",
    "    for (int i = 0; i < size; i++) {",
    "      Node node = queue.poll();",
    "      level.add(node.val);",
    "      if (node.left != null) queue.add(node.left);",
    "      if (node.right != null) queue.add(node.right);",
    "    }",
    "    out.add(level);",
    "  }",
    "  return out;",
    "}",
  ],
  codeAlt: {
    javascript: [
      "function levelOrder(root) {",
      "  const out = [];",
      "  if (root === null) return out;",
      "  const queue = [root];",
      "  while (queue.length > 0) {",
      "    const size = queue.length;",
      "    const level = [];",
      "    for (let i = 0; i < size; i++) {",
      "      const node = queue.shift();",
      "      level.push(node.val);",
      "      if (node.left) queue.push(node.left);",
      "      if (node.right) queue.push(node.right);",
      "    }",
      "    out.push(level);",
      "  }",
      "  return out;",
      "}",
    ],
  },
  mistakes: [
    "Reading queue.size() inside the inner loop — it changes as children are added, so levels bleed together.",
    "Using a stack instead of a queue, which quietly turns it into a depth-first traversal.",
    "Forgetting the null-root guard before seeding the queue.",
  ],
  interview: [
    "\"Binary tree level-order traversal\" (and its zigzag variant).",
    "\"Right side view of a binary tree\" — the last node of each level.",
    "\"Minimum depth of a binary tree\" — the first leaf level-order reaches.",
  ],
  inputs: { kind: "nums", label: "Insert order (builds a BST)", defaultValue: "50, 30, 70, 20, 40, 60, 80", max: 10, allowDup: false },
  legend: TREE_LEGEND,
  renderer: Tree,
  makeSteps(vals) {
    const nodes: TreeNode[] = [];
    let root: number | null = null;
    for (const v of vals) {
      if (root === null) {
        nodes.push({ v, left: null, right: null });
        root = 0;
        continue;
      }
      let cur = root;
      for (;;) {
        if (v < nodes[cur].v) {
          if (nodes[cur].left === null) {
            nodes.push({ v, left: null, right: null });
            nodes[cur].left = nodes.length - 1;
            break;
          }
          cur = nodes[cur].left!;
        } else {
          if (nodes[cur].right === null) {
            nodes.push({ v, left: null, right: null });
            nodes[cur].right = nodes.length - 1;
            break;
          }
          cur = nodes[cur].right!;
        }
      }
    }

    const steps: Step<TreeState>[] = [];
    const visited: number[] = [];
    const queue: number[] = [];
    const levels: number[][] = [];
    const aux = () =>
      `queue: [${queue.map((i) => nodes[i].v).join(", ")}]  ·  levels: ${levels.map((l) => `[${l.join(", ")}]`).join(" ") || "—"}`;
    const snap = (line: number, desc: string, extra: Partial<TreeState> = {}) =>
      steps.push({ line, desc, aux: aux(), state: { nodes, root, visited: [...visited], settled: true, ...extra } });

    queue.push(root!);
    snap(4, `Seed the queue with the root, ${nodes[root!].v}.`, { current: root! });
    let depth = 0;
    while (queue.length) {
      const size = queue.length;
      const level: number[] = [];
      levels.push(level);
      snap(6, `Level ${depth}: the queue holds exactly ${size} node${size === 1 ? "" : "s"} — snapshot that count before adding any children.`);
      for (let i = 0; i < size; i++) {
        const id = queue.shift()!;
        visited.push(id);
        level.push(nodes[id].v);
        snap(10, `Visit ${nodes[id].v} and append it to level ${depth}.`, { current: id });
        if (nodes[id].left !== null) {
          queue.push(nodes[id].left!);
          snap(11, `Enqueue its left child ${nodes[nodes[id].left!].v} for the next level.`, { current: id, alt: [nodes[id].left!] });
        }
        if (nodes[id].right !== null) {
          queue.push(nodes[id].right!);
          snap(12, `Enqueue its right child ${nodes[nodes[id].right!].v} for the next level.`, { current: id, alt: [nodes[id].right!] });
        }
      }
      snap(14, `Level ${depth} is complete: [${level.join(", ")}].`);
      depth++;
    }
    snap(16, `Queue empty after ${levels.length} levels. Output: ${levels.map((l) => `[${l.join(", ")}]`).join(" ")}`);
    return steps;
  },
  quiz: [
    {
      q: "How does the algorithm know where one level ends and the next begins?",
      opts: [
        "It records the queue's size before draining the level, then pops exactly that many",
        "It stores the depth on every node",
        "It uses a second queue",
        "It checks whether the node is a leaf",
      ],
      answer: 0,
      why: "At the top of each round the queue holds exactly the current level. Snapshot that count first — reading size() inside the loop sees children being added.",
    },
    {
      q: "Swap the queue for a stack. What does the traversal become?",
      opts: [
        "A depth-first traversal",
        "It stays level-order",
        "It reverses each level",
        "It becomes an in-order traversal",
      ],
      answer: 0,
      why: "LIFO makes the most recently discovered node the next one explored, which is exactly the dive-and-backtrack shape of DFS.",
    },
    {
      q: "What is the space complexity of level-order traversal?",
      opts: [
        "O(w), where w is the widest level — up to n/2 for a full tree",
        "O(log n) always",
        "O(1)",
        "O(n²)",
      ],
      answer: 0,
      why: "The queue holds one level at a time. The bottom level of a complete tree contains about half the nodes, so the peak is O(n) in that case.",
    },
  ],
};
