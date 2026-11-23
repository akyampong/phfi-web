import { connection } from "next/server";
import { getLiveState } from "@/lib/youtube";

/**
 * GET /api/live: whether the channel is live right now, polled by every open page (the Live
 * tag, the live buttons, and the live page's viewer count and stream-ended screen).
 * Backed by the same 30-second cache as the rest of the site, so polling costs no extra
 * YouTube quota however many visitors are on the site.
 */
export async function GET() {
  await connection();
  const state = await getLiveState();
  const body =
    state.status === "live"
      ? {
          live: true,
          title: state.broadcast.title,
          videoId: state.broadcast.videoId,
          viewers: state.broadcast.viewers,
          startedAt: state.broadcast.startedAt,
        }
      : { live: false };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
