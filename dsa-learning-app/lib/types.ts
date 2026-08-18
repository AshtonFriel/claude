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

/** A second, short input field (search target, window size, capacity, start node …). */
export interface ExtraField {
  label: string;
  defaultValue: string;
}

export interface NumsInputSpec {
  kind: "nums";
  label: string;
  defaultValue: string;
  min?: number;
  max?: number;
  allowDup?: boolean;
  extraField?: ExtraField;
}

export interface GraphInputSpec {
  kind: "graph";
  label: string;
  defaultValue: string;
  startDefault: string;
}

/** Free-form text input, parsed by the topic's own makeSteps (ops scripts, weighted edges …). */
export interface TextInputSpec {
  kind: "text";
  label: string;
  defaultValue: string;
  extraField?: ExtraField;
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

export type CodeLang = "java" | "javascript" | "python";

/**
 * Python listing with a line map: `map[i]` is the Python line to highlight when
 * canonical (Java) line `i + 1` executes; 0 = no highlight for that line.
 */
export interface PythonListing {
  lines: string[];
  map: number[];
}

/** Extra language listings. JavaScript listings mirror the Java line numbering exactly. */
export interface CodeAlt {
  javascript?: string[];
  python?: PythonListing;
}

/** Complexity-growth chart spec: run the generator across sizes, plot steps executed. */
export interface ChartSpec {
  sizes: number[];
  genInput(n: number): number[];
  /** Value for the topic's extra field (e.g. a search target), given the input. */
  extra?(input: number[]): string;
}

interface TopicBase<S> {
  id: string;
  category: string;
  title: string;
  tagline: string;
  complexity: Complexity;
  about: ReactNode;
  uses: ReactNode;
  /** Canonical (Java) code listing; step line numbers index into this. */
  code: string[];
  codeAlt?: CodeAlt;
  mistakes?: string[];
  interview?: string[];
  chart?: ChartSpec;
  legend: LegendEntry[];
  renderer: ComponentType<{ state: S }>;
  quiz: QuizQuestion[];
}

export interface NumsTopic<S> extends TopicBase<S> {
  inputs: NumsInputSpec;
  makeSteps(input: number[], extra?: string): Step<S>[];
}

export interface GraphTopic<S> extends TopicBase<S> {
  inputs: GraphInputSpec;
  makeSteps(input: GraphInput): Step<S>[];
}

export interface TextTopic<S> extends TopicBase<S> {
  inputs: TextInputSpec;
  makeSteps(input: { text: string; extra?: string }): Step<S>[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Topic<S = any> = NumsTopic<S> | GraphTopic<S> | TextTopic<S>;

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

/** Labelled pointer drawn under a cell. `color` is a CSS color value (usually a token var). */
export interface CellPtr {
  name: string;
  idx: number;
  color: string;
}

/** Boxes-in-a-row renderer state: searching, windows, memo tables, queues, subsets. */
export interface CellsState {
  a: (number | string)[];
  compare?: number[];
  active?: number[];
  done?: number[];
  range?: [number, number];
  /** Dim everything outside `range` (search-space shrinking). */
  dimOutside?: boolean;
  hideIndex?: boolean;
  ptrs?: CellPtr[];
  /** Message shown when `a` is empty. */
  empty?: string;
}

export interface StackState {
  items: (number | string)[];
  /** How to highlight the top item this frame. */
  hl?: "push" | "pop" | "peek";
}

/** DP-table renderer state. `cells[r][c]` of null = not computed yet. */
export interface GridState {
  colLabels: string[];
  rowLabels: string[];
  cells: (number | null)[][];
  cur?: [number, number];
  refs?: [number, number][];
  goal?: [number, number];
}

/** N-Queens board. `queens[r]` = column of the queen on row r, or null. */
export interface BoardState {
  n: number;
  queens: (number | null)[];
  tryCell?: [number, number];
  conflicts?: [number, number][];
  solved?: boolean;
}

/** Chip pointing at a linked-list node (or ∅ when target is null). */
export interface ListChip {
  name: string;
  target: number | null;
  color: string;
  lane: number;
}

export interface ListState {
  vals: number[];
  /** node index -> next node index; null = ∅ shown in the cell; -1 = flipped link to the ∅ slot. */
  next: Record<number, number | null>;
  /** Backward pointers (doubly linked lists), drawn as arcs below the cells. */
  prevLinks?: Record<number, number | null>;
  chips?: ListChip[];
  newHead?: number;
  /** Nodes rendered faded (deleted). */
  gone?: number[];
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
  /** Secondary highlight (sift partner, rotation pivot …). */
  alt?: number[];
  visited?: number[];
  pending?: number;
  /** Small annotation drawn beside a node (balance factor, height …). */
  tags?: Record<number, string>;
  /** true when `current` was just attached (suppresses the active-edge highlight). */
  settled?: boolean;
}

export interface GraphState {
  graph: GraphData;
  directed?: boolean;
  /** Edge weight labels keyed "u|v" in the edge's stored orientation. */
  weights?: Record<string, number>;
  /** Small label under each node (distance, in-degree …). */
  sub?: Record<string, string>;
  visited?: string[];
  seen?: string[];
  tread?: [string, string][];
  current?: string;
  activeEdge?: [string, string];
}
