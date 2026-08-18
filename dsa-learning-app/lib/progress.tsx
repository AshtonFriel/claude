"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "algorithmAtlas.v1";

interface ProgressCtx {
  done: Record<string, boolean>;
  isDone(id: string): boolean;
  setDone(id: string, val: boolean): void;
}

const Ctx = createContext<ProgressCtx>({
  done: {},
  isDone: () => false,
  setDone: () => {},
});

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDoneMap] = useState<Record<string, boolean>>({});

  // hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.done === "object") setDoneMap(parsed.done);
      }
    } catch {
      /* private mode etc. */
    }
  }, []);

  const setDone = useCallback((id: string, val: boolean) => {
    setDoneMap((m) => {
      const next = { ...m };
      if (val) next[id] = true;
      else delete next[id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ done: next }));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const isDone = useCallback((id: string) => !!done[id], [done]);

  return <Ctx.Provider value={{ done, isDone, setDone }}>{children}</Ctx.Provider>;
}

export const useProgress = () => useContext(Ctx);
