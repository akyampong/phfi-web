import type { ArtSpec } from "@/components/art/artwork";
import type { Photo } from "@/components/art/cover";
import type { PosterMotif } from "@/content/watch";
import type { Scripture } from "@/lib/bible";

/** A moment in a message, from the timestamps in its YouTube description ("12:30 The sermon"). */
export type Chapter = { seconds: number; label: string };

/** One recorded message or clip on the Watch pages. */
export type Message = {
  /** Its address: /watch/{slug}. */
  slug: string;
  /** The YouTube video. Sample messages have none, so they show their artwork instead of a player. */
  videoId?: string;
  /** Clips are short highlights, listed on /watch/clips rather than with the full messages. */
  kind: "message" | "clip";
  title: string;
  /** When it was recorded (or published), as an ISO date in the meetings' time zone. */
  date: string;
  /** Length in seconds, when known. */
  seconds?: number;
  /** The meeting it's from, by name (see meetingSchedule). */
  meeting?: string;
  scripture?: Scripture;
  speaker?: string;
  /** The series it's part of, and which part. */
  series?: { slug: string; title: string; part: number; of: number };
  /** One or two sentences, for cards and search results. */
  summary: string;
  /** The full description, as paragraphs of plain text (links are found when it's shown). */
  description: string[];
  chapters: Chapter[];
  /** The thumbnail, or a photo for sample messages. */
  image?: Photo;
  /** Shown when there's no image. */
  art: ArtSpec;
  /** Taller than wide (a YouTube Short, say): played in an upright frame. */
  vertical: boolean;
  /** False when the video's owner doesn't allow it to play on other sites. */
  embeddable: boolean;
};

export type Series = {
  slug: string;
  title: string;
  /** A sentence or two about it. */
  description: string;
  /** The poster: a dark colour with a large tone-on-tone shape (see content/watch.ts)… */
  colour: string;
  motif: PosterMotif;
  /** …or the series' own artwork, when it has some. */
  photo?: Photo;
  /** Its messages' slugs, part 1 first. */
  messages: string[];
  /** The newest part's date, for ordering the series list. */
  latest: string;
};

/** Everything the Watch pages show, newest first. */
export type Catalogue = {
  messages: Message[];
  series: Series[];
  /** "youtube" when it's the channel's videos; "sample" while no channel is connected. */
  source: "youtube" | "sample";
};

/** "52 min", "1 hr 34 min", or "0:45" for anything under a minute and a half. */
export function formatLength(seconds?: number): string {
  if (seconds === undefined) return "";
  if (seconds < 90) return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${minutes % 60 ? ` ${minutes % 60} min` : ""}`;
}

/** "1:02:03" or "12:03", for chapter times. */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** "Tuesday Fellowship" → "tuesday-fellowship": a meeting in the address (/watch?meeting=…). */
export function meetingParam(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
