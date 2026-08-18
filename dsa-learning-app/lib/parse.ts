import type { GraphData } from "./types";

export function parseNums(
  text: string,
  { min = 2, max = 12, allowDup = true }: { min?: number; max?: number; allowDup?: boolean } = {},
): number[] {
  const parts = String(text).split(/[\s,;]+/).filter(Boolean);
  if (parts.length < min) throw new Error(`Enter at least ${min} numbers, separated by commas.`);
  if (parts.length > max) throw new Error(`Keep it to ${max} numbers or fewer so the animation stays readable.`);
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

export function randomArray(n = 8): number[] {
  const out: number[] = [];
  while (out.length < n) {
    const v = 5 + Math.floor(Math.random() * 95);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}
