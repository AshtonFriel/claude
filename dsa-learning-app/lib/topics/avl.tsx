import { Tree } from "@/components/renderers/Tree";
import type { NumsTopic, Step, TreeNode, TreeState } from "@/lib/types";

export const avl: NumsTopic<TreeState> = {
  id: "avl",
  category: "Trees",
  title: "AVL Rotations",
  tagline: "A BST that refuses to become a chain",
  complexity: { best: "O(log n)", avg: "O(log n)", worst: "O(log n)", space: "O(n)" },
  about: (
    <>
      <p>
        A plain BST degenerates into an O(n) chain if inserts arrive in sorted order. An AVL
        tree prevents that: after every insert it walks back up checking each node&apos;s{" "}
        <em>balance factor</em> (left height − right height). The moment a factor leaves
        {" {−1, 0, +1}"}, a <em>rotation</em> — an O(1) pointer shuffle — restores balance.
        Four cases exist: LL and RR need one rotation; LR and RL need two.
      </p>
      <p>
        The default input deliberately triggers a right rotation (LL), a left rotation (RR),
        and a double rotation (RL). Watch the <code>bf</code> tags during each unwind.
      </p>
    </>
  ),
  uses: (
    <>
      <b>Where you&apos;ll meet it:</b> the guarantee behind every ordered map/set that promises
      O(log n) — AVL and its cousin the red-black tree (Java&apos;s <code>TreeMap</code>),
      database indexes, and schedulers. AVL rebalances more eagerly, so it&apos;s slightly
      faster to search and slightly slower to update.
    </>
  ),
  code: [
    "static Node insert(Node node, int v) {",
    "  if (node == null) return new Node(v);",
    "  if (v < node.val) node.left = insert(node.left, v);",
    "  else node.right = insert(node.right, v);",
    "  updateHeight(node);",
    "  int bf = height(node.left) - height(node.right);",
    "  if (bf > 1 && v < node.left.val)",
    "    return rotateRight(node);            // LL",
    "  if (bf < -1 && v > node.right.val)",
    "    return rotateLeft(node);             // RR",
    "  if (bf > 1) {                          // LR",
    "    node.left = rotateLeft(node.left);",
    "    return rotateRight(node);",
    "  }",
    "  if (bf < -1) {                         // RL",
    "    node.right = rotateRight(node.right);",
    "    return rotateLeft(node);",
    "  }",
    "  return node;",
    "}",
  ],
  inputs: {
    kind: "nums",
    label: "Insert order",
    defaultValue: "30, 20, 10, 40, 50, 25",
    max: 9,
    allowDup: false,
  },
  legend: [
    ["--c-compare", "current node"],
    ["--c-pointer", "rotation partner / bf tags"],
  ],
  renderer: Tree,
  makeSteps(vals) {
    const nodes: TreeNode[] = [];
    let root: number | null = null;
    const steps: Step<TreeState>[] = [];

    const h = (id: number | null): number =>
      id === null ? 0 : 1 + Math.max(h(nodes[id].left), h(nodes[id].right));
    const bf = (id: number) => h(nodes[id].left) - h(nodes[id].right);
    const allTags = () => {
      const tags: Record<number, string> = {};
      const walk = (id: number | null) => {
        if (id === null) return;
        tags[id] = `bf ${bf(id)}`;
        walk(nodes[id].left);
        walk(nodes[id].right);
      };
      walk(root);
      return tags;
    };
    const snap = (line: number, desc: string, extra: Partial<TreeState> = {}) =>
      steps.push({ line, desc, state: { nodes: structuredClone(nodes), root, ...extra } });

    const rotateRight = (z: number): number => {
      const y = nodes[z].left!;
      nodes[z].left = nodes[y].right;
      nodes[y].right = z;
      return y;
    };
    const rotateLeft = (z: number): number => {
      const y = nodes[z].right!;
      nodes[z].right = nodes[y].left;
      nodes[y].left = z;
      return y;
    };

    // `assign` links the (possibly new) subtree root into the parent BEFORE we
    // snapshot, so every frame shows a fully connected tree.
    const ins = (id: number | null, v: number, assign: (nid: number) => void): void => {
      if (id === null) {
        nodes.push({ v, left: null, right: null });
        const nid = nodes.length - 1;
        assign(nid);
        snap(2, `Empty slot — attach ${v} here.`, { current: nid, settled: true });
        return;
      }
      const goLeft = v < nodes[id].v;
      snap(goLeft ? 3 : 4, `${v} ${goLeft ? "<" : "≥"} ${nodes[id].v} — descend ${goLeft ? "left" : "right"}.`, {
        current: id,
        pending: v,
      });
      if (goLeft) ins(nodes[id].left, v, (nid) => (nodes[id].left = nid));
      else ins(nodes[id].right, v, (nid) => (nodes[id].right = nid));

      const b = bf(id);
      snap(6, `Unwinding at ${nodes[id].v}: balance factor = ${b}${Math.abs(b) > 1 ? " — out of range, rotate!" : " — within ±1, fine."}`, {
        current: id,
        tags: allTags(),
      });
      if (b > 1 && v < nodes[nodes[id].left!].v) {
        const old = nodes[id].v;
        const nr = rotateRight(id);
        assign(nr);
        snap(8, `Left-Left case: one RIGHT rotation around ${old}. ${nodes[nr].v} is the new subtree root.`, {
          current: nr,
          alt: [id],
          tags: allTags(),
        });
        return;
      }
      if (b < -1 && v > nodes[nodes[id].right!].v) {
        const old = nodes[id].v;
        const nr = rotateLeft(id);
        assign(nr);
        snap(10, `Right-Right case: one LEFT rotation around ${old}. ${nodes[nr].v} is the new subtree root.`, {
          current: nr,
          alt: [id],
          tags: allTags(),
        });
        return;
      }
      if (b > 1) {
        const child = nodes[id].left!;
        nodes[id].left = rotateLeft(child);
        snap(12, `Left-Right case, step 1: rotate LEFT around the left child ${nodes[child].v} to straighten the kink.`, {
          current: nodes[id].left!,
          alt: [child],
          tags: allTags(),
        });
        const old = nodes[id].v;
        const nr = rotateRight(id);
        assign(nr);
        snap(13, `Left-Right case, step 2: rotate RIGHT around ${old}. Balanced again.`, {
          current: nr,
          alt: [id],
          tags: allTags(),
        });
        return;
      }
      if (b < -1) {
        const child = nodes[id].right!;
        nodes[id].right = rotateRight(child);
        snap(16, `Right-Left case, step 1: rotate RIGHT around the right child ${nodes[child].v} to straighten the kink.`, {
          current: nodes[id].right!,
          alt: [child],
          tags: allTags(),
        });
        const old = nodes[id].v;
        const nr = rotateLeft(id);
        assign(nr);
        snap(17, `Right-Left case, step 2: rotate LEFT around ${old}. Balanced again.`, {
          current: nr,
          alt: [id],
          tags: allTags(),
        });
        return;
      }
    };

    for (const v of vals) {
      if (root === null) {
        nodes.push({ v, left: null, right: null });
        root = nodes.length - 1;
        snap(2, `insert(${v}): the tree is empty — ${v} becomes the root.`, { current: root, settled: true });
        continue;
      }
      snap(1, `insert(${v}) — descend from the root, then rebalance on the way back up.`, { current: root, pending: v });
      ins(root, v, (nid) => (root = nid));
    }
    snap(19, `All ${vals.length} values inserted. Height stays ~log n — no chains allowed.`, { tags: allTags() });
    return steps;
  },
  quiz: [
    {
      q: "What does an AVL tree's balance factor measure, and which values are allowed?",
      opts: [
        "height(left) − height(right), allowed values −1, 0, +1",
        "Number of children, allowed values 0–2",
        "Subtree size difference, any value",
        "Node depth, allowed values up to log n",
      ],
      answer: 0,
      why: "Every node must satisfy |height(left) − height(right)| ≤ 1; any insert that breaks this triggers an immediate rotation.",
    },
    {
      q: "An insert went into the LEFT subtree of a node's RIGHT child and unbalanced it. Which case is this?",
      opts: [
        "RL — rotate right around the right child, then left around the node",
        "RR — one left rotation",
        "LL — one right rotation",
        "LR — rotate left around the left child, then right",
      ],
      answer: 0,
      why: "Right child, left grandchild = RL. The kink must be straightened (right rotation on the child) before the main left rotation works.",
    },
    {
      q: "What does a single rotation cost, and what does AVL balancing buy overall?",
      opts: [
        "O(1) pointer updates; guaranteed O(log n) search, insert and delete",
        "O(log n) per rotation; O(n) search",
        "O(n) per rotation; faster inserts only",
        "O(1) per rotation; but search stays O(n)",
      ],
      answer: 0,
      why: "A rotation rewires a constant number of pointers. Keeping height ≤ ~1.44·log n makes every path — and thus every operation — logarithmic.",
    },
  ],
};
