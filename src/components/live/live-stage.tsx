import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { thisWeek } from "@/content/home";
import { getLiveState } from "@/lib/youtube";
import { LiveExperience } from "./live-experience";

/**
 * The live page's content. /live only exists while the channel is live: at any other time
 * (an old link, a bookmark) the visitor goes to the meeting calendar on the home page, so
 * there's no "we're not live" placeholder to see. A stream ending while someone watches is
 * handled on the page itself, without sending them away.
 * Render inside <Suspense>: the live check is fetched per request.
 */
export async function LiveStage() {
  await connection(); // Always checked at request time, never baked into the prerendered page.
  const state = await getLiveState();
  if (state.status !== "live") redirect("/#meeting-times");

  // YouTube only shows its chat on the site named here, so it must match the page's own host.
  const host = (await headers()).get("host")?.split(":")[0] ?? "localhost";
  const { videoId, title, viewers, startedAt } = state.broadcast;
  return <LiveExperience stream={{ videoId, title, viewers, startedAt }} host={host} week={thisWeek} />;
}

/** A dark space the size of the player while the live status loads. */
export function LiveStageSkeleton() {
  return (
    <div aria-hidden className="container-page pb-16 pt-4 lg:pt-6">
      <div className="h-7" />
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-5">
        <div className="aspect-video bg-white/[0.04] lg:rounded-squircle-lg" />
        <div className="hidden rounded-squircle-md bg-white/[0.04] lg:block" />
      </div>
    </div>
  );
}
