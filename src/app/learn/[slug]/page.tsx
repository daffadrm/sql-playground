import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LESSONS, getLesson } from "@/lib/content/lessons";
import { LessonView } from "./LessonView";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return { title: lesson ? `${lesson.title} · Learn SQL` : "Materi tidak ditemukan" };
}

export default async function LessonPage({ params }: PageProps<"/learn/[slug]">) {
  const { slug } = await params;
  if (!getLesson(slug)) notFound();
  // key: reset editors and feedback when moving between lessons
  return <LessonView key={slug} slug={slug} />;
}
