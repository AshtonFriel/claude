import type { Topic } from "@/lib/types";
// Arrays
import { twoPointers } from "./twoPointers";
import { slidingWindow } from "./slidingWindow";
import { kadane } from "./kadane";
import { prefixSums } from "./prefixSums";
// Linked lists
import { linkedListReverse } from "./linkedListReverse";
import { doublyLinkedList } from "./doublyLinkedList";
import { cycleDetection } from "./cycleDetection";
// Stacks & queues
import { stackOps } from "./stackOps";
import { queueDeque } from "./queueDeque";
import { balancedParens } from "./balancedParens";
import { nextGreater } from "./nextGreater";
// Trees
import { bst } from "./bst";
import { levelOrder } from "./levelOrder";
import { avl } from "./avl";
import { heap } from "./heap";
// Graphs
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { primMst } from "./primMst";
import { topoSort } from "./topoSort";
import { unionFind } from "./unionFind";
// Sorting
import { bubbleSort } from "./bubbleSort";
import { insertionSort } from "./insertionSort";
import { selectionSort } from "./selectionSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { heapSort } from "./heapSort";
import { countingSort } from "./countingSort";
// Searching
import { binarySearch } from "./binarySearch";
import { linearSearch } from "./linearSearch";
// Dynamic programming
import { fibMemo } from "./fibMemo";
import { coinChange } from "./coinChange";
import { knapsack } from "./knapsack";
import { lcs } from "./lcs";
// Recursion & backtracking
import { permutations } from "./permutations";
import { subsets } from "./subsets";
import { nQueens } from "./nQueens";
// Greedy
import { intervalScheduling } from "./intervalScheduling";
import { fractionalKnapsack } from "./fractionalKnapsack";

/** The topic registry. To add a topic, create its module and list it here. */
export const TOPICS: Topic[] = [
  twoPointers,
  slidingWindow,
  kadane,
  prefixSums,
  linkedListReverse,
  doublyLinkedList,
  cycleDetection,
  stackOps,
  queueDeque,
  balancedParens,
  nextGreater,
  bst,
  levelOrder,
  avl,
  heap,
  bfs,
  dfs,
  dijkstra,
  primMst,
  topoSort,
  unionFind,
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
  binarySearch,
  linearSearch,
  fibMemo,
  coinChange,
  knapsack,
  lcs,
  permutations,
  subsets,
  nQueens,
  intervalScheduling,
  fractionalKnapsack,
];

export const topicById = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);

export const TOPIC_IDS = TOPICS.map((t) => t.id);
