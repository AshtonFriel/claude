import type { Topic } from "@/lib/types";
import { bubbleSort } from "./bubbleSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";
import { linkedListReverse } from "./linkedListReverse";
import { bst } from "./bst";
import { bfs } from "./bfs";
import { dfs } from "./dfs";

/** The topic registry. To add a topic, create its module and list it here. */
export const TOPICS: Topic[] = [bubbleSort, mergeSort, quickSort, linkedListReverse, bst, bfs, dfs];

export const topicById = (id: string): Topic | undefined => TOPICS.find((t) => t.id === id);

export const TOPIC_IDS = TOPICS.map((t) => t.id);
