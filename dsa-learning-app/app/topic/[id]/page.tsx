import { notFound } from "next/navigation";
import { TopicView } from "@/components/TopicView";
import { TOPIC_IDS, topicById } from "@/lib/topics";

export function generateStaticParams() {
  return TOPIC_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: topicById(id)?.title ?? "Topic" };
}

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!topicById(id)) notFound();
  return <TopicView id={id} />;
}
