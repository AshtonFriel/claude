import type { LegendEntry } from "@/lib/types";

export const SORT_LEGEND: LegendEntry[] = [
  ["--c-compare", "comparing"],
  ["--c-active", "writing / swapping"],
  ["--c-pivot", "pivot"],
  ["--c-done", "sorted"],
  ["--c-pointer", "unsorted"],
];

export const LIST_LEGEND: LegendEntry[] = [
  ["--c-compare", "curr"],
  ["--c-done", "prev / flipped link"],
  ["--c-pointer", "next / forward link"],
];

export const TREE_LEGEND: LegendEntry[] = [
  ["--c-compare", "current node"],
  ["--c-done", "visited"],
];

export const GRAPH_LEGEND: LegendEntry[] = [
  ["--c-compare", "current / edge in use"],
  ["--c-pointer", "discovered (queued)"],
  ["--c-done", "visited"],
];
