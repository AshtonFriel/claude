"use client";

import type { TreeState } from "@/lib/types";
import type { ReactNode } from "react";

const XS = 64;
const YS = 74;
const PAD = 40;

/** Binary tree renderer: x = in-order rank, y = depth. */
export function Tree({ state }: { state: TreeState }) {
  const { nodes, root } = state;
  if (!nodes.length || root === null) return <p className="sv-small">empty tree</p>;

  const pos: Record<number, { r: number; d: number }> = {};
  let rank = 0;
  let maxDepth = 0;
  (function walk(id: number | null, depth: number) {
    if (id === null) return;
    walk(nodes[id].left, depth + 1);
    pos[id] = { r: rank++, d: depth };
    maxDepth = Math.max(maxDepth, depth);
    walk(nodes[id].right, depth + 1);
  })(root, 0);

  const W = PAD * 2 + Math.max(1, rank - 1) * XS;
  const H = PAD * 2 + maxDepth * YS + 10;
  const X = (id: number) => PAD + pos[id].r * XS;
  const Yp = (id: number) => PAD + pos[id].d * YS;

  const visited = new Set(state.visited ?? []);
  const edges: ReactNode[] = [];
  const circles: ReactNode[] = [];

  for (let id = 0; id < nodes.length; id++) {
    if (!(id in pos)) continue;
    for (const kid of [nodes[id].left, nodes[id].right]) {
      if (kid !== null && kid in pos) {
        const active = state.current === kid && !state.settled;
        edges.push(
          <line
            key={`e${id}-${kid}`}
            x1={X(id)} y1={Yp(id)} x2={X(kid)} y2={Yp(kid)}
            className={`sv-edge${active ? " active" : ""}`}
          />,
        );
      }
    }
  }
  for (const key of Object.keys(pos)) {
    const i = Number(key);
    const cls = ["sv-node"];
    if (visited.has(i)) cls.push("visited");
    if (state.current === i) cls.push("current");
    circles.push(
      <g key={`n${i}`} className={visited.has(i) ? "visited" : undefined}>
        <circle cx={X(i)} cy={Yp(i)} r={21} className={cls.join(" ")} />
        <text x={X(i)} y={Yp(i)} className="sv-label">{nodes[i].v}</text>
      </g>,
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(W, 640)} role="img" aria-label="Binary search tree diagram">
      {edges}
      {circles}
      {state.pending !== undefined && (
        <text x={PAD - 20} y={18} className="sv-ptr" fill="var(--c-compare)" textAnchor="start">
          inserting {state.pending}
        </text>
      )}
    </svg>
  );
}
