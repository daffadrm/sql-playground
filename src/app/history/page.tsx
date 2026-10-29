import type { Metadata } from "next";
import { HistoryView } from "./HistoryView";

export const metadata: Metadata = { title: "History · SQL Learning Playground" };

export default function HistoryPage() {
  return <HistoryView />;
}
