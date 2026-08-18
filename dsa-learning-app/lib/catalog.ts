import type { Topic } from "./types";

/** Curriculum skeleton: category order, slugs for routing, and not-yet-built topics. */

export interface Category {
  title: string;
  slug: string;
}

export const CATEGORIES: Category[] = [
  { title: "Arrays", slug: "arrays" },
  { title: "Linked Lists", slug: "linked-lists" },
  { title: "Stacks & Queues", slug: "stacks-queues" },
  { title: "Trees", slug: "trees" },
  { title: "Graphs", slug: "graphs" },
  { title: "Sorting Algorithms", slug: "sorting" },
  { title: "Searching Algorithms", slug: "searching" },
  { title: "Dynamic Programming", slug: "dynamic-programming" },
  { title: "Recursion & Backtracking", slug: "recursion-backtracking" },
  { title: "Greedy Algorithms", slug: "greedy" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByTitle = (title: string) => CATEGORIES.find((c) => c.title === title);

/** Canonical route for a topic. */
export const topicPath = (t: Pick<Topic, "id" | "category">) =>
  `/topics/${categoryByTitle(t.category)?.slug ?? "misc"}/${t.id}`;

/** Planned topics shown as "soon" in the sidebar. */
export const PLANNED: Record<string, string[]> = {
  Trees: ["Tries (Prefix Trees)"],
  Graphs: ["A* Search", "Kruskal's MST"],
  "Greedy Algorithms": ["Huffman Coding"],
};
