"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { CalendarClock, Radio } from "lucide-react";
import { StartedAgo, describeOccurrence, useNow } from "@/components/live/schedule";
import { onImageButton } from "@/components/ui/styles";
import { meetingSchedule } from "@/config/site";
import { useLiveStatus } from "@/lib/live-status";
import { upcomingMeetings } from "@/lib/schedule";
import { useUnloadWhenHidden } from "@/lib/use-unload-when-hidden";

/** The frame both heroes share: the reading column's width, nearly a screen tall. */
export const heroFrame =
  "relative flex h-[clamp(32rem,calc(100svh-9rem),52rem)] w-full flex-col overflow-hidden rounded-squircle-lg bg-night";

/**
 * The top of /watch. While a meeting is streaming, the stream itself, playing silently as a
 * preview, with a way in to join; the rest of the time `children` (the latest message).
 */
export function WatchHero({ children }: { children: ReactNode }) {
  const status = useLiveStatus();
  if (status.live && status.videoId) {
    return <LiveHero videoId={status.videoId} title={status.title} viewers={status.viewers} startedAt={status.startedAt} />;
  }
  return children;
}

function LiveHero({ videoId, title, viewers, startedAt }: { videoId: string; title?: string; viewers?: number; startedAt?: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [shown, setShown] = useState(false);
  // Muted, without controls and not clickable: just a window onto the stream. The page is
  // unloaded while hidden (see useUnloadWhenHidden), so it doesn't keep streaming behind /live.
  const src = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    rel: "0",
    disablekb: "1",
    iv_load_policy: "3",
    fs: "0",
  })}`;
  useUnloadWhenHidden(frameRef);

  return (
    <Link href="/live" aria-label={`Join us live${title ? `: ${title}` : ""}`} className={`group ${heroFrame}`}>
      {/* YouTube’s still of the stream (the 16:9 one: the larger ones have black bars), until the preview plays */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a live still that changes; not worth resizing */}
      <img src={`https://i.ytimg.com/vi/${videoId}/mqdefault_live.jpg`} alt="" className="absolute inset-0 size-full object-cover" />
      {/* Sized to cover the frame whatever its shape (like object-fit: cover), then enlarged a
          little more so YouTube’s own title bar and logo, near its edges, fall outside the frame */}
      <div aria-hidden className="pointer-events-none absolute inset-0 [container-type:size]">
        <iframe
          ref={frameRef}
          data-src={src}
          src={src}
          title="Live preview"
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setTimeout(() => setShown(true), 1200)}
          className={`absolute left-1/2 top-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 scale-[1.25] transition-opacity duration-1000 ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
      <span aria-hidden className="absolute inset-0 bg-black/10" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/75 via-black/30 to-black/0" />

      <span className="absolute left-6 top-6 flex items-center gap-3 sm:left-10 sm:top-10 lg:left-14 lg:top-12">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-squircle-xs bg-live px-3 text-xs font-bold uppercase tracking-[0.06em] text-white">
          <Radio aria-hidden className="animate-live size-4" strokeWidth={2.25} />
          Live
        </span>
        {viewers !== undefined && (
          <span className="rounded-squircle-xs bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            {viewers.toLocaleString()} watching
          </span>
        )}
      </span>

      <span className="relative mt-auto block px-6 pb-8 text-white sm:px-10 sm:pb-10 lg:px-14 lg:pb-14">
        <span className="block text-sm font-medium text-white/80">
          We’re live now{startedAt && <> · <StartedAgo at={startedAt} /></>}
        </span>
        <span className="mt-3 block max-w-[20ch] text-[clamp(2.25rem,1.35rem+2.8vw,4.5rem)] font-normal leading-[1.02] tracking-[-0.035em] text-balance">
          {title || "Join us live"}
        </span>
        <span className="mt-8 flex flex-wrap items-center gap-3">
          <span className={onImageButton}>
            <Radio aria-hidden className="animate-live size-[1.1rem] text-live" strokeWidth={2.25} />
            Join us live
          </span>
          <span className="text-sm text-white/75">Chat and pray along with everyone watching</span>
        </span>
      </span>
    </Link>
  );
}

/**
 * When the next meeting goes live, in the visitor's own time zone: "Next live · Tuesday 24
 * November at 7:00 PM". Filled in by the browser (it knows the visitor's zone).
 */
export function NextLive({ className = "" }: { className?: string }) {
  const now = useNow();
  const next = now ? upcomingMeetings(meetingSchedule, now)[0] : undefined;
  if (!next) return null;
  return (
    <span
      className={`live-appear inline-flex items-center gap-2 rounded-squircle-xs bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md ${className}`}
    >
      <CalendarClock aria-hidden className="size-3.5" />
      <span>
        Next live: {next.meeting.name}, {describeOccurrence(next)}
      </span>
    </span>
  );
}
