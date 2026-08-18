import Link from "next/link";

export default function Home() {
  return (
    <div className="welcome">
      <div className="crumb">Welcome</div>
      <h1>Watch algorithms think.</h1>
      <p className="lede">
        Algorithm Atlas turns data structures &amp; algorithms into something you can{" "}
        <em>run, pause, and rewind</em>. Pick a topic from the menu to get:
      </p>
      <ul>
        <li>
          <b>A step-by-step visualizer</b> — swaps, pointer moves, and node visits animated one
          operation at a time, with the matching line of code highlighted as it executes.
        </li>
        <li>
          <b>Your own data</b> — type in any array, list, or graph and watch the algorithm chew
          on it.
        </li>
        <li>
          <b>The essentials</b> — what it does, Big-O time &amp; space, and where it shows up in
          the real world.
        </li>
        <li>
          <b>A quick quiz</b> — three questions per topic; answer them all correctly and the
          topic is marked complete.
        </li>
      </ul>
      <p>
        Start with <b>Bubble Sort</b> for the gentlest introduction, or jump straight to{" "}
        <b>Breadth-First Search</b> to see the queue do its thing. Your progress is saved in this
        browser — no account needed.
      </p>
      <p>
        <Link href="/topic/bubble-sort" className="run-btn inline-block no-underline">
          Start with Bubble Sort →
        </Link>
      </p>
    </div>
  );
}
