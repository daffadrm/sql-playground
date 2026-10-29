import type { Metadata } from "next";
import { LearnIndexView } from "./LearnIndexView";

export const metadata: Metadata = { title: "Learn SQL · SQL Learning Playground" };

export default function LearnPage() {
  return <LearnIndexView />;
}
