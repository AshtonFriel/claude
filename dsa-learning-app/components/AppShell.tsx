"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CATEGORIES, PLANNED, topicPath } from "@/lib/catalog";
import { migrateV1, useAtlas } from "@/lib/store";
import { TOPICS } from "@/lib/topics";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const done = useAtlas((s) => s.done);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // rehydrate persisted state after mount (keeps SSR markup deterministic)
  useEffect(() => {
    useAtlas.persist.rehydrate();
    migrateV1();
  }, []);

  const doneCount = TOPICS.filter((t) => done[t.id]).length;
  const close = () => setDrawerOpen(false);

  return (
    <>
      <CommandPalette />
      <header className="topbar">
        <button id="menuBtn" className="icon-btn" aria-label="Open topic menu" onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <Link href="/" className="brand">
          <span className="compass">🧭</span> Algorithm Atlas <small>learn DSA by watching it run</small>
        </Link>
        <div className="flex-1" />
        <button
          className="palette-hint"
          aria-label="Open command palette"
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        >
          Search <kbd>⌘K</kbd>
        </button>
        <div className="progress-pill">
          <b>{doneCount}</b> / {TOPICS.length} topics completed
        </div>
        <ThemeToggle />
      </header>

      <div className="shell">
        <nav className={`sidebar${drawerOpen ? " open" : ""}`} aria-label="DSA topics">
          <div>
            <div className="nav-cat">Overview</div>
            <Link href="/dashboard" className={`nav-item${pathname === "/dashboard" ? " active" : ""}`} onClick={close}>
              📊 Dashboard
            </Link>
            <Link href="/race" className={`nav-item${pathname === "/race" ? " active" : ""}`} onClick={close}>
              🏁 Algorithm Race
            </Link>
          </div>
          {CATEGORIES.map((cat) => {
            const real = TOPICS.filter((t) => t.category === cat.title);
            const planned = PLANNED[cat.title] ?? [];
            if (!real.length && !planned.length) return null;
            return (
              <div key={cat.slug}>
                <div className="nav-cat">{cat.title}</div>
                {real.map((t) => {
                  const href = topicPath(t);
                  return (
                    <Link
                      key={t.id}
                      href={href}
                      className={`nav-item${pathname === href ? " active" : ""}`}
                      onClick={close}
                    >
                      {t.title}
                      {done[t.id] && <span className="check" aria-label="completed">✓</span>}
                    </Link>
                  );
                })}
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
        {drawerOpen && <div className="backdrop show" onClick={close} />}
        <main className="main">{children}</main>
      </div>
    </>
  );
}
