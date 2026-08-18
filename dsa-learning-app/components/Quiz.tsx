"use client";

import { useState } from "react";
import { useProgress } from "@/lib/progress";
import type { Topic } from "@/lib/types";

export function Quiz({ topic }: { topic: Topic }) {
  const { setDone } = useProgress();
  const [picks, setPicks] = useState<(number | null)[]>(() => topic.quiz.map(() => null));

  const correct = picks.filter((p, i) => p === topic.quiz[i].answer).length;
  const allRight = correct === topic.quiz.length;

  const pick = (qi: number, oi: number) => {
    const next = [...picks];
    next[qi] = oi;
    setPicks(next);
    if (next.filter((p, i) => p === topic.quiz[i].answer).length === topic.quiz.length) {
      setDone(topic.id, true);
    }
  };

  return (
    <section className="card quiz" aria-label="Quiz">
      <div className="card-h quiz-h">
        <span className="qt">Check your understanding</span>
        <span className={`quiz-score${allRight ? " pass" : ""}`}>
          {allRight ? "🎉 All correct — topic complete!" : `${correct} / ${topic.quiz.length} correct`}
        </span>
      </div>
      {topic.quiz.map((q, qi) => {
        const answered = picks[qi] !== null;
        return (
          <div key={qi} className="q-block">
            <div className="q-text">
              {qi + 1}. {q.q}
            </div>
            <div className="q-opts">
              {q.opts.map((o, oi) => {
                const cls = ["q-opt"];
                if (answered) {
                  if (oi === q.answer) cls.push("correct");
                  else if (oi === picks[qi]) cls.push("wrong");
                }
                return (
                  <button key={oi} className={cls.join(" ")} disabled={answered} onClick={() => pick(qi, oi)}>
                    {o}
                  </button>
                );
              })}
            </div>
            {answered && <div className="q-explain show">{q.why}</div>}
          </div>
        );
      })}
      <button className="quiz-reset" onClick={() => setPicks(topic.quiz.map(() => null))}>
        Reset quiz
      </button>
    </section>
  );
}
