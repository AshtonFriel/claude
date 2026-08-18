"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Step } from "./types";

export interface Player<S> {
  step: Step<S>;
  idx: number;
  len: number;
  playing: boolean;
  speed: number;
  setSpeed(v: number): void;
  togglePlay(): void;
  stepFwd(): void;
  stepBack(): void;
  toStart(): void;
  toEnd(): void;
}

/** Generic step engine: drives any topic's precomputed step list. */
export function usePlayer<S>(steps: Step<S>[]): Player<S> {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // 1 (slow) .. 10 (fast)
  const len = steps.length;

  const playingRef = useRef(playing);
  playingRef.current = playing;

  // new run -> rewind
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= len - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, len - 1)), 1450 - speed * 130);
    return () => clearTimeout(t);
  }, [playing, idx, speed, len]);

  const togglePlay = useCallback(() => {
    if (!playingRef.current) setIdx((i) => (i >= len - 1 ? 0 : i));
    setPlaying((p) => !p);
  }, [len]);
  const stepFwd = useCallback(() => {
    setPlaying(false);
    setIdx((i) => Math.min(i + 1, len - 1));
  }, [len]);
  const stepBack = useCallback(() => {
    setPlaying(false);
    setIdx((i) => Math.max(i - 1, 0));
  }, []);
  const toStart = useCallback(() => {
    setPlaying(false);
    setIdx(0);
  }, []);
  const toEnd = useCallback(() => {
    setPlaying(false);
    setIdx(len - 1);
  }, [len]);

  return {
    step: steps[Math.min(idx, len - 1)],
    idx: Math.min(idx, len - 1),
    len,
    playing,
    speed,
    setSpeed,
    togglePlay,
    stepFwd,
    stepBack,
    toStart,
    toEnd,
  };
}
