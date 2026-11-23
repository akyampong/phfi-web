import { connection } from "next/server";
import { getLiveState } from "@/lib/youtube";
import { LivePill } from "./live-pill";

/**
 * Server side of the "Live" tag beside the logo: reads the current state for the first paint,
 * then the tag keeps itself up to date. Render inside <Suspense fallback={null}>.
 */
export async function LiveIndicator() {
  await connection(); // Always checked at request time, never baked into the prerendered page.
  const state = await getLiveState();
  return <LivePill initial={state.status === "live" ? { live: true, title: state.broadcast.title } : { live: false }} />;
}
