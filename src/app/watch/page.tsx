import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { ClipCard, MessageCard, SeriesPoster } from "@/components/watch/cards";
import { WatchHero } from "@/components/watch/hero";
import { LatestHero } from "@/components/watch/latest-hero";
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

/**
 * The Watch page, laid out like a streaming app: the latest message large at the top (or,
 * while a meeting is on, the live stream itself), then rows to browse: the latest messages,
 * the series, clips, and each meeting's recordings. Everything is
 * listed at the bottom too, by meeting. Built from the YouTube channel (see lib/watch.ts).
 */
export default async function WatchPage() {
  const { messages, series } = await getCatalogue();
  const full = messages.filter((m) => m.kind === "message");
  const clips = messages.filter((m) => m.kind === "clip");
  const meetings = meetingSchedule.filter((meeting) => full.some((m) => m.meeting === meeting.name));

  return (
    <PageTransition>
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <h1 className="sr-only">Watch</h1>
        {/* Everything, the hero included, sits in the 1440px reading column */}
        <div className="content-width flex flex-col gap-16 pt-2 md:gap-20 md:pt-4 lg:gap-24">
          <WatchHero>{full[0] ? <LatestHero message={full[0]} /> : null}</WatchHero>

          {messages.length === 0 && (
            <EmptyState title="Messages are on their way">
              Recordings of our meetings will appear here after each one. Until then, join us live.
            </EmptyState>
          )}

          {full.length > 1 && (
            <Shelf id="latest-title" title="Latest messages" size="video" href={full.length > ROW ? "#all" : undefined}>
              {full.slice(0, ROW).map((m) => (
                <li key={m.slug}>
                  <MessageCard message={m} sizes={videoSizes} />
                </li>
              ))}
            </Shelf>
          )}

          {series.length > 0 && (
            <Shelf id="series-title" title="Series" size="poster" href={series.length > 5 ? "/watch/series" : undefined}>
              {series.map((s) => (
                <li key={s.slug}>
                  <SeriesPoster series={s} sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 37vw, 62vw" />
                </li>
              ))}
            </Shelf>
          )}

          {clips.length > 0 && (
            <Shelf id="clips-title" title="Clips" detail="A minute to watch and pass on" size="clip" href="/watch/clips">
              {clips.slice(0, ROW).map((clip) => (
                <li key={clip.slug}>
                  <ClipCard clip={clip} sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 29vw, 42vw" />
                </li>
              ))}
            </Shelf>
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

          {full.length > 0 && (
            // The address can point here directly: /watch?meeting=jericho-hour#all
            <section id="all" aria-labelledby="all-title" className="scroll-mt-24">
              <h2 id="all-title" className="text-headline text-ink">
                All messages
              </h2>
              <div className="mt-6 md:mt-8">
                <Suspense fallback={<MessageGrid messages={full.slice(0, 12)} />}>
                  <Library messages={full} meetings={meetings.map((m) => m.name)} />
                </Suspense>
              </div>
            </section>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
