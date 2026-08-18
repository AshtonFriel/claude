"use client";

import { useEffect, useRef } from "react";

/** Code listing with the currently executing line highlighted. */
export function CodePanel({ code, line }: { code: string[]; line: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector(".code-line.hl")?.scrollIntoView({ block: "nearest" });
  }, [line]);

  return (
    <section className="card code-card" aria-label="Code">
      <div className="card-h code-h">JavaScript — executing line highlighted</div>
      <div className="code-body" ref={ref}>
        {code.map((l, i) => (
          <div key={i} className={`code-line${i + 1 === line ? " hl" : ""}`}>
            <span className="ln">{i + 1}</span>
            <span>{l || " "}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
