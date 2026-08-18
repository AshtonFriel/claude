/** Curriculum skeleton: category order in the sidebar, plus not-yet-built topics shown as "soon". */

export const CATEGORIES = [
  "Arrays",
  "Linked Lists",
  "Stacks & Queues",
  "Trees",
  "Graphs",
  "Sorting Algorithms",
  "Searching Algorithms",
  "Dynamic Programming",
  "Recursion & Backtracking",
] as const;

/** Every planned topic is now built — add future "coming soon" entries here. */
export const PLANNED: Record<string, string[]> = {};
