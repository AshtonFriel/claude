"use client";

import type { GraphState } from "@/lib/types";

const W = 460;
const H = 320;

/** Graph renderer: nodes on an ellipse, edges classed by traversal state. */
export function Graph({ state }: { state: GraphState }) {
  const { nodes, edges } = state.graph;
  const N = nodes.length;
  const CX = W / 2;
  const CY = H / 2 + 6;
  const RX = W / 2 - 50;
  const RY = H / 2 - 44;

  const pos: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    pos[n] = { x: CX + RX * Math.cos(ang), y: CY + RY * Math.sin(ang) };
  });

  const visited = new Set(state.visited ?? []);
  const seen = new Set(state.seen ?? []);
  const tread = state.tread ?? [];
  const isTread = (u: string, v: string) =>
    tread.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
  const ae = state.activeEdge;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={460} role="img" aria-label="Graph diagram">
      {edges.map(([u, v]) => {
        const active = !!ae && ((ae[0] === u && ae[1] === v) || (ae[0] === v && ae[1] === u));
        const cls = active ? "sv-edge active" : isTread(u, v) ? "sv-edge tread" : "sv-edge";
        return <line key={`${u}-${v}`} x1={pos[u].x} y1={pos[u].y} x2={pos[v].x} y2={pos[v].y} className={cls} />;
      })}
      {nodes.map((n) => {
        const cls = ["sv-node"];
        if (visited.has(n)) cls.push("visited");
        else if (seen.has(n)) cls.push("seen");
        if (state.current === n) cls.push("current");
        return (
          <g key={n} className={visited.has(n) ? "visited" : undefined}>
            <circle cx={pos[n].x} cy={pos[n].y} r={19} className={cls.join(" ")} />
            <text x={pos[n].x} y={pos[n].y} className="sv-label">{n}</text>
          </g>
        );
      })}
    </svg>
  );
}
