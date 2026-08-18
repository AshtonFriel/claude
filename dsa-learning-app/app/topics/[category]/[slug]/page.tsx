import { notFound } from "next/navigation";
import { TopicView } from "@/components/TopicView";
import { categoryByTitle } from "@/lib/catalog";
import { TOPICS, topicById } from "@/lib/topics";

interface Params {
  category: string;
  slug: string;
}

export function generateStaticParams() {
  return TOPICS.map((t) => ({
    category: categoryByTitle(t.category)?.slug ?? "misc",
    slug: t.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const t = topicById(slug);
  return { title: t?.title ?? "Topic", description: t?.tagline };
}

export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const { category, slug } = await params;
  const topic = topicById(slug);
  if (!topic || categoryByTitle(topic.category)?.slug !== category) notFound();
  return <TopicView id={slug} />;
}
