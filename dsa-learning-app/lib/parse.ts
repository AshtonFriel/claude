import type { GraphData } from "./types";

export function parseNums(
  text: string,
  { min = 2, max = 12, allowDup = true }: { min?: number; max?: number; allowDup?: boolean } = {},
): number[] {
  const parts = String(text).split(/[\s,;]+/).filter(Boolean);
  if (parts.length < min) throw new Error(min === 1 ? "Enter a number." : `Enter at least ${min} numbers, separated by commas.`);
  if (parts.length > max) throw new Error(max === 1 ? "Enter a single number." : `Keep it to ${max} numbers or fewer so the animation stays readable.`);
  const nums = parts.map((p) => {
    const n = Number(p);
    if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error(`"${p}" is not a whole number.`);
    if (n < -999 || n > 999) throw new Error("Use values between -999 and 999.");
    return n;
  });
  if (!allowDup && new Set(nums).size !== nums.length) {
    throw new Error("Please use distinct values for this topic.");
  }
  return nums;
}

/** One required extra value (search target, window size, …). */
export function parseIntField(text: string | undefined, label: string, min: number, max: number): number {
  const n = Number(String(text ?? "").trim());
  if (!String(text ?? "").trim() || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`${label} must be a whole number.`);
  }
  if (n < min || n > max) throw new Error(`${label} must be between ${min} and ${max}.`);
  return n;
}

export function parseGraph(text: string): GraphData {
  const pairs = String(text).split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  if (!pairs.length) throw new Error("Enter edges like  A-B, A-C, B-D");
  const nodes = new Set<string>();
  const edges: [string, string][] = [];
  for (const p of pairs) {
    const m = p.match(/^([A-Za-z0-9]{1,3})\s*-\s*([A-Za-z0-9]{1,3})$/);
    if (!m) throw new Error(`"${p}" isn't an edge. Use the form  A-B  (letters or digits, max 3 chars).`);
    const u = m[1].toUpperCase();
    const v = m[2].toUpperCase();
    if (u === v) throw new Error(`"${p}" is a self-loop — use two different nodes.`);
    nodes.add(u);
    nodes.add(v);
    if (!edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u))) edges.push([u, v]);
  }
  if (nodes.size > 10) throw new Error("Keep it to 10 nodes or fewer so the layout stays readable.");
  const adj: Record<string, string[]> = {};
  [...nodes].sort().forEach((n) => (adj[n] = []));
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  for (const n in adj) adj[n].sort();
  return { nodes: [...nodes].sort(), edges, adj };
}

export interface WeightedGraph {
  graph: GraphData;
  /** Edge weights keyed "u|v" in the stored edge orientation. */
  weights: Record<string, number>;
  /** Adjacency with weights: node -> [neighbour, weight][] sorted by neighbour. */
  wadj: Record<string, [string, number][]>;
}

/** Undirected weighted edges: "A-B:4, B-C:2". */
export function parseWeightedGraph(text: string): WeightedGraph {
  const pairs = String(text).split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  if (!pairs.length) throw new Error("Enter weighted edges like  A-B:4, B-C:2");
  const nodes = new Set<string>();
  const edges: [string, string][] = [];
  const weights: Record<string, number> = {};
  for (const p of pairs) {
    const m = p.match(/^([A-Za-z0-9]{1,3})\s*-\s*([A-Za-z0-9]{1,3})\s*:\s*(\d{1,3})$/);
    if (!m) throw new Error(`"${p}" isn't a weighted edge. Use the form  A-B:4  (weight 0–999).`);
    const u = m[1].toUpperCase();
    const v = m[2].toUpperCase();
    const w = Number(m[3]);
    if (u === v) throw new Error(`"${p}" is a self-loop — use two different nodes.`);
    nodes.add(u);
    nodes.add(v);
    if (!edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u))) {
      edges.push([u, v]);
      weights[`${u}|${v}`] = w;
    }
  }
  if (nodes.size > 8) throw new Error("Keep it to 8 nodes or fewer so the layout stays readable.");
  const adj: Record<string, string[]> = {};
  const wadj: Record<string, [string, number][]> = {};
  [...nodes].sort().forEach((n) => {
    adj[n] = [];
    wadj[n] = [];
  });
  for (const [u, v] of edges) {
    const w = weights[`${u}|${v}`];
    adj[u].push(v);
    adj[v].push(u);
    wadj[u].push([v, w]);
    wadj[v].push([u, w]);
  }
  for (const n in adj) {
    adj[n].sort();
    wadj[n].sort((x, y) => (x[0] < y[0] ? -1 : 1));
  }
  return { graph: { nodes: [...nodes].sort(), edges, adj }, weights, wadj };
}

/** Directed edges: "A>B, A>C, B>D". */
export function parseDigraph(text: string): GraphData {
  const pairs = String(text).split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  if (!pairs.length) throw new Error("Enter directed edges like  A>B, A>C, B>D");
  const nodes = new Set<string>();
  const edges: [string, string][] = [];
  for (const p of pairs) {
    const m = p.match(/^([A-Za-z0-9]{1,3})\s*(?:>|->)\s*([A-Za-z0-9]{1,3})$/);
    if (!m) throw new Error(`"${p}" isn't a directed edge. Use the form  A>B .`);
    const u = m[1].toUpperCase();
    const v = m[2].toUpperCase();
    if (u === v) throw new Error(`"${p}" is a self-loop — use two different nodes.`);
    nodes.add(u);
    nodes.add(v);
    if (!edges.some(([a, b]) => a === u && b === v)) edges.push([u, v]);
  }
  if (nodes.size > 9) throw new Error("Keep it to 9 nodes or fewer so the layout stays readable.");
  const adj: Record<string, string[]> = {};
  [...nodes].sort().forEach((n) => (adj[n] = []));
  for (const [u, v] of edges) adj[u].push(v);
  for (const n in adj) adj[n].sort();
  return { nodes: [...nodes].sort(), edges, adj };
}

export interface Op {
  op: string;
  arg?: number;
}

/** Operation scripts like "push 3, pop, peek". `verbs` maps each verb to whether it takes a number. */
export function parseOps(text: string, verbs: Record<string, boolean>): Op[] {
  const parts = String(text).split(/[,\n;]+/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) throw new Error(`Enter operations like  ${exampleOps(verbs)}`);
  if (parts.length > 14) throw new Error("Keep it to 14 operations or fewer.");
  return parts.map((p) => {
    const m = p.match(/^([A-Za-z]+)(?:\s+(-?\d{1,3}))?$/);
    if (!m || !(m[1].toLowerCase() in verbs)) {
      throw new Error(`"${p}" isn't a valid operation. Use: ${Object.keys(verbs).join(", ")}.`);
    }
    const op = m[1].toLowerCase();
    const needsArg = verbs[op];
    if (needsArg && m[2] === undefined) throw new Error(`"${op}" needs a value, e.g.  ${op} 5`);
    if (!needsArg && m[2] !== undefined) throw new Error(`"${op}" doesn't take a value.`);
    return needsArg ? { op, arg: Number(m[2]) } : { op };
  });
}

function exampleOps(verbs: Record<string, boolean>): string {
  return Object.entries(verbs)
    .slice(0, 2)
    .map(([v, hasArg]) => (hasArg ? `${v} 3` : v))
    .join(", ");
}

export function randomArray(n = 8): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const v = 5 + Math.floor(Math.random() * 95);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}
