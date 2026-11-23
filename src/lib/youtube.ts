import "server-only";
import { cacheLife } from "next/cache";

/**
 * Live status of the PHFI YouTube channel, from the YouTube Data API v3.
 *
 * How it works (about 2 quota units per check, out of 10,000 free per day):
 *   1. List the channel's newest uploads. Live and scheduled streams appear there.
 *   2. Look those videos up to see which, if any, is live or about to go live.
 * The result is cached for 30 seconds and shared by every visitor, so traffic
 * does not add to the quota: at most ~2,900 checks (~5,800 units) a day.
 *
 * Settings (see .env.example): YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY, and
 * LIVE_PREVIEW_VIDEO_ID to fake a live stream in development.
 */

export type Broadcast = {
  videoId: string;
  title: string;
  /** When the stream went live (ISO time), if it has started. */
  startedAt?: string;
  /** When a scheduled stream is due to start (ISO time). */
  scheduledFor?: string;
  /** People watching right now, when YouTube reports it. */
  viewers?: number;
};

export type LiveState =
  | { status: "live"; broadcast: Broadcast }
  | { status: "upcoming"; broadcast: Broadcast }
  | { status: "offline" };

const api = "https://www.googleapis.com/youtube/v3";

export async function getLiveState(): Promise<LiveState> {
  const preview = process.env.NODE_ENV !== "production" ? process.env.LIVE_PREVIEW_VIDEO_ID : undefined;
  // The channel and preview video are passed in, so they are part of the cache key:
  // changing either takes effect straight away instead of after the cached answer expires.
  return checkChannel(process.env.YOUTUBE_CHANNEL_ID ?? "", preview ?? "");
}

async function checkChannel(channelId: string, preview: string): Promise<LiveState> {
  "use cache";
  // YouTube is asked at most about every 30 seconds, however many visitors are checking
  // (about 5,800 of the API's 10,000 daily units at worst). `expire` only just past
  // `revalidate` means an answer older than that is never handed out while a fresh one is
  // fetched: the next request waits for the fresh one instead, so the site learns a stream
  // has started within about 30 seconds.
  cacheLife({ stale: 30, revalidate: 30, expire: 31 });

  if (preview) {
    return {
      status: "live",
      broadcast: { videoId: preview, title: "Preview stream", startedAt: new Date(Date.now() - 18 * 60_000).toISOString() },
    };
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!channelId || !key) {
    console.warn("[live] YOUTUBE_CHANNEL_ID or YOUTUBE_API_KEY is not set, so the site always shows offline.");
    return { status: "offline" };
  }

  try {
    // 1. The channel's uploads playlist is the channel ID with "UC" swapped for "UU".
    //    A channel that has never uploaded has no such playlist yet: YouTube answers 404.
    const uploads = await youtube<{ items?: { contentDetails: { videoId: string } }[] }>("playlistItems", {
      part: "contentDetails",
      playlistId: `UU${channelId.slice(2)}`,
      maxResults: "10",
      key,
    }).catch((error: unknown) => {
      if (error instanceof YouTubeError && error.status === 404) return { items: [] };
      throw error;
    });
    const ids = uploads.items?.map((item) => item.contentDetails.videoId) ?? [];
    if (ids.length === 0) return { status: "offline" };

    // 2. Which of them is live, or scheduled?
    const videos = await youtube<{ items?: Video[] }>("videos", {
      part: "snippet,liveStreamingDetails",
      id: ids.join(","),
      key,
    });
    const items = videos.items ?? [];

    const live = items.find((v) => v.snippet.liveBroadcastContent === "live");
    if (live) return { status: "live", broadcast: toBroadcast(live) };

    const next = items
      .filter((v) => v.snippet.liveBroadcastContent === "upcoming" && v.liveStreamingDetails?.scheduledStartTime)
      .sort((a, b) => a.liveStreamingDetails!.scheduledStartTime!.localeCompare(b.liveStreamingDetails!.scheduledStartTime!))[0];
    if (next) return { status: "upcoming", broadcast: toBroadcast(next) };

    return { status: "offline" };
  } catch (error) {
    console.error("[live] Could not check the YouTube channel:", error);
    return { status: "offline" };
  }
}

/** True while the channel is streaming. */
export async function isLiveNow(): Promise<boolean> {
  return (await getLiveState()).status === "live";
}

type Video = {
  id: string;
  snippet: { title: string; liveBroadcastContent: "live" | "upcoming" | "none" };
  liveStreamingDetails?: {
    actualStartTime?: string;
    scheduledStartTime?: string;
    concurrentViewers?: string;
  };
};

function toBroadcast(video: Video): Broadcast {
  const details = video.liveStreamingDetails;
  return {
    videoId: video.id,
    title: video.snippet.title,
    startedAt: details?.actualStartTime,
    scheduledFor: details?.scheduledStartTime,
    viewers: details?.concurrentViewers ? Number(details.concurrentViewers) : undefined,
  };
}

class YouTubeError extends Error {
  constructor(
    endpoint: string,
    readonly status: number,
    body: string,
  ) {
    // The error body explains quota or key problems; it never contains the key itself.
    super(`${endpoint} ${status}: ${body.slice(0, 300)}`);
  }
}

async function youtube<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const response = await fetch(`${api}/${endpoint}?${new URLSearchParams(params)}`, { cache: "no-store" });
  if (!response.ok) throw new YouTubeError(endpoint, response.status, await response.text());
  return response.json() as Promise<T>;
}
