"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseNums, randomArray } from "@/lib/parse";
import type { BarsState, NumsTopic, Step } from "@/lib/types";
import { topicById } from "@/lib/topics";
import { Button } from "./ui/button";

const RACERS = ["bubble-sort", "merge-sort", "quick-sort"] as const;

/** Race mode: two sorting algorithms, one input, one synced clock. */
export function RaceView() {
  const [aId, setAId] = useState<string>("bubble-sort");
  const [bId, setBId] = useState<string>("quick-sort");
  const [text, setText] = useState("29, 10, 14, 37, 13, 8, 21, 45");
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState(0);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(6);
  const inputRef = useRef(text);

  const race = useMemo(() => {
    try {
      const nums = parseNums(inputRef.current, { max: 12 });
      const a = topicById(aId) as NumsTopic<BarsState>;
      const b = topicById(bId) as NumsTopic<BarsState>;
      return {
        a: { topic: a, steps: a.makeSteps(nums) as Step<BarsState>[] },
        b: { topic: b, steps: b.makeSteps(nums) as Step<BarsState>[] },
      };
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aId, bId, runId]);

  const maxLen = race ? Math.max(race.a.steps.length, race.b.steps.length) : 1;

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [race]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= maxLen - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, maxLen - 1)), 1450 - speed * 130);
    return () => clearTimeout(t);
  }, [playing, idx, speed, maxLen]);

  const run = () => {
    try {
      parseNums(text, { max: 12 });
      inputRef.current = text;
      setError(null);
      setRunId((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const shuffle = () => {
    const v = randomArray(8).join(", ");
    setText(v);
    inputRef.current = v;
    setError(null);
    setRunId((r) => r + 1);
  };

  const finished = race && idx >= maxLen - 1 && maxLen > 1;
  const summary =
    race && finished
      ? (() => {
          const [fast, slow] =
            race.a.steps.length <= race.b.steps.length ? [race.a, race.b] : [race.b, race.a];
          const ratio = (slow.steps.length / fast.steps.length).toFixed(1);
          return `${fast.topic.title} finished in ${fast.steps.length} steps; ${slow.topic.title} needed ${slow.steps.length} — ${ratio}× more work on the same input.`;
        })()
      : null;

  return (
    <div>
      <div className="crumb">Compare</div>
      <div className="topic-head">
        <h1>Algorithm Race</h1>
      </div>
      <div className="about">
        <p>
          Two sorting algorithms, the same input, one synced clock. Each panel shows its own step
          counter — the gap between them is time complexity made visible. Try a nearly-sorted
          array (bubble sort&apos;s best case) versus a reversed one (its worst).
        </p>
      </div>

      <section className="card" aria-label="Race controls">
        <div className="input-row">
          <label htmlFor="race-a">Lane A</label>
          <select id="race-a" className="race-select" value={aId} onChange={(e) => setAId(e.target.value)}>
            {RACERS.map((id) => (
              <option key={id} value={id}>{topicById(id)!.title}</option>
            ))}
          </select>
          <label htmlFor="race-b">Lane B</label>
          <select id="race-b" className="race-select" value={bId} onChange={(e) => setBId(e.target.value)}>
            {RACERS.map((id) => (
              <option key={id} value={id}>{topicById(id)!.title}</option>
            ))}
          </select>
          <label htmlFor="race-input">Array</label>
          <input
            id="race-input"
            type="text"
            value={text}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
          />
          <button className="shuffle-btn" title="Random values" onClick={shuffle}>🎲</button>
          <Button size="sm" onClick={run}>Run</Button>
          {error && <div className="input-err show">{error}</div>}
        </div>

        {race && (
          <>
            <div className="race-grid">
              {([race.a, race.b] as const).map((lane, k) => {
                const li = Math.min(idx, lane.steps.length - 1);
                const laneDone = idx >= lane.steps.length - 1;
                const Renderer = lane.topic.renderer;
                return (
                  <div key={k} className="race-lane">
                    <div className="race-lane-h">
                      <b>{lane.topic.title}</b>
                      <span className={`race-count${laneDone ? " done" : ""}`}>
                        {laneDone ? `🏁 ${lane.steps.length} steps` : `step ${li + 1} / ${lane.steps.length}`}
                      </span>
                    </div>
                    <div className="stage race-stage">
                      <Renderer state={lane.steps[li].state} />
                    </div>
                    <div className="race-narrate">{lane.steps[li].desc}</div>
                  </div>
                );
              })}
            </div>

            {summary && <div className="race-summary">{summary}</div>}

            <div className="timeline">
              <input
                type="range"
                min={0}
                max={maxLen - 1}
                value={Math.min(idx, maxLen - 1)}
                aria-label="Race timeline"
                onChange={(e) => {
                  setPlaying(false);
                  setIdx(Number(e.target.value));
                }}
              />
            </div>
            <div className="transport">
              <button className="t-btn" aria-label="Back to start" disabled={idx <= 0} onClick={() => { setPlaying(false); setIdx(0); }}>⏮</button>
              <button className="t-btn play" aria-label={playing ? "Pause" : "Play"} onClick={() => {
                if (!playing && idx >= maxLen - 1) setIdx(0);
                setPlaying((p) => !p);
              }}>
                {playing ? "❚❚" : finished ? "↺" : "▶"}
              </button>
              <button className="t-btn" aria-label="Step forward" disabled={idx >= maxLen - 1} onClick={() => { setPlaying(false); setIdx((i) => Math.min(i + 1, maxLen - 1)); }}>⏵</button>
              <div className="speed-wrap">
                <span>slow</span>
                <input type="range" min={1} max={10} value={speed} aria-label="Race speed" onChange={(e) => setSpeed(Number(e.target.value))} />
                <span>fast</span>
              </div>
              <span className="step-count">tick {Math.min(idx, maxLen - 1) + 1} / {maxLen}</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
