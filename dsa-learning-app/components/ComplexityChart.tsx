"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NumsTopic } from "@/lib/types";

interface Point {
  n: number;
  steps: number;
}

/**
 * Live growth chart: runs the topic's own step generator across input sizes and
 * plots steps executed, so the Big-O curve's *shape* is measured, not asserted.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ComplexityChart({ topic }: { topic: NumsTopic<any> }) {
  const [data, setData] = useState<Point[] | null>(null);

  useEffect(() => {
    // compute after mount — keeps prerendered HTML light and deterministic
    const chart = topic.chart!;
    const points = chart.sizes.map((n) => {
      let total = 0;
      const trials = 3;
      for (let t = 0; t < trials; t++) {
        const input = chart.genInput(n);
        total += topic.makeSteps(input, chart.extra?.(input)).length;
      }
      return { n, steps: Math.round(total / trials) };
    });
    setData(points);
  }, [topic]);

  return (
    <section className="card chart-card" aria-label="Complexity growth chart">
      <div className="card-h">
        Growth curve <span className="card-h-note">steps executed vs input size n (avg of 3 runs)</span>
      </div>
      <div className="chart-body">
        {data && (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 12, right: 18, bottom: 4, left: 4 }}>
              <CartesianGrid stroke="var(--line)" strokeOpacity={0.6} vertical={false} />
              <XAxis
                dataKey="n"
                stroke="var(--muted)"
                tick={{ fill: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono-src)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--line)" }}
                label={{ value: "n", position: "insideBottomRight", offset: -2, fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                stroke="var(--muted)"
                tick={{ fill: "var(--muted)", fontSize: 12, fontFamily: "var(--font-mono-src)" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 9,
                  color: "var(--ink)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono-src)",
                  boxShadow: "var(--shadow)",
                }}
                labelFormatter={(n) => `n = ${n}`}
                formatter={(v) => [`${v} steps`, topic.title]}
              />
              <Line
                type="monotone"
                dataKey="steps"
                stroke="var(--chart-line)"
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--chart-line)", strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <p className="chart-note">
        Worst/average complexity: <code>{topic.complexity.avg}</code>. The curve&apos;s shape —
        straight, gently bending, or ballooning — is the Big-O class you can see.
      </p>
    </section>
  );
}
