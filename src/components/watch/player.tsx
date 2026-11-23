"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowUpRight, Play } from "lucide-react";
import type { ArtSpec } from "@/components/art/artwork";
import { Cover, type Photo } from "@/components/art/cover";
import { formatLength, formatTimestamp, type Chapter } from "@/lib/watch-types";

type PlayerState = {
  frameRef: React.RefObject<HTMLIFrameElement | null>;
  /** Whether the YouTube player has been started (until then, a poster stands in for it). */
  playing: boolean;
  /** Where it starts playing from, in seconds. */
  start: number;
  /** Roughly where it's up to, in whole seconds (for showing the current chapter). */
  time: number;
  play: (from?: number) => void;
  setTime: (seconds: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

/** Shares one player between the video and anything that controls it, such as its chapters. */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [start, setStart] = useState(0);
  const [time, setTime] = useState(0);

  const play = useCallback(
    (from?: number) => {
      const frame = frameRef.current;
      if (playing && frame?.contentWindow) {
        // Already playing: tell YouTube's player to jump there.
        if (from !== undefined) command(frame, "seekTo", [from, true]);
        command(frame, "playVideo");
      } else {
        setStart(from ?? 0);
        setPlaying(true);
      }
      if (from !== undefined) setTime(from);
    },
    [playing],
  );

  const value = useMemo(() => ({ frameRef, playing, start, time, play, setTime }), [playing, start, time, play]);
  return <PlayerContext value={value}>{children}</PlayerContext>;
}

function usePlayer() {
  const player = use(PlayerContext);
  if (!player) throw new Error("Wrap the player and its chapters in <PlayerProvider>.");
  return player;
}

type PlayerProps = {
  videoId?: string;
  title: string;
  image?: Photo;
  art: ArtSpec;
  seconds?: number;
  vertical?: boolean;
  embeddable?: boolean;
};

/**
 * A YouTube video that loads only when it's played: until then a poster (its thumbnail and a
 * play button) keeps the page light and quick. Upright videos (Shorts) get an upright frame.
 * Leaving the page stops it, and coming back has it ready where it was left.
 */
export function Player({ videoId, title, image, art, seconds, vertical = false, embeddable = true }: PlayerProps) {
  const { playing, play } = usePlayer();

  const frame = vertical
    ? "relative mx-auto aspect-[9/16] h-[min(78svh,48rem)] max-w-full overflow-hidden rounded-squircle-lg bg-black"
    : "relative aspect-video w-full overflow-hidden bg-black md:rounded-squircle-lg";

  // Sample messages have no video yet.
  if (!videoId) {
    return (
      <div className={frame}>
        <Cover photo={image} art={art} uid="player" sizes="(min-width: 1024px) 66vw, 100vw" preload />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/0 to-black/0 p-5 sm:p-8">
          <p className="text-sm font-medium text-white/90">The recording will be here soon.</p>
        </div>
      </div>
    );
  }

  if (!embeddable) {
    return (
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noreferrer"
        className={`group block ${frame}`}
      >
        <Cover photo={image} art={art} uid="player" sizes="(min-width: 1024px) 66vw, 100vw" preload />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 p-6 text-center text-white">
          <span className="text-lg font-semibold">Watch this one on YouTube</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-white/80 group-hover:text-white">
            It can only be played there <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </span>
      </a>
    );
  }

  return (
    <div className={frame}>
      {playing ? (
        <YouTubeFrame videoId={videoId} title={title} />
      ) : (
        <button
          type="button"
          onClick={() => play()}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          <Cover
            photo={image}
            art={art}
            uid="player"
            sizes="(min-width: 1024px) 66vw, 100vw"
            preload
            className="transition-transform duration-700 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/10" />
          {/* The same frosted play button as the home page's featured message */}
          <span aria-hidden className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-brightness-[0.8] transition-colors duration-300 group-hover:bg-white/20 sm:size-20">
              <Play className="ml-1 size-6 fill-current sm:size-7" />
            </span>
          </span>
          {seconds !== undefined && (
            <span
              aria-hidden
              className="absolute bottom-4 right-4 rounded-squircle-xs bg-black/50 px-2 py-0.5 text-xs font-semibold tabular-nums text-white backdrop-blur-md sm:bottom-6 sm:right-6"
            >
              {formatLength(seconds)}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * The YouTube player itself. Its address is set here rather than in the markup, so it can
 * be swapped for a blank page while the page is hidden: Next keeps pages you've left alive
 * (display: none) so Back is instant, and a hidden player would otherwise play on out of sight.
 */
function YouTubeFrame({ videoId, title }: { videoId: string; title: string }) {
  const { frameRef, start, setTime } = usePlayer();
  const timeRef = useRef(start);
  const resumeRef = useRef<number | undefined>(undefined);
  /** Whether YouTube has reported any progress yet. */
  const reportedRef = useRef(false);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    // First time: start playing straight away. Coming back to the page: wait where it was left.
    const resume = resumeRef.current;
    frame.src = embedUrl(videoId, resume ?? start, resume === undefined);
    const listen = () => frame.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: videoId, channel: "widget" }), "*");
    frame.addEventListener("load", listen);
    return () => {
      frame.removeEventListener("load", listen);
      // Only once it has really played: React also runs this straight after the first
      // load in development, and that mustn't count as leaving the page.
      if (reportedRef.current) resumeRef.current = Math.floor(timeRef.current);
      frame.src = "about:blank";
    };
  }, [frameRef, videoId, start]);

  // YouTube reports how far it's got, which shows the current chapter and sets the resume point.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com" || event.source !== frameRef.current?.contentWindow) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        const current = data?.info?.currentTime;
        if (typeof current === "number") {
          reportedRef.current = true;
          timeRef.current = current;
          setTime(Math.floor(current));
        }
      } catch {
        // Not one of the player's messages.
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [frameRef, setTime]);

  return (
    <iframe
      ref={frameRef}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      // YouTube refuses to play embeds that arrive without the page's address.
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 size-full"
    />
  );
}

/** The chapters from the video's description: tap one to jump there. The current one is marked. */
export function Chapters({ chapters }: { chapters: Chapter[] }) {
  const { play, playing, time } = usePlayer();
  const current = playing ? chapters.findLastIndex((c) => time >= c.seconds) : -1;

  return (
    <ol className="flex flex-col gap-1">
      {chapters.map((chapter, i) => (
        <li key={`${chapter.seconds}-${chapter.label}`}>
          <button
            type="button"
            onClick={() => {
              play(chapter.seconds);
              document.getElementById("player")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            aria-current={i === current ? "true" : undefined}
            className={`flex w-full cursor-pointer items-baseline gap-4 rounded-squircle-xs px-3 py-2.5 text-left transition-colors ${
              i === current ? "bg-ink/[0.06]" : "hover:bg-ink/[0.04]"
            }`}
          >
            <span className="w-14 shrink-0 text-sm font-semibold tabular-nums text-muted">{formatTimestamp(chapter.seconds)}</span>
            <span className={`text-[0.98rem] leading-snug ${i === current ? "font-semibold text-ink" : "text-body"}`}>
              {chapter.label}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function embedUrl(videoId: string, start: number, autoplay: boolean) {
  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    rel: "0",
    playsinline: "1",
    // Lets the page jump to chapters and know how far the video has got.
    enablejsapi: "1",
    origin: window.location.origin,
  });
  if (start > 0) params.set("start", String(Math.floor(start)));
  // The standard player, not youtube-nocookie: the privacy-mode player can't see a viewer's
  // YouTube sign-in, so YouTube often answers it with "confirm you're not a bot".
  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

function command(frame: HTMLIFrameElement, func: string, args: unknown[] = []) {
  frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "https://www.youtube.com");
}
