import { headers } from "next/headers";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight, Play } from "lucide-react";
import { Artwork } from "@/components/art/artwork";
import { buttonSecondary } from "@/components/ui/styles";
import { getLiveState, type Broadcast } from "@/lib/youtube";
import { LocalTime, NextMeeting, StartedAgo } from "./schedule";

/**
 * The top of the live page. Live: the YouTube player with the live chat beside it.
 * Scheduled: the player (YouTube shows its countdown) and the start time. Otherwise: the next meeting.
 * Render inside <Suspense>: the live check is fetched per request.
 */
export async function LiveStage() {
  await connection(); // Always checked at request time, never baked into the prerendered page.
  const state = await getLiveState();

  if (state.status === "offline") return <Offline />;

  // YouTube only shows its chat on the site named here, so it must match the page's own host.
  const host = (await headers()).get("host")?.split(":")[0] ?? "localhost";
  return <OnAir broadcast={state.broadcast} live={state.status === "live"} host={host} />;
}

function OnAir({ broadcast, live, host }: { broadcast: Broadcast; live: boolean; host: string }) {
  const { videoId, title } = broadcast;

  return (
    <section aria-labelledby="stream-title">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6">
        <div className="relative aspect-video overflow-hidden rounded-squircle-lg bg-ink">
          <iframe
            // The standard player, not youtube-nocookie: the privacy-mode player can't see a
            // viewer's YouTube sign-in, so YouTube often answers it with "confirm you're not a bot".
            src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            // YouTube refuses to play embeds that arrive without the page's address.
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        </div>

        {/* Live chat: beside the player on desktop (same height), below it on smaller screens */}
        <div className="relative h-[28rem] overflow-hidden rounded-squircle-md ring-1 ring-rule ring-inset lg:h-auto">
          <iframe
            src={`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${host}`}
            title="Live chat"
            className="absolute inset-0 size-full"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {live ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-live">
              <span aria-hidden className="animate-live size-2 rounded-full bg-live" />
              Live now
              {broadcast.startedAt && (
                <span className="text-muted">
                  · <StartedAgo at={broadcast.startedAt} />
                </span>
              )}
              {broadcast.viewers !== undefined && (
                <span className="text-muted">· {broadcast.viewers.toLocaleString()} watching</span>
              )}
            </p>
          ) : (
            <p className="text-sm font-medium text-muted">
              Starting soon
              {broadcast.scheduledFor && (
                <>
                  {" · "}
                  <LocalTime at={broadcast.scheduledFor} />
                </>
              )}
            </p>
          )}
          <h1 id="stream-title" className="mt-3 text-headline text-ink text-balance">
            {title}
          </h1>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className={`${buttonSecondary} shrink-0`}
        >
          Watch on YouTube
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
    </section>
  );
}

function Offline() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  return (
    <section
      aria-labelledby="offline-title"
      className="relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-squircle-lg bg-ink p-6 text-white sm:aspect-video sm:min-h-0 sm:p-10 lg:p-14"
    >
      <Artwork motif="rays" palette="ink" uid="offline" className="absolute inset-0 size-full opacity-40" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />

      <div className="relative max-w-2xl">
        <h1 id="offline-title" className="text-sm font-medium text-white/75">
          We’re not live right now · next up
        </h1>
        <div className="mt-4">
          <NextMeeting />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/watch"
            className="inline-flex h-12 items-center gap-2 rounded-squircle-xs bg-white px-6 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-white/90"
          >
            <Play aria-hidden className="size-4 fill-current" />
            Watch the latest recap
          </Link>
          {channelId && (
            <a
              href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-squircle-xs px-6 text-[0.95rem] font-semibold text-white ring-1 ring-white/40 ring-inset transition-colors hover:ring-white"
            >
              Get notified on YouTube
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/** Same footprint as the stage, shown while the live status loads. */
export function LiveStageSkeleton() {
  return <div aria-hidden className="min-h-[26rem] rounded-squircle-lg bg-ink sm:aspect-video sm:min-h-0" />;
}
