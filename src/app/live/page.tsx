import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveRefresher } from "@/components/live/live-refresher";
import { LiveStage, LiveStageSkeleton } from "@/components/live/live-stage";
import { Schedule } from "@/components/live/schedule";
import { PageTransition } from "@/components/layout/page-transition";

export const metadata: Metadata = {
  title: "Live",
  description: "Watch the PHFI fellowship live, chat with others watching, and see meeting times in your time zone.",
};

export default function LivePage() {
  return (
    // Same rhythm as the home page: 12px below the navbar, sections 96 / 128 / 160px apart.
    <PageTransition>
      <div className="container-page pb-12 pt-3 md:pb-16 lg:pb-20">
        {/* The same 1440px reading column as the home page sections */}
        <div className="content-width">
          <LiveRefresher />

          <div className="flex flex-col gap-24 md:gap-32 lg:gap-40">
            <Suspense fallback={<LiveStageSkeleton />}>
              <LiveStage />
            </Suspense>

            <section id="schedule" aria-labelledby="schedule-title" className="scroll-mt-28">
              <h2 id="schedule-title" className="text-headline text-ink">
                When we gather
              </h2>
              <div className="mt-6">
                <Schedule />
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
