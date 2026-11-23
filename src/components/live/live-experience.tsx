"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, HandHeart, Heart, PanelRightClose, PanelRightOpen, Radio } from "lucide-react";
import { ShareIcon } from "@/components/home/verse-actions";
import { StartedAgo, useNow } from "@/components/live/schedule";
import { meetingSchedule, meetingTimeZoneId, type Meeting } from "@/config/site";
import type { ThisWeek } from "@/content/home";
import { TRANSLATION, bibleComUrl } from "@/lib/bible";
import { refreshLiveStatus, useLiveStatus } from "@/lib/live-status";
import { occurrencesBetween, wallDate } from "@/lib/schedule";

type Stream = { videoId: string; title: string; viewers?: number; startedAt?: string };

/**
 * The live page while a stream is on: a dark theatre with the player, and beside it (below on
 * phones, where the player stays pinned at the top) a panel to chat or pray along with this
 * week's verse and prayer points. Above: a live status bar (the meeting, people watching, how
 * long it's been on) and quick actions (share, prayer request, give, YouTube, theatre mode).
 *
 * It keeps itself current from the page's shared live check: the watching count updates, and
 * if the stream ends while someone is here they see a calm "stream has ended" screen rather
 * than being sent away.
 */
export function LiveExperience({ stream, host, week }: { stream: Stream; host: string; week: ThisWeek }) {
  const status = useLiveStatus({ live: true, ...stream });
  const now = useNow();
  const [theatre, setTheatre] = useState(false);
  const [tab, setTab] = useState<"chat" | "pray">("chat");
  // Only trust "not live" once this page has asked for itself (not from an earlier page).
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void refreshLiveStatus().finally(() => setChecked(true));
  }, []);

  const ended = checked && !status.live;
  const viewers = status.live ? (status.viewers ?? stream.viewers) : undefined;
  const meeting = now ? currentMeeting(now) : undefined;
  const title = (status.live && status.title) || stream.title;

  return (
    <section aria-labelledby="stream-title" className="container-page pb-16 pt-4 lg:pb-24 lg:pt-6">
      {/* Status bar: what's on and how many are here, with the quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div aria-live="polite" className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {ended ? (
            <span className="inline-flex h-7 items-center rounded-squircle-xs bg-white/15 px-2.5 text-xs font-bold uppercase tracking-[0.06em]">
              Ended
            </span>
          ) : (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-squircle-xs bg-live px-2.5 text-xs font-bold uppercase tracking-[0.06em]">
              <Radio aria-hidden className="animate-live size-3.5" strokeWidth={2.25} />
              Live
            </span>
          )}
          {meeting && <span className="font-semibold">{meeting.name}</span>}
          {viewers !== undefined && <span className="text-white/60">{viewers.toLocaleString()} watching</span>}
          {!ended && stream.startedAt && (
            <span className="text-white/60">
              <StartedAgo at={stream.startedAt} />
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ShareButton title={title} />
          <Link href="/prayer" className={actionButton}>
            <HandHeart aria-hidden className="size-4" />
            Prayer request
          </Link>
          <Link href="/give" className={actionButton}>
            <Heart aria-hidden className="size-4" />
            Give
          </Link>
          <a href={`https://www.youtube.com/watch?v=${stream.videoId}`} target="_blank" rel="noreferrer" className={actionButton}>
            YouTube
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
          {/* Theatre mode: hide the side panel so the player gets the full width (wide screens only) */}
          <button
            type="button"
            onClick={() => setTheatre((t) => !t)}
            aria-pressed={theatre}
            className={`${actionButton} hidden lg:inline-flex`}
          >
            {theatre ? <PanelRightOpen aria-hidden className="size-4" /> : <PanelRightClose aria-hidden className="size-4" />}
            {theatre ? "Show chat" : "Theatre mode"}
          </button>
        </div>
      </div>

      <div className={`mt-4 grid gap-4 lg:gap-5 ${theatre ? "" : "lg:grid-cols-[minmax(0,1fr)_24rem]"}`}>
        {/* The player. On phones it stays pinned under the header while the chat scrolls. */}
        <div className="sticky top-14 z-10 -mx-5 md:-mx-8 lg:static lg:mx-0">
          <div
            className={`relative aspect-video overflow-hidden bg-black lg:rounded-squircle-lg ${
              theatre ? "mx-auto lg:max-w-[calc((100svh-11rem)*16/9)]" : ""
            }`}
          >
            <iframe
              // The standard player, not youtube-nocookie: the privacy-mode player can't see a
              // viewer's YouTube sign-in, so YouTube often answers it with "confirm you're not a bot".
              src={`https://www.youtube.com/embed/${stream.videoId}?autoplay=1&rel=0&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              // YouTube refuses to play embeds that arrive without the page's address.
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full"
            />
            {ended && <EndedScreen videoId={stream.videoId} />}
          </div>
        </div>

        {/* Chat and Pray along: beside the player on wide screens (same height), below it on phones */}
        <aside
          className={`flex h-[70svh] flex-col overflow-hidden rounded-squircle-md bg-white/[0.04] ring-1 ring-white/10 ring-inset lg:h-auto ${
            theatre ? "lg:hidden" : ""
          }`}
        >
          <div role="tablist" aria-label="Alongside the stream" className="flex gap-1 p-1.5">
            <TabButton id="chat" active={tab === "chat"} onClick={() => setTab("chat")}>
              Chat
            </TabButton>
            <TabButton id="pray" active={tab === "pray"} onClick={() => setTab("pray")}>
              Pray along
            </TabButton>
          </div>
          <div role="tabpanel" id="live-panel-chat" aria-labelledby="live-tab-chat" hidden={tab !== "chat"} className="relative min-h-0 flex-1">
            <iframe
              // YouTube only shows its chat on the site named here; dark_theme matches the page.
              src={`https://www.youtube.com/live_chat?v=${stream.videoId}&embed_domain=${host}&dark_theme=1`}
              title="Live chat"
              className="absolute inset-0 size-full"
            />
          </div>
          <div
            role="tabpanel"
            id="live-panel-pray"
            aria-labelledby="live-tab-pray"
            hidden={tab !== "pray"}
            className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-3"
          >
            <PrayAlong week={week} />
          </div>
        </aside>
      </div>

      <h1 id="stream-title" className="mt-6 max-w-[40ch] text-headline text-balance text-white">
        {title}
      </h1>
    </section>
  );
}

const actionButton =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-squircle-xs bg-white/10 px-3.5 text-sm font-semibold text-white transition-[background-color,scale] duration-200 hover:bg-white/15 active:scale-[0.98] focus-visible:outline-white";

function TabButton({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`live-tab-${id}`}
      aria-controls={`live-panel-${id}`}
      aria-selected={active}
      onClick={onClick}
      className={`h-9 flex-1 cursor-pointer rounded-squircle-xs text-sm font-semibold transition-colors focus-visible:outline-white ${
        active ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/** This week's verse and prayer points, to pray along with during the meeting. */
function PrayAlong({ week }: { week: ThisWeek }) {
  return (
    <div className="flex flex-col gap-7">
      <figure>
        <figcaption className="text-xs font-semibold uppercase text-white/50">This week’s verse</figcaption>
        <blockquote className="mt-3 text-[1.05rem] leading-relaxed text-white/90">
          <p>“{week.verse.text}”</p>
        </blockquote>
        <a
          href={bibleComUrl(week.verse.passage)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-white/60 underline-offset-4 hover:text-white"
        >
          <span className="font-semibold text-white">{week.verse.reference}</span> · {TRANSLATION}
        </a>
      </figure>
      <div>
        <h2 className="text-xs font-semibold uppercase text-white/50">Prayer points</h2>
        <ol className="mt-4 flex flex-col gap-4">
          {week.prayerPoints.map((point, i) => (
            <li key={point} className="flex items-baseline gap-3">
              <span aria-hidden className="w-5 shrink-0 text-sm font-semibold tabular-nums text-white/40">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[0.98rem] leading-relaxed text-white/85">{point}</p>
            </li>
          ))}
        </ol>
      </div>
      <Link
        href="/prayer"
        className="inline-flex h-10 items-center justify-center self-start rounded-squircle-xs bg-white px-4 text-sm font-semibold text-ink transition-[background-color,scale] duration-200 hover:bg-white/90 active:scale-[0.98]"
      >
        Send a prayer request
      </Link>
    </div>
  );
}

/** Over the player once the stream has finished, instead of sending the viewer away. */
function EndedScreen({ videoId }: { videoId: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-night/90 p-6 text-center backdrop-blur-md">
      <div>
        <h2 className="text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-semibold text-white">The stream has ended</h2>
        <p className="mx-auto mt-2 max-w-[38ch] text-white/70">
          Thank you for joining us. The recording will be on YouTube shortly.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-squircle-xs bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
        >
          Watch on YouTube
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
        <Link href="/" className={actionButton}>
          Back to home
        </Link>
      </div>
    </div>
  );
}

/** Share the stream: the phone's share sheet where there is one, otherwise copy the link. */
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/live`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The share sheet was closed, or copying isn't allowed here: nothing to do.
    }
  }

  return (
    <button type="button" onClick={share} className={actionButton}>
      {copied ? <Check aria-hidden className="size-4" /> : <ShareIcon className="size-4" />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

/**
 * The meeting this stream belongs to, if it's within one: from 30 minutes before a meeting's
 * start until an hour after it should finish. Untimed meetings count for their whole day.
 */
function currentMeeting(now: Date): Meeting | undefined {
  const found = occurrencesBetween(meetingSchedule, new Date(now.getTime() - 36 * 3_600_000), now);
  const t = now.getTime();
  const match = found.findLast((o) => {
    if (!o.timed) {
      const day = wallDate(now, meetingTimeZoneId);
      const meet = wallDate(o.start, meetingTimeZoneId);
      return day.year === meet.year && day.month === meet.month && day.day === meet.day;
    }
    const start = o.start.getTime();
    return t >= start - 30 * 60_000 && t <= start + (o.meeting.durationMinutes + 60) * 60_000;
  });
  return match?.meeting;
}
