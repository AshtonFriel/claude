# 🧭 Algorithm Atlas

An interactive DSA learning platform. Every algorithm is a real, linkable page with a
step-by-step visualizer, syntax-highlighted code in three languages with the executing line
tracked live, quizzes, and local progress tracking. No login, no backend.

**Live site:** enable GitHub Pages on the `gh-pages` branch (see *Deploying* below).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Stack

- **Next.js 16** (App Router, TypeScript, static export) + **React 19**
- **Tailwind CSS v4** over a CSS-custom-property token system (light + dark palettes)
- **Zustand** (persisted) for client state — progress, quiz history, streak, language choice
- **Framer Motion** for page transitions, gated on `prefers-reduced-motion`
- **Shiki** for real syntax highlighting; **Recharts** for the complexity growth chart
- **cmdk** for the ⌘K command palette; **next-themes** for dark mode
- PWA: web manifest + a network-first service worker, so visited topics work offline

## Routing

| Route | What it is |
| --- | --- |
| `/` | Welcome |
| `/topics/[category]/[slug]` | One topic — e.g. `/topics/trees/avl`, `/topics/graphs/dijkstra` |
| `/race` | Race mode: two sorts, one input, one synced clock |
| `/dashboard` | Completion %, streak, quiz accuracy, weak topics, spaced-repetition queue |

Press **⌘K / Ctrl+K** anywhere to jump to any topic by name.

## Topics (23)

| Category | Topics |
| --- | --- |
| Arrays | Two Pointers, Sliding Window |
| Linked Lists | Reverse a Linked List, Doubly Linked List, Cycle Detection (Floyd) |
| Stacks & Queues | Stack Operations, Queue & Deque |
| Trees | Binary Search Tree, AVL Rotations, Binary Heap |
| Graphs | Breadth-First Search, Depth-First Search, Dijkstra's Algorithm, Topological Sort |
| Sorting | Bubble Sort, Merge Sort, Quick Sort |
| Searching | Binary Search, Linear Search |
| Dynamic Programming | Fibonacci & Memoization, 0/1 Knapsack |
| Recursion & Backtracking | N-Queens, Subset Generation |

Every topic page carries: the visualizer (play/pause/step/reset, speed slider, **drag-to-scrub
timeline**), custom data input with validated error states, a code panel with a
**Java / JavaScript / Python** toggle and copy + StackBlitz buttons, complexity badges, real-world
uses, a **common mistakes** callout, **interview questions** that use it, and a 3-question quiz.
Sorting and searching topics also render a **live growth curve** — the step generator is actually
run across input sizes, so the Big-O shape is measured rather than asserted.

## Architecture

The step engine is the spine: a topic's `makeSteps()` returns an array of
`{ line, desc, aux?, state }` snapshots, and the shared player scrubs through them. Nothing about
playback, code highlighting, quizzes, routing, or progress is topic-specific.

```
app/
  layout.tsx                     shell, fonts, theme + PWA registration
  topics/[category]/[slug]/      one dynamic route serves every topic
  race/  dashboard/              comparison + progress pages
components/
  Visualizer.tsx                 input row, stage, transport, timeline
  CodePanel.tsx                  Shiki, language tabs, line sync
  ComplexityChart.tsx            Recharts growth curve
  renderers/                     Bars, Cells, LinkedList, Tree, Graph, StackBox, Grid, Board
lib/
  types.ts                       Topic / Step contracts
  player.ts                      the step engine hook
  store.ts                       Zustand + persistence + derived stats
  topics/                        one module per topic + index registry
```

### Adding a topic

Three steps, no changes to the player, sidebar, or routing:

1. Write a step generator: `makeSteps(input) => Step<S>[]`, where each step names the code line
   it's executing and a plain-English description.
2. Point it at a renderer — reuse one from `components/renderers/`, or write a component that
   takes `{ state }`.
3. Register the topic object in `lib/topics/index.ts`.

The sidebar entry, the `/topics/<category>/<slug>` route, the command-palette entry, progress
tracking, and the dashboard all pick it up automatically. Categories live in `lib/catalog.ts`;
unbuilt topics listed in `PLANNED` render as "soon".

### Data layer

State lives in one Zustand store (`lib/store.ts`) persisted to `localStorage` under a single key,
with pure derived selectors (`streakDays`, `topicStats`, `reviewSuggestions`) that take the log as
an argument. Swapping localStorage for a NextAuth-backed API means replacing the persistence
adapter — no consumer changes.

## Deploying

`npm run build` emits a fully static site to `./out`.

For GitHub Pages under a sub-path, set the base path at build time:

```bash
NEXT_PUBLIC_BASE_PATH=/claude npm run build
```

Then publish `out/` to the `gh-pages` branch (it already contains a `.nojekyll` marker) and, in
the repository's **Settings → Pages**, set the source to **Deploy from a branch → `gh-pages` /
(root)**. Note that GitHub Pages on a *private* repository requires a paid GitHub plan; on the
free plan, either make the repo public or deploy `out/` to Netlify, Vercel, or Cloudflare Pages
instead.
