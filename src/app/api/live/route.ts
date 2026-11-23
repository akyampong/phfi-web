import { connection } from "next/server";
import { getLiveState } from "@/lib/youtube";

/**
 * GET /api/live: whether the channel is live right now, for the banner to poll.
 * Backed by the same 30-second cache as the rest of the site, so polling costs no extra
 * YouTube quota however many visitors are on the site.
 */
export async function GET() {
  await connection();
  const state = await getLiveState();
  const body =
    state.status === "live"
      ? { live: true, title: state.broadcast.title }
      : { live: false };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
