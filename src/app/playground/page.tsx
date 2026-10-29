import type { Metadata } from "next";
import { PlaygroundView } from "./PlaygroundView";

export const metadata: Metadata = { title: "Playground · SQL Learning Playground" };

export default function PlaygroundPage() {
  return <PlaygroundView />;
}
