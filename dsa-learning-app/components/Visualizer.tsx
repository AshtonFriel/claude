"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/player";
import { parseGraph, parseNums, randomArray } from "@/lib/parse";
import type { NumsTopic, Step, Topic } from "@/lib/types";
import { CodePanel } from "./CodePanel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNums(t: Topic): t is NumsTopic<any> {
  return t.inputs.kind === "nums";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stepsFor(topic: Topic, text: string, startText: string): Step<any>[] {
  if (isNums(topic)) {
    return topic.makeSteps(parseNums(text, { max: topic.inputs.max ?? 12, allowDup: topic.inputs.allowDup !== false }));
  }
  const graph = parseGraph(text);
  const start = startText.trim().toUpperCase();
  if (!graph.adj[start]) {
    throw new Error(`Start node "${start || "?"}" isn't in the graph. Nodes: ${graph.nodes.join(", ")}.`);
  }
  return topic.makeSteps({ graph, start });
}

/** The full workbench for one topic: input row, stage, transport, and synced code panel. */
export function Visualizer({ topic }: { topic: Topic }) {
  const [text, setText] = useState(topic.inputs.defaultValue);
  const [startText, setStartText] = useState(isNums(topic) ? "" : topic.inputs.startDefault);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState(() => stepsFor(topic, topic.inputs.defaultValue, isNums(topic) ? "" : topic.inputs.startDefault));
  const player = usePlayer(steps);

  const run = (t = text, s = startText) => {
    try {
      setSteps(stepsFor(topic, t, s));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const shuffle = () => {
    if (!isNums(topic)) return;
    const v = randomArray(Math.min(8, topic.inputs.max ?? 8)).join(", ");
    setText(v);
    run(v, startText);
  };

  const { togglePlay, stepFwd, stepBack } = player;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") stepFwd();
      else if (e.key === "ArrowLeft") stepBack();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [togglePlay, stepFwd, stepBack]);

  const Renderer = topic.renderer;
  const step = player.step;
  const atStart = player.idx <= 0;
  const atEnd = player.idx >= player.len - 1;

  return (
    <div className="bench">
      <section className="card" aria-label="Visualizer">
        <div className="card-h">
          Visualizer <span className="card-h-note">{topic.tagline}</span>
        </div>

        <div className="input-row">
          <label htmlFor="viz-input">{topic.inputs.label}</label>
          <input
            id="viz-input"
            type="text"
            value={text}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
          />
          {isNums(topic) ? (
            <button className="shuffle-btn" title="Random values" onClick={shuffle}>🎲</button>
          ) : (
            <>
              <label htmlFor="viz-start">Start</label>
              <input
                id="viz-start"
                type="text"
                className="start-input"
                value={startText}
                spellCheck={false}
                onChange={(e) => setStartText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
              />
            </>
          )}
          <button className="run-btn" onClick={() => run()}>Run</button>
          {error && <div className="input-err show">{error}</div>}
        </div>

        <div className="legend">
          {topic.legend.map(([v, label]) => (
            <span key={v}>
              <i style={{ background: `var(${v})` }} />
              {label}
            </span>
          ))}
        </div>

        <div className="stage">
          <Renderer state={step.state} />
        </div>

        {step.aux && <div className="aux-strip show">{step.aux}</div>}

        <div className="narrate" aria-live="polite">
          <span className="dot" />
          <span>{step.desc}</span>
        </div>

        <div className="transport">
          <button className="t-btn" aria-label="Back to start" disabled={atStart} onClick={player.toStart}>⏮</button>
          <button className="t-btn" aria-label="Step back" disabled={atStart} onClick={player.stepBack}>⏴</button>
          <button className="t-btn play" aria-label={player.playing ? "Pause" : "Play"} onClick={player.togglePlay}>
            {player.playing ? "❚❚" : atEnd && player.len > 1 ? "↺" : "▶"}
          </button>
          <button className="t-btn" aria-label="Step forward" disabled={atEnd} onClick={player.stepFwd}>⏵</button>
          <button className="t-btn" aria-label="Skip to end" disabled={atEnd} onClick={player.toEnd}>⏭</button>
          <div className="speed-wrap">
            <span>slow</span>
            <input
              type="range"
              min={1}
              max={10}
              value={player.speed}
              aria-label="Animation speed"
              onChange={(e) => player.setSpeed(Number(e.target.value))}
            />
            <span>fast</span>
          </div>
          <span className="step-count">
            step {player.idx + 1} / {player.len}
          </span>
        </div>
      </section>

      <CodePanel code={topic.code} line={step.line} />
    </div>
  );
}
