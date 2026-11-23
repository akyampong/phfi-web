import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ArtSpec, Motif, Palette } from "@/components/art/artwork";
import { meetingSchedule, meetingTimeZoneId } from "@/config/site";
import { sampleMessages, seriesDetails, videoDetails, type PosterMotif, type SeriesDetails } from "@/content/watch";
import { findScripture } from "@/lib/bible";
import { occurrencesBetween, wallDate } from "@/lib/schedule";
import type { Catalogue, Chapter, Message, Series } from "@/lib/watch-types";

/**
 * The Watch catalogue: every public video on the PHFI YouTube channel, newest first, with
 * the details from content/watch.ts merged in, grouped into series.
 *
 * Costs about 2 YouTube quota units per 50 videos, plus 1 per series playlist. It's fetched
 * at most every 15 minutes and shared by every visitor, so a new recording appears within
 * about a quarter of an hour; with the live check that stays well inside the free 10,000
 * units a day. `revalidateTag("watch")` refreshes it straight away.
 *
 * While no channel is set up, or it has no videos yet, the sample messages are shown instead.
 */
export async function getCatalogue(): Promise<Catalogue> {
  // Development only: show the full sample library even with a channel connected, to see
  // the pages with plenty in them.
  const samples = process.env.NODE_ENV !== "production" && process.env.WATCH_PREVIEW_SAMPLES === "1";
  return loadCatalogue(samples ? "" : (process.env.YOUTUBE_CHANNEL_ID ?? ""));
}

export async function getMessage(slug: string): Promise<Message | undefined> {
  const { messages } = await getCatalogue();
  return messages.find((m) => m.slug === slug);
}

/** A message by its YouTube video ID, so /watch/{videoId} can point to its proper address. */
export async function getMessageByVideoId(videoId: string): Promise<Message | undefined> {
  const { messages } = await getCatalogue();
  return messages.find((m) => m.videoId === videoId);
}

export async function getSeries(slug: string): Promise<Series | undefined> {
  const { series } = await getCatalogue();
  return series.find((s) => s.slug === slug);
}

/** Addresses under /watch that belong to other pages, so no message may use them. */
const RESERVED_SLUGS = new Set(["series", "clips"]);
/** At most this many of the newest videos are listed (4 pages of 50). */
const MAX_VIDEOS = 200;

/** The last catalogue fetched successfully, kept in case YouTube can't be reached on a refresh. */
let lastGood: Catalogue | undefined;

async function loadCatalogue(channelId: string): Promise<Catalogue> {
  "use cache";
  cacheTag("watch");

  const key = process.env.YOUTUBE_API_KEY;
  if (!channelId || !key) {
    cacheLife("hours");
    return sampleCatalogue();
  }

  try {
    const videos = await fetchUploads(channelId, key);
    const playlists = new Map<string, string[]>();
    for (const series of seriesDetails) {
      if (series.playlistId) playlists.set(series.slug, await fetchPlaylist(series.playlistId, key));
    }
    const catalogue = buildCatalogue(videos, playlists);
    cacheLife({ stale: 300, revalidate: 900, expire: 86_400 });
    if (catalogue.messages.length === 0) return sampleCatalogue();
    lastGood = catalogue;
    return catalogue;
  } catch (error) {
    console.error("[watch] Could not load the YouTube channel's videos:", error);
    // Try again in a minute; meanwhile show what we had, or an empty library.
    cacheLife({ stale: 60, revalidate: 60, expire: 300 });
    return lastGood ?? { messages: [], series: [], source: "youtube" };
  }
}

// ——— YouTube ———

type Video = {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    liveBroadcastContent: "live" | "upcoming" | "none";
    thumbnails: Partial<Record<"maxres" | "standard" | "high" | "medium", { url: string; width: number; height: number }>>;
  };
  contentDetails: { duration: string };
  liveStreamingDetails?: { actualStartTime?: string };
  status: { privacyStatus: string; embeddable: boolean };
  player?: { embedWidth?: string; embedHeight?: string };
};

const api = "https://www.googleapis.com/youtube/v3";

async function youtube<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const response = await fetch(`${api}/${endpoint}?${new URLSearchParams(params)}`, { cache: "no-store" });
  // The error body explains quota or key problems; it never contains the key itself.
  if (!response.ok) throw new Error(`${endpoint} ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<T>;
}

type PlaylistPage = { items?: { contentDetails: { videoId: string } }[]; nextPageToken?: string };

/** Video IDs in a playlist, in its order. A playlist that doesn't exist (yet) is empty. */
async function fetchPlaylist(playlistId: string, key: string, limit = 50): Promise<string[]> {
  const ids: string[] = [];
  let pageToken: string | undefined;
  do {
    const page = await youtube<PlaylistPage>("playlistItems", {
      part: "contentDetails",
      playlistId,
      maxResults: "50",
      key,
      ...(pageToken ? { pageToken } : {}),
    }).catch((error: unknown) => {
      // A channel that has never uploaded has no uploads playlist yet: YouTube answers 404.
      if (error instanceof Error && error.message.includes(" 404:")) return { items: [] } as PlaylistPage;
      throw error;
    });
    ids.push(...(page.items ?? []).map((item) => item.contentDetails.videoId));
    pageToken = page.nextPageToken;
  } while (pageToken && ids.length < limit);
  return ids.slice(0, limit);
}

/** The channel's newest uploads, with everything needed to list and play them. */
async function fetchUploads(channelId: string, key: string): Promise<Video[]> {
  // The uploads playlist is the channel ID with "UC" swapped for "UU".
  const ids = await fetchPlaylist(`UU${channelId.slice(2)}`, key, MAX_VIDEOS);
  const videos: Video[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = await youtube<{ items?: Video[] }>("videos", {
      part: "snippet,contentDetails,liveStreamingDetails,status,player",
      id: ids.slice(i, i + 50).join(","),
      // Asking for a player size makes YouTube report each video's shape, so upright Shorts can be told apart.
      maxHeight: "720",
      key,
    });
    videos.push(...(batch.items ?? []));
  }
  return videos;
}

// ——— Building the catalogue ———

function buildCatalogue(videos: Video[], playlists: Map<string, string[]>): Catalogue {
  const usable = videos.filter(
    (v) =>
      // Not live or scheduled (the live page has those), public, and not hidden in content/watch.ts
      v.snippet.liveBroadcastContent === "none" && v.status.privacyStatus === "public" && !videoDetails[v.id]?.hidden,
  );

  const playlistSeries = new Map<string, string>();
  for (const [slug, ids] of playlists) for (const id of ids) if (!playlistSeries.has(id)) playlistSeries.set(id, slug);

  const adHocSeries = new Map<string, SeriesDetails>();
  const messages = usable.map((video) => toMessage(video, playlistSeries, adHocSeries));
  assignSlugs(messages);
  return { messages: sortNewestFirst(messages), series: buildSeries(messages, playlists, adHocSeries), source: "youtube" };
}

const TAG = /^(scripture|passage|series|speaker|preacher|meeting)\s*[:：]\s*(.+)$/i;
const TIMESTAMP = /^[([]?((?:\d{1,2}:)?\d{1,2}:\d{2})[)\]]?\s*[-–—:|.]?\s+(.+)$/;

function toMessage(video: Video, playlistSeries: Map<string, string>, adHocSeries: Map<string, SeriesDetails>): Message {
  const details = videoDetails[video.id] ?? {};
  const { title: youtubeTitle, description: raw } = video.snippet;
  const title = details.title ?? cleanTitle(youtubeTitle);

  // Read the "Scripture:" style lines and the chapter timestamps out of the description.
  const tags: Record<string, string> = {};
  const chapters: Chapter[] = [];
  const kept: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    const tag = TAG.exec(trimmed);
    const stamp = TIMESTAMP.exec(trimmed);
    if (tag) tags[normaliseTag(tag[1])] = tag[2].trim();
    else if (stamp) chapters.push({ seconds: toSeconds(stamp[1]), label: stamp[2].trim() });
    else if (/^(#[\p{L}\d_]+\s*)+$/u.test(trimmed)) continue; // a line of hashtags only
    else kept.push(trimmed);
  }
  // YouTube's own rule: chapters start at 0:00. Otherwise they're just times mentioned in passing.
  const hasChapters = chapters.length >= 2 && chapters[0].seconds === 0;
  if (!hasChapters) kept.push(...chapters.map((c) => c.label));
  const description = kept
    .join("\n")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const seconds = parseDuration(video.contentDetails.duration);
  const width = Number(video.player?.embedWidth);
  const height = Number(video.player?.embedHeight);
  const vertical = height > 0 && width > 0 && height > width;
  const shortTag = /#shorts?\b/i.test(`${youtubeTitle} ${raw}`);
  const recordedAt = video.liveStreamingDetails?.actualStartTime;

  const seriesName = details.series ?? tags.series;
  const series = seriesName ? findOrAddSeries(seriesName, adHocSeries) : playlistSeries.get(video.id);

  const thumb = video.snippet.thumbnails;
  const image = thumb.maxres ?? thumb.standard ?? thumb.high ?? thumb.medium;

  return {
    slug: "", // set once every message is known, so duplicates can be told apart
    videoId: video.id,
    kind: details.kind ?? (vertical || shortTag || seconds <= 60 ? "clip" : "message"),
    title,
    date: meetingDate(new Date(recordedAt ?? video.snippet.publishedAt)),
    seconds: seconds || undefined,
    meeting: details.meeting ?? matchMeeting(tags.meeting ?? youtubeTitle) ?? (recordedAt ? inferMeeting(new Date(recordedAt)) : undefined),
    scripture: findScripture(details.scripture ?? tags.scripture ?? youtubeTitle),
    speaker: details.speaker ?? tags.speaker,
    // Filled in with the part numbers once the series are put together.
    series: series ? { slug: series, title: "", part: details.part ?? 0, of: 0 } : undefined,
    summary: details.summary ?? summarise(description[0] ?? ""),
    description,
    chapters: hasChapters ? chapters : [],
    image: image ? { src: image.url, alt: "" } : undefined,
    art: artFor(video.id),
    vertical,
    embeddable: video.status.embeddable,
  };
}

function normaliseTag(name: string) {
  const lower = name.toLowerCase();
  return lower === "passage" ? "scripture" : lower === "preacher" ? "speaker" : lower;
}

/** Drops hashtags and trailing "| PHFI"-style labels from a YouTube title. */
function cleanTitle(title: string) {
  return title
    .replace(/#[\p{L}\d_]+/gu, "")
    .replace(/\s*[|–—-]\s*(PHFI|Purpose House.*)$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** The first sentence or two, cut at a word near 200 characters. */
function summarise(text: string) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= 200) return flat;
  const sentences = flat.match(/[^.!?]+[.!?]+/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).length > 200) break;
    out += sentence;
  }
  return out.trim() || `${flat.slice(0, 200).replace(/\s+\S*$/, "")}…`;
}

/** "PT1H34M12S" → 5652. */
function parseDuration(iso: string) {
  const match = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!match) return 0;
  const [, d, h, m, s] = match.map((n) => Number(n ?? 0));
  return ((d * 24 + h) * 60 + m) * 60 + s;
}

/** "1:02:03" → 3723. */
function toSeconds(stamp: string) {
  return stamp.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

/** The ISO date in the meetings' time zone, so an evening meeting keeps its own day. */
function meetingDate(instant: Date) {
  const { year, month, day } = wallDate(instant, meetingTimeZoneId);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** A meeting named in some text ("Tuesday Fellowship | Faith That Waits"). */
function matchMeeting(text: string) {
  const lower = text.toLowerCase();
  return meetingSchedule.find((m) => lower.includes(m.name.toLowerCase()))?.name;
}

/**
 * The meeting a stream belongs to, from when it went live: from two hours before a meeting's
 * start until an hour after it should finish. A meeting without a set time counts for its
 * whole day and the early hours after it (Jericho Hour runs into Thursday).
 */
function inferMeeting(start: Date) {
  const found = occurrencesBetween(meetingSchedule, new Date(start.getTime() - 36 * 3_600_000), new Date(start.getTime() + 2 * 3_600_000));
  const t = start.getTime();
  const match = found.findLast((o) => {
    if (!o.timed) {
      const from = o.start.getTime();
      return t >= from && t < from + 30 * 3_600_000;
    }
    const from = o.start.getTime();
    return t >= from - 2 * 3_600_000 && t <= from + (o.meeting.durationMinutes + 60) * 60_000;
  });
  return match?.meeting.name;
}

function findOrAddSeries(name: string, adHoc: Map<string, SeriesDetails>) {
  const wanted = slugify(name);
  const known = seriesDetails.find((s) => s.slug === wanted || slugify(s.title) === wanted);
  if (known) return known.slug;
  // A series named only in YouTube descriptions gets a page too.
  if (!adHoc.has(wanted)) adHoc.set(wanted, { slug: wanted, title: name.trim(), description: "", ...posterFor(wanted) });
  return wanted;
}

/**
 * Gives each message its address, made from its title. When two share a title, the older
 * keeps the plain address (so links already shared still work) and newer ones add their date.
 */
function assignSlugs(messages: Message[]) {
  const taken = new Set(RESERVED_SLUGS);
  const oldestFirst = [...messages].sort((a, b) => a.date.localeCompare(b.date));
  for (const message of oldestFirst) {
    const details = message.videoId ? videoDetails[message.videoId] : undefined;
    const base = details?.slug ?? (slugify(message.title) || "message");
    let slug = base;
    if (taken.has(slug)) slug = `${base}-${message.date}`;
    if (taken.has(slug)) slug = `${base}-${message.videoId?.toLowerCase() ?? taken.size}`;
    taken.add(slug);
    message.slug = slug;
  }
}

function buildSeries(messages: Message[], playlists: Map<string, string[]>, adHoc: Map<string, SeriesDetails>): Series[] {
  const all = [...seriesDetails, ...adHoc.values()];
  const result: Series[] = [];
  for (const details of all) {
    const order = playlists.get(details.slug);
    const parts = messages
      .filter((m) => m.kind === "message" && m.series?.slug === details.slug)
      .sort((a, b) => {
        // A part number given in content/watch.ts first, then the playlist's order, then the date.
        const [partA, partB] = [a.series!.part, b.series!.part];
        if (partA && partB && partA !== partB) return partA - partB;
        if (order) return order.indexOf(a.videoId ?? "") - order.indexOf(b.videoId ?? "");
        return a.date.localeCompare(b.date);
      });
    if (parts.length === 0) continue;
    parts.forEach((m, i) => (m.series = { slug: details.slug, title: details.title, part: i + 1, of: parts.length }));
    result.push({
      slug: details.slug,
      title: details.title,
      description: details.description,
      colour: details.colour,
      motif: details.motif,
      photo: details.photo,
      messages: parts.map((m) => m.slug),
      latest: parts.reduce((latest, m) => (m.date > latest ? m.date : latest), parts[0].date),
    });
  }
  // Messages in a series that turned out to have no parts (all clips, say) lose the link.
  for (const m of messages) if (m.series && !m.series.title) m.series = undefined;
  return result.sort((a, b) => b.latest.localeCompare(a.latest));
}

function sortNewestFirst(messages: Message[]) {
  return messages.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const MOTIFS: Motif[] = ["sunset", "orbits", "moon", "arch", "rays", "rings", "waves"];
const PALETTES: Palette[] = ["ember", "blush", "dusk", "forest", "sand", "ink"];

function hash(seed: string) {
  let value = 0;
  for (const char of seed) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

/** Artwork that's always the same for the same video. */
function artFor(seed: string): ArtSpec {
  const value = hash(seed);
  return { motif: MOTIFS[value % MOTIFS.length], palette: PALETTES[Math.floor(value / MOTIFS.length) % PALETTES.length] };
}

/** Dark poster colours (white text reads on each) for series named only on YouTube. */
const POSTER_COLOURS = ["#1e6447", "#8a4b12", "#5b2150", "#18505e", "#7a1f2b", "#3b3a75"];
const POSTER_MOTIFS: PosterMotif[] = ["rings", "rays", "orbits", "sunset", "moon"];

function posterFor(seed: string): { colour: string; motif: PosterMotif } {
  const value = hash(seed);
  return { colour: POSTER_COLOURS[value % POSTER_COLOURS.length], motif: POSTER_MOTIFS[Math.floor(value / 7) % POSTER_MOTIFS.length] };
}

// ——— Samples ———

function sampleCatalogue(): Catalogue {
  const messages: Message[] = sampleMessages.map((s) => ({
    slug: s.slug,
    kind: s.kind,
    title: s.title,
    date: s.date,
    seconds: s.seconds,
    meeting: s.meeting,
    scripture: s.scripture ? findScripture(s.scripture) : undefined,
    series: s.series ? { slug: s.series, title: "", part: 0, of: 0 } : undefined,
    summary: s.summary,
    description: [s.summary],
    chapters: (s.chapters ?? []).map(([at, label]) => ({ seconds: toSeconds(at), label })),
    image: s.photo,
    art: s.art,
    vertical: s.kind === "clip",
    embeddable: true,
  }));
  return { messages: sortNewestFirst(messages), series: buildSeries(messages, new Map(), new Map()), source: "sample" };
}
