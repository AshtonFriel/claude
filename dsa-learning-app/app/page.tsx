import Link from "next/link";
import { HeroDemo } from "@/components/HeroDemo";
import { CATEGORIES, topicPath } from "@/lib/catalog";
import { TOPICS } from "@/lib/topics";

/** Stability isn't a property of the step engine, so it's declared here. */
const STABLE: Record<string, string> = {
  "bubble-sort": "Yes",
  "insertion-sort": "Yes",
  "merge-sort": "Yes",
  "counting-sort": "Yes",
  "selection-sort": "No",
  "quick-sort": "No",
  "heap-sort": "No",
};

const FEATURES = [
  { title: "Step-through player", body: "Play, pause, step back and forward, or drag the timeline to scrub to any point in the run." },
  { title: "Java, JavaScript & Python", body: "Listings switch language in place, with copy and an Open in StackBlitz action." },
  { title: "Measured growth curve", body: "Sorting and searching topics run their own step generator across input sizes and chart the result." },
  { title: "Quiz on every topic", body: "Three questions each; answer them all correctly and the topic is marked complete." },
  { title: "Algorithm Race", body: "Run two sorts side by side on the same input against one synced clock." },
  { title: "⌘K command palette", body: "Jump to any topic by name without leaving the keyboard." },
];

const STEPS = [
  {
    n: "01",
    h: "Bring your own data",
    p: "Type an array, a weighted graph, an operation script, or a start node. Atlas parses it, validates it, and drops it straight into the stage.",
  },
  {
    n: "02",
    h: "Step, don't guess",
    p: "Play forward, step back one operation, or drag the timeline to any point in the run. The code panel highlights the exact line responsible for the frame on screen, in Java, JavaScript, or Python.",
  },
  {
    n: "03",
    h: "Read the cost, then prove it",
    p: "On sorting and searching topics, the growth chart runs the topic's own step generator across input sizes and plots steps executed — the Big-O shape is measured, not asserted.",
  },
];

export default function Home() {
  const cats = CATEGORIES.map((c) => ({
    ...c,
    items: TOPICS.filter((t) => t.category === c.title),
  })).filter((c) => c.items.length > 0);

  const tableRows = TOPICS.filter(
    (t) => t.category === "Sorting Algorithms" || t.category === "Searching Algorithms",
  );

  return (
    <div className="landing">
      <div className="wrap">
        <section className="hero">
          <div>
            <h1>
              Watch the algorithm
              <br />
              think.
            </h1>
            <p className="hero-lede">
              Algorithm Atlas turns data structures and algorithms into something you run, pause and
              rewind — every comparison, swap and pointer move animated one step at a time, with the
              matching line of code highlighted as it executes. No login, no backend.
            </p>
            <div className="hero-ctas">
              <Link href="/topics/sorting/bubble-sort" className="btn btn-primary">
                Start with Bubble Sort
              </Link>
              <Link href="#curriculum" className="btn btn-ghost">
                Browse {TOPICS.length} topics
              </Link>
            </div>
            <p className="hero-micro">
              No signup · Progress saved in your browser · Press ⌘K to jump anywhere
            </p>
          </div>
          <HeroDemo />
        </section>
      </div>

      <section className="band" aria-label="Algorithm Atlas by the numbers">
        <div className="wrap">
          <div className="band-grid">
            <div>
              <p className="band-num">{TOPICS.length}</p>
              <p className="band-label">Topics visualized</p>
            </div>
            <div>
              <p className="band-num">{cats.length}</p>
              <p className="band-label">Categories</p>
            </div>
            <div>
              <p className="band-num">3</p>
              <p className="band-label">Languages per listing</p>
            </div>
            <div>
              <p className="band-num">0</p>
              <p className="band-label">Accounts required</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="lsec" id="curriculum">
          <span className="kicker">The curriculum</span>
          <h2>
            {cats.length} categories, {TOPICS.length} topics
          </h2>
          <p className="lsec-lede">
            Every topic page carries a step-through visualizer, custom data input, code in three
            languages, complexity badges, real-world uses, common mistakes, interview questions, and a
            three-question quiz.
          </p>
          <div className="lgrid">
            {cats.map((c) => (
              <Link key={c.slug} href={topicPath(c.items[0])} className="card">
                <p className="card-kicker">
                  {c.items.length} topic{c.items.length === 1 ? "" : "s"}
                </p>
                <h3 className="card-title">{c.title}</h3>
                <p className="card-body">{c.items.map((t) => t.title).join(", ")}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="lsec">
          <span className="kicker">What&apos;s included</span>
          <div className="lgrid" style={{ marginTop: 24 }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <h3 className="card-title" style={{ margin: 0, fontSize: 16 }}>
                  {f.title}
                </h3>
                <p className="card-body">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lsec" id="how">
          <span className="kicker">How it works</span>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.n}>
                {i > 0 && <div className="hr" />}
                <div className="step-row">
                  <p className="step-n">{s.n}</p>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lsec" id="complexity">
          <span className="kicker">Reference</span>
          <h2>Sorting and searching, side by side</h2>
          <div className="table-wrap">
            <table className="ltable">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Best</th>
                  <th>Average</th>
                  <th>Worst</th>
                  <th>Space</th>
                  <th>Stable</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link href={topicPath(t)}>{t.title}</Link>
                    </td>
                    <td className="m">{t.complexity.best}</td>
                    <td className="m">{t.complexity.avg}</td>
                    <td className="m">{t.complexity.worst}</td>
                    <td className="m">{t.complexity.space}</td>
                    <td>{STABLE[t.id] ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lcta">
          <h3>Open it and press play</h3>
          <p className="lsec-lede">
            Algorithm Atlas runs entirely in your browser — start with Bubble Sort, race two sorts
            head-to-head, or jump straight to the topic you need for an interview.
          </p>
          <div className="hero-ctas">
            <Link href="/topics/sorting/bubble-sort" className="btn btn-primary">
              Start with Bubble Sort
            </Link>
            <Link href="/race" className="btn btn-ghost">
              🏁 Race two algorithms
            </Link>
          </div>
        </section>

        <footer className="lfoot">
          <span>🧭 Algorithm Atlas — learn DSA by watching it run</span>
          <Link href="#curriculum">Topics</Link>
          <Link href="#complexity">Complexity</Link>
          <Link href="/dashboard">Dashboard</Link>
        </footer>
      </div>
    </div>
  );
}
