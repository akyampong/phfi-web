import Link from "next/link";
import { headers } from "next/headers";
import { connection } from "next/server";
import { Play } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { onImageButton, onImageGlassButton } from "@/components/ui/styles";
import { thisWeek } from "@/content/home";
import { getCatalogue } from "@/lib/watch";
import { getLiveState } from "@/lib/youtube";
import { LiveExperience } from "./live-experience";
import { NextMeeting } from "./next-meeting";

/**
 * The live page's content: the stream while the channel is live; the rest of the time (an old
 * link, a bookmark, arriving late) a "stream has ended" screen with when the next meeting goes
 * live and the latest recording. A stream ending while someone watches is handled on the page
 * itself.
 * Render inside <Suspense>: the live check is fetched per request.
 */
export async function LiveStage() {
  await connection(); // Always checked at request time, never baked into the prerendered page.
  const state = await getLiveState();
  if (state.status !== "live") return <LiveOffline />;

  // YouTube only shows its chat on the site named here, so it must match the page's own host.
  const host = (await headers()).get("host")?.split(":")[0] ?? "localhost";
  const { videoId, title, viewers, startedAt } = state.broadcast;
  return <LiveExperience stream={{ videoId, title, viewers, startedAt }} host={host} week={thisWeek} />;
}

/**
 * /live when nothing is streaming: the player's dark frame, softly showing the latest message,
 * with "The stream has ended", when the next meeting goes live, and the way to the latest
 * recording.
 */
async function LiveOffline() {
  const { messages } = await getCatalogue();
  const latest = messages.find((m) => m.kind === "message");

  return (
    <section aria-labelledby="offline-title" className="container-page pb-16 pt-4 lg:pb-24 lg:pt-6">
      <div className="relative flex h-[clamp(30rem,calc(100svh-9rem),48rem)] overflow-hidden rounded-squircle-lg bg-night">
        {latest && (
          <Cover
            photo={latest.image}
            art={latest.art}
            uid="offline"
            sizes="100vw"
            className="scale-110 object-cover opacity-35 blur-2xl"
          />
        )}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/60 to-night/90" />

        <div className="relative m-auto flex max-w-[38rem] flex-col items-center px-6 py-12 text-center">
          <h1 id="offline-title" className="text-page-sm text-white">
            The stream has ended
          </h1>
          <p className="mt-4 max-w-[40ch] text-[1.0625rem] leading-relaxed text-white/75">
            Thank you for joining us. Recordings of our meetings are on Watch, to catch up any time.
          </p>
          <NextMeeting className="mt-6 text-[0.95rem] font-medium text-white" />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {latest && (
              <Link href={`/watch/${latest.slug}`} className={onImageButton}>
                <Play aria-hidden className="size-4 fill-current" />
                Watch the latest message
              </Link>
            )}
            <Link href="/watch" className={onImageGlassButton}>
              All messages
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A faint space the size of the player while the live status loads. */
export function LiveStageSkeleton() {
  return (
    <div aria-hidden className="container-page pb-16 pt-4 lg:pt-6">
      <div className="h-7" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-5">
        <div className="aspect-video bg-ink/[0.05] lg:rounded-squircle-lg" />
        <div className="hidden rounded-squircle-md bg-ink/[0.05] lg:block" />
      </div>
    </div>
  );
}
