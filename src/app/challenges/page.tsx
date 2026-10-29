import type { Metadata } from "next";
import { Suspense } from "react";
import { ChallengeListView } from "./ChallengeListView";

export const metadata: Metadata = { title: "Challenges · SQL Learning Playground" };

export default function ChallengesPage() {
  return (
    // useSearchParams (level filter) needs a Suspense boundary for static rendering
    <Suspense>
      <ChallengeListView />
    </Suspense>
  );
}
