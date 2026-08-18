/** Curriculum skeleton: category order in the sidebar, plus not-yet-built topics shown as "soon". */

export const CATEGORIES = [
  "Arrays",
  "Linked Lists",
  "Stacks & Queues",
  "Trees",
  "Graphs",
  "Sorting Algorithms",
  "Searching Algorithms",
  "Dynamic Programming",
  "Recursion & Backtracking",
] as const;

export const PLANNED: Record<string, string[]> = {
  Arrays: ["Two Pointers", "Sliding Window"],
  "Linked Lists": ["Doubly Linked List", "Cycle Detection"],
  "Stacks & Queues": ["Stack Operations", "Queue & Deque"],
  Trees: ["AVL Rotations", "Binary Heap"],
  Graphs: ["Dijkstra’s Algorithm", "Topological Sort"],
  "Searching Algorithms": ["Binary Search", "Linear Search"],
  "Dynamic Programming": ["Fibonacci & Memoization", "0/1 Knapsack"],
  "Recursion & Backtracking": ["N-Queens", "Subset Generation"],
};
