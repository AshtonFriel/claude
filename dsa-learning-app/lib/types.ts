import type { ComponentType, ReactNode } from "react";

/* ================================================================
   Core contracts for Algorithm Atlas.

   A topic is a self-contained module: metadata, explanation, code
   listing, a pure step generator, a renderer component, and a quiz.
   Register it in lib/topics/index.ts and everything else — routing,
   playback, code highlighting, quizzes, progress — is generic.
   ================================================================ */

/** One frame of an algorithm run. `line` is a 1-based index into the topic's code listing. */
export interface Step<S> {
  line: number;
  desc: string;
  /** Optional monospace status line (queue contents, call stack, traversal output …). */
  aux?: string;
  state: S;
}

export interface Complexity {
  best: string;
  avg: string;
  worst: string;
  space: string;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  answer: number;
  why: string;
}

export interface NumsInputSpec {
  kind: "nums";
  label: string;
  defaultValue: string;
  max?: number;
  allowDup?: boolean;
}

export interface GraphInputSpec {
  kind: "graph";
  label: string;
  defaultValue: string;
  startDefault: string;
}

export interface GraphData {
  nodes: string[];
  edges: [string, string][];
  adj: Record<string, string[]>;
}

export interface GraphInput {
  graph: GraphData;
  start: string;
}

/** Legend entry: [CSS custom property holding the colour, label]. */
export type LegendEntry = [string, string];

interface TopicBase<S> {
  id: string;
  category: string;
  title: string;
  tagline: string;
  complexity: Complexity;
  about: ReactNode;
  uses: ReactNode;
  code: string[];
  legend: LegendEntry[];
  renderer: ComponentType<{ state: S }>;
  quiz: QuizQuestion[];
}

export interface NumsTopic<S> extends TopicBase<S> {
  inputs: NumsInputSpec;
  makeSteps(input: number[]): Step<S>[];
}

export interface GraphTopic<S> extends TopicBase<S> {
  inputs: GraphInputSpec;
  makeSteps(input: GraphInput): Step<S>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Topic<S = any> = NumsTopic<S> | GraphTopic<S>;

/* ---------------- renderer state shapes ---------------- */

export interface BarsState {
  a: number[];
  sorted?: number[];
  compare?: number[];
  swapped?: number[];
  pivot?: number;
  range?: [number, number];
  done?: boolean;
}

export interface ListPtrs {
  /** undefined = pointer not introduced yet; null = points at ∅. */
  prev?: number | null;
  curr?: number | null;
  next?: number | null;
}

export interface ListState {
  vals: number[];
  /** node index -> next node index; null = ∅ shown in the cell; -1 = flipped link to the ∅ slot. */
  next: Record<number, number | null>;
  ptrs: ListPtrs;
  newHead?: number;
}

export interface TreeNode {
  v: number;
  left: number | null;
  right: number | null;
}

export interface TreeState {
  nodes: TreeNode[];
  root: number | null;
  current?: number;
  visited?: number[];
  pending?: number;
  /** true when `current` was just attached (suppresses the active-edge highlight). */
  settled?: boolean;
}

export interface GraphState {
  graph: GraphData;
  visited?: string[];
  seen?: string[];
  tread?: [string, string][];
  current?: string;
  activeEdge?: [string, string];
}
