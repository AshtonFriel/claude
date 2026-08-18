"use client";

import Link from "next/link";
import { topicPath } from "@/lib/catalog";
import { reviewSuggestions, streakDays, topicStats, useAtlas } from "@/lib/store";
import { TOPICS, topicById } from "@/lib/topics";

export function Dashboard() {
  const { done, quizLog, activity } = useAtlas();
  const doneCount = TOPICS.filter((t) => done[t.id]).length;
  const pct = Math.round((doneCount / TOPICS.length) * 100);
  const streak = streakDays(activity);
  const stats = topicStats(quizLog);
  const weak = stats
    .filter((t) => t.wrong > 0 && topicById(t.topic))
    .sort((a, b) => b.wrong / (b.right + b.wrong) - a.wrong / (a.right + a.wrong))
    .slice(0, 5);
  const review = reviewSuggestions(quizLog).filter((t) => topicById(t.topic));
  const answered = quizLog.length;
  const correct = quizLog.filter((a) => a.correct).length;

  return (
    <div>
      <div className="crumb">Overview</div>
      <div className="topic-head">
        <h1>Your progress</h1>
      </div>

      <div className="stat-row">
        <div className="card stat-tile">
          <div className="stat-num">{pct}%</div>
          <div className="stat-label">completed</div>
          <div className="stat-sub">{doneCount} of {TOPICS.length} topics</div>
          <div className="stat-bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="card stat-tile">
          <div className="stat-num">{streak}<span className="stat-unit"> day{streak === 1 ? "" : "s"}</span></div>
          <div className="stat-label">streak</div>
          <div className="stat-sub">{streak > 0 ? "keep it alive — one topic a day" : "open any topic to start one"}</div>
        </div>
        <div className="card stat-tile">
          <div className="stat-num">{answered ? Math.round((correct / answered) * 100) : 0}%</div>
          <div className="stat-label">quiz accuracy</div>
          <div className="stat-sub">{correct} right of {answered} answered</div>
        </div>
      </div>

      <div className="dash-cols">
        <section className="card dash-card" aria-label="Suggested reviews">
          <div className="card-h">Review next</div>
          <div className="dash-body">
            {review.length === 0 ? (
              <p className="dash-empty">
                Nothing due. Miss a quiz question and the topic will resurface here after a day or
                two — lightweight spaced repetition.
              </p>
            ) : (
              review.map((r) => {
                const t = topicById(r.topic)!;
                return (
                  <Link key={r.topic} href={topicPath(t)} className="dash-row">
                    <span>{t.title}</span>
                    <span className="dash-meta">{r.wrong} miss{r.wrong === 1 ? "" : "es"} · last seen {timeAgo(r.lastAt)}</span>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="card dash-card" aria-label="Weak topics">
          <div className="card-h">Weak topics</div>
          <div className="dash-body">
            {weak.length === 0 ? (
              <p className="dash-empty">No quiz misses recorded yet. Go get some wrong — that&apos;s the fast way to learn.</p>
            ) : (
              weak.map((w) => {
                const t = topicById(w.topic)!;
                const rate = Math.round((w.wrong / (w.right + w.wrong)) * 100);
                return (
                  <Link key={w.topic} href={topicPath(t)} className="dash-row">
                    <span>{t.title}</span>
                    <span className="dash-meta">{rate}% miss rate ({w.wrong}/{w.right + w.wrong})</span>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="card dash-card" aria-label="All topics">
        <div className="card-h">All topics</div>
        <div className="dash-grid">
          {TOPICS.map((t) => (
            <Link key={t.id} href={topicPath(t)} className={`dash-chip${done[t.id] ? " done" : ""}`}>
              {done[t.id] ? "✓ " : ""}{t.title}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function timeAgo(at: number): string {
  const days = Math.floor((Date.now() - at) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
