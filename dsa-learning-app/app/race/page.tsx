import type { Metadata } from "next";
import { RaceView } from "@/components/RaceView";

export const metadata: Metadata = { title: "Algorithm Race" };

export default function RacePage() {
  return <RaceView />;
}
