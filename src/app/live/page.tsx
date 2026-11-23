import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveStage, LiveStageSkeleton } from "@/components/live/live-stage";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  title: "Live",
  description: "Watch the PHFI fellowship live, chat with others watching, and pray along.",
};

/**
 * The live page: only while a stream is on (otherwise LiveStage sends visitors to the meeting
 * calendar). Full width under the header, in the site's light or dark mode.
 */
export default function LivePage() {
  return (
    <PageTransition>
      <div className="min-h-[calc(100svh-3.5rem)] lg:min-h-[calc(100svh-4rem)]">
        <Suspense fallback={<LiveStageSkeleton />}>
          <LiveStage />
        </Suspense>
      </div>
    </PageTransition>
  );
}
