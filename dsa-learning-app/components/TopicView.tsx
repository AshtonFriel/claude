"use client";

import { useEffect } from "react";
import { useAtlas } from "@/lib/store";
import { topicById } from "@/lib/topics";
import type { NumsTopic } from "@/lib/types";
import { ComplexityChart } from "./ComplexityChart";
import { Quiz } from "./Quiz";
import { Visualizer } from "./Visualizer";

export function TopicView({ id }: { id: string }) {
  const done = useAtlas((s) => !!s.done[id]);
  const setDone = useAtlas((s) => s.setDone);
  const touch = useAtlas((s) => s.touch);
  const topic = topicById(id);

  useEffect(() => {
    touch(); // opening a topic counts toward the streak
  }, [id, touch]);

  if (!topic) return null;

  return (
    <>
      <div className="crumb">{topic.category}</div>
      <div className="topic-head">
        <h1>{topic.title}</h1>
        <button className={`done-btn${done ? " on" : ""}`} onClick={() => setDone(id, !done)}>
          {done ? "✓ Completed" : "Mark as complete"}
        </button>
      </div>
      <div className="chips">
        <span className="chip"><span>best</span> {topic.complexity.best}</span>
        <span className="chip"><span>average</span> {topic.complexity.avg}</span>
        <span className="chip"><span>worst</span> {topic.complexity.worst}</span>
        <span className="chip"><span>space</span> {topic.complexity.space}</span>
      </div>
      <div className="about">
        {topic.about}
        <p className="uses">{topic.uses}</p>
      </div>

      <Visualizer key={id} topic={topic} />

      {(topic.mistakes?.length || topic.interview?.length) && (
        <div className="aids">
          {topic.mistakes?.length ? (
            <section className="card aid-card mistakes" aria-label="Common mistakes">
              <div className="card-h">⚠ Common mistakes</div>
              <ul>
                {topic.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {topic.interview?.length ? (
            <section className="card aid-card" aria-label="Interview questions">
              <div className="card-h">🎯 Interview questions that use this</div>
              <ul>
                {topic.interview.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      {topic.chart && topic.inputs.kind === "nums" && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <ComplexityChart topic={topic as NumsTopic<any>} />
      )}

      <Quiz key={`quiz-${id}`} topic={topic} />
    </>
  );
}
