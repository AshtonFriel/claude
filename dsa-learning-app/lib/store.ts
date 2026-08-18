"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CodeLang } from "./types";

export interface QuizAnswer {
  topic: string;
  correct: boolean;
  at: number;
}

interface AtlasState {
  done: Record<string, boolean>;
  quizLog: QuizAnswer[];
  /** ISO dates ("YYYY-MM-DD") on which the user did anything — drives the streak. */
  activity: string[];
  lang: CodeLang;
  setDone(id: string, val: boolean): void;
  recordAnswer(topic: string, correct: boolean): void;
  touch(): void;
  setLang(lang: CodeLang): void;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Client state, persisted to localStorage. skipHydration keeps SSR markup
 * deterministic — AtlasHydrator rehydrates after mount. The storage shape is
 * self-contained so an auth-backed store could replace localStorage later
 * without touching consumers.
 */
export const useAtlas = create<AtlasState>()(
  persist(
    (set) => ({
      done: {},
      quizLog: [],
      activity: [],
      lang: "java",
      setDone: (id, val) =>
        set((s) => {
          const done = { ...s.done };
          if (val) done[id] = true;
          else delete done[id];
          return { done };
        }),
      recordAnswer: (topic, correct) =>
        set((s) => ({ quizLog: [...s.quizLog.slice(-499), { topic, correct, at: Date.now() }] })),
      touch: () =>
        set((s) => (s.activity.includes(today()) ? {} : { activity: [...s.activity.slice(-364), today()] })),
      setLang: (lang) => set({ lang }),
    }),
    { name: "algorithmAtlas.v2", skipHydration: true },
  ),
);

/** One-time migration from the pre-Zustand v1 store (completed topics only). */
export function migrateV1() {
  try {
    const raw = localStorage.getItem("algorithmAtlas.v1");
    if (!raw) return;
    const old = JSON.parse(raw);
    if (old && typeof old.done === "object") {
      useAtlas.setState((s) => ({ done: { ...old.done, ...s.done } }));
    }
    localStorage.removeItem("algorithmAtlas.v1");
  } catch {
    /* ignore */
  }
}

/* ---------------- derived helpers (pure, testable) ---------------- */

export function streakDays(activity: string[]): number {
  const days = new Set(activity);
  let streak = 0;
  const d = new Date();
  // a streak may end today or yesterday without breaking
  if (!days.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (days.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface TopicStats {
  topic: string;
  right: number;
  wrong: number;
  lastAt: number;
}

export function topicStats(log: QuizAnswer[]): TopicStats[] {
  const by: Record<string, TopicStats> = {};
  for (const a of log) {
    by[a.topic] ??= { topic: a.topic, right: 0, wrong: 0, lastAt: 0 };
    if (a.correct) by[a.topic].right++;
    else by[a.topic].wrong++;
    by[a.topic].lastAt = Math.max(by[a.topic].lastAt, a.at);
  }
  return Object.values(by);
}

/** Spaced-repetition-ish resurfacing: topics with misses, weighted by miss rate and staleness. */
export function reviewSuggestions(log: QuizAnswer[], limit = 3): TopicStats[] {
  const now = Date.now();
  return topicStats(log)
    .filter((t) => t.wrong > 0)
    .map((t) => ({
      ...t,
      score: (t.wrong / (t.right + t.wrong)) * Math.min(4, (now - t.lastAt) / 86400000 + 0.5),
    }))
    .sort((a, b) => (b as TopicStats & { score: number }).score - (a as TopicStats & { score: number }).score)
    .slice(0, limit);
}
