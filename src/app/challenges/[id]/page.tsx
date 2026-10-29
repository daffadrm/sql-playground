import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CHALLENGES, getChallenge } from "@/lib/content/challenges";
import { ChallengeView } from "./ChallengeView";

export function generateStaticParams() {
  return CHALLENGES.map((c) => ({ id: String(c.id) }));
}

export async function generateMetadata({ params }: PageProps<"/challenges/[id]">): Promise<Metadata> {
  const { id } = await params;
  const challenge = getChallenge(Number(id));
  return { title: challenge ? `${challenge.title} · Challenge` : "Challenge tidak ditemukan" };
}

export default async function ChallengePage({ params }: PageProps<"/challenges/[id]">) {
  const { id } = await params;
  const challenge = getChallenge(Number(id));
  if (!challenge) notFound();
  // key: reset editor and feedback when moving between challenges
  return <ChallengeView key={challenge.id} id={challenge.id} />;
}
