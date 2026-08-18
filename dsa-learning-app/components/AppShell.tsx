"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CATEGORIES, PLANNED } from "@/lib/catalog";
import { useProgress } from "@/lib/progress";
import { TOPICS } from "@/lib/topics";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { done, isDone } = useProgress();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const doneCount = TOPICS.filter((t) => isDone(t.id)).length;
  void done;

  return (
    <>
      <header className="topbar">
        <button id="menuBtn" className="icon-btn" aria-label="Open topic menu" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <Link href="/" className="brand">
          <span className="compass">🧭</span> Algorithm Atlas <small>learn DSA by watching it run</small>
        </Link>
        <div className="flex-1" />
        <div className="progress-pill">
          <b>{doneCount}</b> / {TOPICS.length} topics completed
        </div>
        <ThemeToggle />
      </header>

      <div className="shell">
        <nav className={`sidebar${drawerOpen ? " open" : ""}`} aria-label="DSA topics">
          {CATEGORIES.map((cat) => {
            const real = TOPICS.filter((t) => t.category === cat);
            const planned = PLANNED[cat] ?? [];
            if (!real.length && !planned.length) return null;
            return (
              <div key={cat}>
                <div className="nav-cat">{cat}</div>
                {real.map((t) => (
                  <Link
                    key={t.id}
                    href={`/topic/${t.id}`}
                    className={`nav-item${pathname === `/topic/${t.id}` ? " active" : ""}`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {t.title}
                    {isDone(t.id) && <span className="check" aria-label="completed">✓</span>}
                  </Link>
                ))}
                {planned.map((p) => (
                  <div key={p} className="nav-item planned" aria-disabled="true">
                    {p}
                    <span className="soon">soon</span>
                  </div>
                ))}
              </div>
            );
          })}
        </nav>
        {drawerOpen && <div className="backdrop show" onClick={() => setDrawerOpen(false)} />}
        <main className="main">{children}</main>
      </div>
    </>
  );
}
