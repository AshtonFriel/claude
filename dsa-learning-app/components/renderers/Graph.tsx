"use client";

import type { GraphState } from "@/lib/types";

const W = 460;
const H = 330;

/** Graph renderer: nodes on an ellipse; supports directed edges, weights, and node sublabels. */
export function Graph({ state }: { state: GraphState }) {
  const { nodes, edges } = state.graph;
  const N = nodes.length;
  const CX = W / 2;
  const CY = H / 2 + 4;
  const RX = W / 2 - 52;
  const RY = H / 2 - 48;

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
      {state.directed && (
        <defs>
          <marker id="agDefault" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6.5} markerHeight={6.5} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--line)" />
          </marker>
          <marker id="agActive" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6.5} markerHeight={6.5} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--c-compare)" />
          </marker>
          <marker id="agTread" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6.5} markerHeight={6.5} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--c-done)" />
          </marker>
        </defs>
      )}
      {edges.map(([u, v]) => {
        const active = !!ae && ((ae[0] === u && ae[1] === v) || (!state.directed && ae[0] === v && ae[1] === u));
        const cls = active ? "sv-edge active" : isTread(u, v) ? "sv-edge tread" : "sv-edge";
        let { x: x1, y: y1 } = pos[u];
        let { x: x2, y: y2 } = pos[v];
        if (state.directed) {
          // shorten both ends so the arrowhead sits outside the node circle
          const d = Math.hypot(x2 - x1, y2 - y1) || 1;
          const ux = (x2 - x1) / d;
          const uy = (y2 - y1) / d;
          x1 += ux * 21;
          y1 += uy * 21;
          x2 -= ux * 25;
          y2 -= uy * 25;
        }
        const marker = state.directed
          ? `url(#${active ? "agActive" : isTread(u, v) ? "agTread" : "agDefault"})`
          : undefined;
        const w = state.weights?.[`${u}|${v}`];
        const mx = (pos[u].x + pos[v].x) / 2;
        const my = (pos[u].y + pos[v].y) / 2;
        // nudge the weight label perpendicular to the edge
        const d2 = Math.hypot(pos[v].x - pos[u].x, pos[v].y - pos[u].y) || 1;
        const ox = (-(pos[v].y - pos[u].y) / d2) * 11;
        const oy = ((pos[v].x - pos[u].x) / d2) * 11;
        return (
          <g key={`${u}-${v}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} markerEnd={marker} />
            {w !== undefined && (
              <text x={mx + ox} y={my + oy} className={`sv-w${active ? " active" : ""}`}>{w}</text>
            )}
          </g>
        );
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
            {state.sub?.[n] !== undefined && (
              <text x={pos[n].x} y={pos[n].y + 32} className="sv-sub">{state.sub[n]}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
