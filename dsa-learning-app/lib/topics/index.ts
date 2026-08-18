import type { Topic } from "@/lib/types";
import { twoPointers } from "./twoPointers";
import { slidingWindow } from "./slidingWindow";
import { linkedListReverse } from "./linkedListReverse";
import { doublyLinkedList } from "./doublyLinkedList";
import { cycleDetection } from "./cycleDetection";
import { stackOps } from "./stackOps";
import { queueDeque } from "./queueDeque";
import { bst } from "./bst";
import { avl } from "./avl";
import { heap } from "./heap";
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { topoSort } from "./topoSort";
import { bubbleSort } from "./bubbleSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { binarySearch } from "./binarySearch";
import { linearSearch } from "./linearSearch";
import { fibMemo } from "./fibMemo";
import { knapsack } from "./knapsack";
import { nQueens } from "./nQueens";
import { subsets } from "./subsets";

/** The topic registry. To add a topic, create its module and list it here. */
export const TOPICS: Topic[] = [
  twoPointers,
  slidingWindow,
  linkedListReverse,
  doublyLinkedList,
  cycleDetection,
  stackOps,
  queueDeque,
  bst,
  avl,
  heap,
  bfs,
  dfs,
  dijkstra,
  topoSort,
  bubbleSort,
  mergeSort,
  quickSort,
  binarySearch,
  linearSearch,
  fibMemo,
  knapsack,
  nQueens,
  subsets,
];

export const topicById = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);

export const TOPIC_IDS = TOPICS.map((t) => t.id);
