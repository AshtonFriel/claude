"use client";

import type { ListState } from "@/lib/types";
import type { ReactNode } from "react";

const CW = 78; // cell width
const GAP = 34;
const X0 = 74;
const Y = 74;
const NULL_X = 22; // the ∅ slot on the far left

/** Singly/doubly linked-list renderer: value/pointer cells, forward, backward and
    flipped arrows, plus data-driven pointer chips. */
export function LinkedList({ state }: { state: ListState }) {
  const n = state.vals.length;
  const W = X0 + n * (CW + GAP) + 10;
  const H = 196;
  const cx = (i: number) => X0 + i * (CW + GAP);
  const gone = new Set(state.gone ?? []);

  const cells: ReactNode[] = [];
  const links: ReactNode[] = [];
  const chips: ReactNode[] = [];

  for (let i = 0; i < n; i++) {
    const x = cx(i);
    const isHead = state.newHead === i;
    const cellCls = ["sv-cell"];
    if (state.chips?.some((c) => c.target === i && c.name === "curr")) cellCls.push("curr");
    if (isHead) cellCls.push("newhead");
    cells.push(
      <g key={`c${i}`} className={gone.has(i) ? "gone" : undefined}>
        <rect x={x} y={Y - 22} width={CW} height={44} rx={9} className={cellCls.join(" ")} />
        <line x1={x + CW - 24} y1={Y - 22} x2={x + CW - 24} y2={Y + 22} stroke="var(--line)" strokeWidth={1.6} />
        <text x={x + (CW - 24) / 2} y={Y} className="sv-label">{state.vals[i]}</text>
        {isHead && (
          <text x={x + CW / 2 - 12} y={Y - 32} className="sv-ptr" fill="var(--c-done)">new head</text>
        )}
      </g>,
    );

    const nx = state.next[i]; // index | null | -1 (∅ slot)
    const px = x + CW - 12; // centre of the pointer compartment
    if (nx === null || nx === undefined) {
      links.push(
        <text key={`l${i}`} x={px} y={Y + 2} className="sv-small" fontSize={13} opacity={gone.has(i) ? 0.3 : 1}>∅</text>,
      );
    } else if (nx === i + 1) {
      links.push(
        <g key={`l${i}`}>
          <circle cx={px} cy={Y} r={3} fill="var(--c-pointer)" />
          <line x1={px} y1={Y} x2={cx(nx) - 4} y2={Y} className="sv-link" markerEnd="url(#arrF)" />
        </g>,
      );
    } else if (nx > i + 1) {
      // forward skip link — arc over the cells
      const tx = cx(nx) + 6;
      links.push(
        <g key={`l${i}`}>
          <circle cx={px} cy={Y - 18} r={3} fill="var(--c-pointer)" />
          <path
            d={`M ${px} ${Y - 18} C ${px} ${Y - 56}, ${tx - 20} ${Y - 60}, ${tx} ${Y - 30}`}
            className="sv-link" markerEnd="url(#arrF)"
          />
        </g>,
      );
    } else {
      // backward link — arc underneath to an earlier cell (or the ∅ slot)
      const tx = nx === -1 ? NULL_X + 6 : cx(nx) + CW - 6;
      links.push(
        <g key={`l${i}`}>
          <circle cx={px} cy={Y + 18} r={3} fill="var(--c-done)" />
          <path
            d={`M ${px} ${Y + 18} C ${px} ${Y + 52}, ${tx + 24} ${Y + 56}, ${tx} ${Y + 32}`}
            className="sv-link flipped" markerEnd="url(#arrB)"
          />
        </g>,
      );
    }

    // doubly-linked back pointers — tighter purple arcs below, from the cell's left edge
    if (state.prevLinks && i in state.prevLinks && !gone.has(i)) {
      const pv = state.prevLinks[i];
      const sx = x + 14;
      if (pv === null) {
        links.push(
          <text key={`p${i}`} x={sx} y={Y + 34} className="sv-small" fontSize={12} fill="var(--c-pivot)">∅</text>,
        );
      } else {
        const tx = cx(pv) + CW - 18;
        links.push(
          <g key={`p${i}`}>
            <circle cx={sx} cy={Y + 20} r={2.5} fill="var(--c-pivot)" />
            <path
              d={`M ${sx} ${Y + 20} C ${sx} ${Y + 40}, ${tx + 16} ${Y + 42}, ${tx} ${Y + 26}`}
              className="sv-link back" markerEnd="url(#arrP)"
            />
          </g>,
        );
      }
    }
  }

  for (const chip of state.chips ?? []) {
    const x = chip.target === null ? NULL_X : cx(chip.target) + (CW - 24) / 2;
    const y = Y + 66 + chip.lane * 26;
    chips.push(
      <g key={chip.name}>
        <line x1={x} y1={Y + 26} x2={x} y2={y - 12} stroke={chip.color} strokeWidth={1.4} strokeDasharray="3 3" />
        <text x={x} y={y} className="sv-ptr" fill={chip.color}>{chip.name}</text>
      </g>,
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" aria-label="Linked list diagram">
      <defs>
        <marker id="arrF" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-pointer)" />
        </marker>
        <marker id="arrB" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-done)" />
        </marker>
        <marker id="arrP" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-pivot)" />
        </marker>
      </defs>
      <text x={NULL_X} y={Y + 22} className="sv-small" fontSize={16}>∅</text>
      {links}
      {cells}
      {chips}
    </svg>
  );
}
