import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { MessageCard } from "@/components/watch/cards";
import { WatchHero } from "@/components/watch/hero";
import { Library, MessageGrid } from "@/components/watch/library";
import { EmptyState } from "@/components/watch/page-parts";
import { Shelf } from "@/components/watch/shelf";
import { meetingSchedule } from "@/config/site";
import { getCatalogue } from "@/lib/watch";
import { meetingParam } from "@/lib/watch-types";

export const metadata: Metadata = {
  title: "Watch",
  description: "Every message from our Tuesday and Thursday fellowships and Jericho Hour, to watch whenever suits you.",
  alternates: { canonical: "/watch" },
};

const ROW = 12;
const videoSizes = "(min-width: 1504px) 340px, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 46vw, 82vw";

/** How many of the newest messages lead the page, larger. */
const LATEST = 3;

/**
 * The Watch page: while a meeting is on, the live stream at the top; then the three latest
 * messages, large; a row for each meeting's recordings (when there's more than one meeting to
 * tell apart); and the rest, five to a row, by meeting. Built from the YouTube channel (see
 * lib/watch.ts).
 */
export default async function WatchPage() {
  const { messages } = await getCatalogue();
  const full = messages.filter((m) => m.kind === "message");
  const meetings = meetingSchedule.filter((meeting) => full.some((m) => m.meeting === meeting.name));

  return (
    <PageTransition>
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <h1 className="sr-only">Watch</h1>
        {/* Everything, the live preview included, sits in the 1440px reading column */}
        <div className="content-width flex flex-col gap-16 pt-2 md:gap-20 md:pt-4 lg:gap-24">
          <WatchHero />

          {full.length > 0 && (
            <section aria-labelledby="latest-title">
              <h2 id="latest-title" className="text-section text-ink">
                Latest messages
              </h2>
              <ul className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-3 lg:mt-10 lg:gap-x-8">
                {full.slice(0, LATEST).map((m, i) => (
                  <li key={m.slug}>
                    <MessageCard
                      message={m}
                      large
                      withSummary
                      preload={i === 0}
                      sizes="(min-width: 1504px) 460px, (min-width: 768px) 33vw, 100vw"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {messages.length === 0 && (
            <EmptyState title="Messages are on their way">
              Recordings of our meetings will appear here after each one. Until then, join us live.
            </EmptyState>
          )}

          {/* A row for each meeting, when there's more than one to tell apart */}
          {meetings.length > 1 &&
            meetings.map((meeting) => {
              const recordings = full.filter((m) => m.meeting === meeting.name);
              return (
                <Shelf
                  key={meeting.name}
                  id={`meeting-${meetingParam(meeting.name)}`}
                  title={meeting.name}
                  detail={meeting.summary}
                  size="video"
                  href={recordings.length > ROW ? `/watch?meeting=${meetingParam(meeting.name)}#all` : undefined}
                >
                  {recordings.slice(0, ROW).map((m) => (
                    <li key={m.slug}>
                      <MessageCard message={m} sizes={videoSizes} />
                    </li>
                  ))}
                </Shelf>
              );
            })}

          {full.length > LATEST && (
            // The address can point here directly: /watch?meeting=jericho-hour#all
            <section id="all" aria-labelledby="all-title" className="scroll-mt-24">
              <h2 id="all-title" className="text-section text-ink">
                More messages
              </h2>
              <div className="mt-6 md:mt-8">
                <Suspense fallback={<MessageGrid messages={full.slice(LATEST, LATEST + 15)} />}>
                  <Library messages={full} meetings={meetings.map((m) => m.name)} skip={LATEST} />
                </Suspense>
              </div>
            </section>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
