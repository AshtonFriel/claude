# 🧭 Algorithm Atlas

Learn data structures & algorithms by watching them run. An interactive Next.js app with
step-by-step visualizers, the executing line of code highlighted in sync, custom input,
per-topic quizzes, and local progress tracking — no account needed.

## Running it

```bash
npm install
npm run dev      # development, http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## What's inside

| Category | Topics |
| --- | --- |
| Arrays | Two Pointers, Sliding Window |
| Linked Lists | Reverse a Linked List, Doubly Linked List, Cycle Detection (Floyd) |
| Stacks & Queues | Stack Operations, Queue & Deque |
| Trees | Binary Search Tree, AVL Rotations, Binary Heap |
| Graphs | Breadth-First Search, Depth-First Search, Dijkstra's Algorithm, Topological Sort |
| Sorting Algorithms | Bubble Sort, Merge Sort, Quick Sort |
| Searching Algorithms | Binary Search, Linear Search |
| Dynamic Programming | Fibonacci & Memoization, 0/1 Knapsack |
| Recursion & Backtracking | N-Queens, Subset Generation |

Every topic view has:

- **Visualizer** — the algorithm's operations animated one step at a time (array swaps,
  pointer movement, node visits), with play / pause / step-forward / step-back / skip
  controls, a speed slider, and keyboard shortcuts (`Space` play/pause, `←` / `→` step).
- **Custom input** — type your own array, list values, graph edges (`A-B, A-C`, weighted
  `A-B:4`, directed `A>B`), or operation scripts (`push 3, pop`) and run the algorithm on
  them.
- **Code panel** — the Java implementation with the currently executing line highlighted
  as the animation runs.
- **Learning aids** — what the algorithm does, best/average/worst time and space
  complexity, and real-world use cases.
- **Quiz** — three questions per topic; answer all correctly (or use "Mark as complete")
  and the topic is checked off. Progress persists in `localStorage`.

Dark mode follows the system by default and can be toggled from the header; the layout is
responsive down to phone widths (the topic menu becomes a drawer).

## Tech stack

- [Next.js](https://nextjs.org) (App Router, static generation) + React 19
- TypeScript throughout
- Tailwind CSS v4 with a CSS-custom-property design-token system (light + dark palettes)
- [next-themes](https://github.com/pacocoursey/next-themes) for system/explicit theme handling
- `next/font` for self-hosted Google Fonts (Bricolage Grotesque, Atkinson Hyperlegible,
  JetBrains Mono)
- No other runtime dependencies — visualizations are plain SVG/DOM driven by
  precomputed step lists

## Adding a topic

Topics are plugin-style modules; playback, code highlighting, quizzes, routing, and
progress are all generic.

1. Create `lib/topics/myTopic.tsx` exporting a `Topic` (see `lib/types.ts`): metadata,
   complexity, explanation, a code listing (array of lines), an `inputs` spec, a pure
   `makeSteps(input)` generator returning `{ line, desc, state }` frames, a renderer, and
   quiz questions.
2. Reuse a renderer from `components/renderers/` (`Bars`, `LinkedList`, `Tree`, `Graph`)
   or add your own component that takes `{ state }`.
3. Register it in `lib/topics/index.ts`. The sidebar, route (`/topic/<id>`), and progress
   tracking pick it up automatically. Placeholder "soon" entries live in `lib/catalog.ts`.
