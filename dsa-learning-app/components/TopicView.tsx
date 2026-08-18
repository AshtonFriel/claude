"use client";

import { useProgress } from "@/lib/progress";
import { topicById } from "@/lib/topics";
import { Quiz } from "./Quiz";
import { Visualizer } from "./Visualizer";

export function TopicView({ id }: { id: string }) {
  const { isDone, setDone } = useProgress();
  const topic = topicById(id);
  if (!topic) return null;
  const done = isDone(id);

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
      <Quiz key={`quiz-${id}`} topic={topic} />
    </>
  );
}
