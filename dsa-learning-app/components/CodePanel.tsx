"use client";

import { useEffect, useRef, useState } from "react";
import { useAtlas } from "@/lib/store";
import type { CodeLang, Topic } from "@/lib/types";

interface Listing {
  lang: CodeLang;
  label: string;
  lines: string[];
  /** map[i] = display line for canonical line i+1; identity when absent. */
  map?: number[];
}

/* Shiki is heavy, so it loads lazily and once per session. */
type ShikiHighlighter = {
  codeToTokensBase(code: string, opts: { lang: string; theme: string }): { content: string; color?: string }[][];
};
let shikiPromise: Promise<ShikiHighlighter> | null = null;
function getHighlighter(): Promise<ShikiHighlighter> {
  shikiPromise ??= import("shiki").then((m) =>
    m.createHighlighter({ themes: ["github-dark-default"], langs: ["java", "javascript", "python"] }),
  ) as Promise<ShikiHighlighter>;
  return shikiPromise;
}

function listingsFor(topic: Topic): Listing[] {
  const out: Listing[] = [{ lang: "java", label: "Java", lines: topic.code }];
  if (topic.codeAlt?.javascript) out.push({ lang: "javascript", label: "JavaScript", lines: topic.codeAlt.javascript });
  if (topic.codeAlt?.python) {
    out.push({ lang: "python", label: "Python", lines: topic.codeAlt.python.lines, map: topic.codeAlt.python.map });
  }
  return out;
}

/** Syntax-highlighted, language-switchable code listing with the executing line highlighted. */
export function CodePanel({ topic, line }: { topic: Topic; line: number }) {
  const listings = listingsFor(topic);
  const prefLang = useAtlas((s) => s.lang);
  const setLang = useAtlas((s) => s.setLang);
  const active = listings.find((l) => l.lang === prefLang) ?? listings[0];

  const [tokens, setTokens] = useState<{ content: string; color?: string }[][] | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setTokens(null);
    getHighlighter()
      .then((hl) => {
        if (!alive) return;
        setTokens(hl.codeToTokensBase(active.lines.join("\n"), { lang: active.lang, theme: "github-dark-default" }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [active.lang, active.lines]);

  const displayLine = active.map ? (active.map[line - 1] ?? 0) : line;

  useEffect(() => {
    ref.current?.querySelector(".code-line.hl")?.scrollIntoView({ block: "nearest" });
  }, [displayLine]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(active.lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const openStackblitz = async () => {
    const sdk = (await import("@stackblitz/sdk")).default;
    const js = topic.codeAlt?.javascript ?? [];
    sdk.openProject(
      {
        title: `${topic.title} — Algorithm Atlas`,
        description: topic.tagline,
        template: "javascript",
        files: {
          "index.js": js.join("\n") + "\n\n// Try it:\n// console.log(...)\n",
          "index.html": `<pre id="out"></pre><script src="index.js"></script>`,
        },
      },
      { newWindow: true },
    );
  };

  return (
    <section className="card code-card" aria-label="Code">
      <div className="card-h code-h">
        <div className="lang-tabs" role="tablist" aria-label="Code language">
          {listings.map((l) => (
            <button
              key={l.lang}
              role="tab"
              aria-selected={l.lang === active.lang}
              className={`lang-tab${l.lang === active.lang ? " on" : ""}`}
              onClick={() => setLang(l.lang)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <span className="code-actions">
          {active.lang === "javascript" && (
            <button className="code-action" onClick={openStackblitz} title="Open in StackBlitz">⚡ StackBlitz</button>
          )}
          <button className="code-action" onClick={copy} title="Copy code">{copied ? "✓ Copied" : "⧉ Copy"}</button>
        </span>
      </div>
      <div className="code-body" ref={ref}>
        {active.lines.map((raw, i) => (
          <div key={i} className={`code-line${i + 1 === displayLine ? " hl" : ""}`}>
            <span className="ln">{i + 1}</span>
            <span>
              {tokens?.[i]
                ? tokens[i].map((t, k) => (
                    <span key={k} style={{ color: t.color }}>{t.content}</span>
                  ))
                : raw || " "}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
