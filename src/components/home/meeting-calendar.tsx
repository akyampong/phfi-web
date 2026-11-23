"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { meetingSchedule, meetingTimeZoneId } from "@/config/site";
import { useNow } from "@/components/live/schedule";
import { occurrencesBetween, upcomingMeetings, wallDate, type Occurrence } from "@/lib/schedule";

/**
 * Meeting days, all in one blue (the one place the site uses blue, by request):
 * the very next meeting solid, later ones pale, past ones grey.
 */
const BLUE = "#0a84ff";
const PALE_BLUE = "rgba(10, 132, 255, 0.24)";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The meeting times bento tile: a month calendar with the meeting days marked (the next
 * one solid blue, later ones pale blue, past ones grey), a small white dot under today,
 * arrows to look back and ahead, and a button to add the meetings to Google Calendar (it
 * subscribes to the repeating events at /calendar.ics, so it stays up to date).
 *
 * Each meeting day is a button: choosing one slides up a glass panel over the foot of the
 * calendar with that meeting's details (date and time in the visitor's zone, length, what it
 * is) and what to do next: add that one date to Google Calendar and join online, or, once it
 * has passed, watch the recaps. The × button, the Escape key or changing month closes it.
 *
 * Days are worked out in the visitor's own time zone, so a 7 PM GMT meeting lands on the
 * right date wherever they are. That needs the browser's clock and zone, so the server
 * renders an empty grid of the same size and the browser fills it in.
 */
export function MeetingCalendar({ colour }: { colour: string }) {
  const now = useNow();
  const [offset, setOffset] = useState(0);
  /** The meeting day whose details are showing, as a day of the month on show. */
  const [selected, setSelected] = useState<number | null>(null);

  function changeMonth(by: number) {
    setOffset((o) => o + by);
    setSelected(null);
  }

  const view = now ? new Date(now.getFullYear(), now.getMonth() + offset, 1) : null;
  const year = view?.getFullYear() ?? 0;
  const month = view?.getMonth() ?? 0;
  const days = view ? new Date(year, month + 1, 0).getDate() : 35;
  const lead = view ? view.getDay() : 0;
  const meetings = view ? meetingsByDay(year, month) : new Map<number, Occurrence[]>();
  const isThisMonth = now && view && now.getMonth() === month && now.getFullYear() === year;
  // The very next meeting, if it falls in the month on show.
  const nextMeeting = now ? upcomingMeetings(meetingSchedule, now)[0] : undefined;
  const nextDate = nextMeeting ? localDate(nextMeeting) : undefined;
  const nextDay = nextDate && nextDate.year === year && nextDate.month === month ? nextDate.day : undefined;
  const chosen = selected !== null ? meetings.get(selected) : undefined;

  return (
    <div
      className="relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-squircle-md p-6 text-white sm:min-h-[20rem] lg:min-h-[24rem] lg:p-8"
      style={{ backgroundColor: colour }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setSelected(null);
      }}
    >
      <p className="text-sm font-medium text-white/85">Meeting times</p>

      {/* Month, with arrows to look back and ahead */}
      <div className="mt-4 flex items-center justify-between">
        <MonthButton side="left" disabled={!view || offset <= -6} onClick={() => changeMonth(-1)} />
        <p className="text-[1.05rem] font-semibold" aria-live="polite">
          {view ? view.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : " "}
        </p>
        <MonthButton side="right" disabled={!view || offset >= 12} onClick={() => changeMonth(1)} />
      </div>

      <div aria-hidden className="mt-5 grid grid-cols-7 text-center text-[0.7rem] font-medium uppercase tracking-[0.08em] text-white/45">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <ol className="mt-2 grid grid-cols-7 gap-y-1 text-center text-sm tabular-nums">
        {Array.from({ length: lead }, (_, i) => (
          <li key={`lead-${i}`} aria-hidden />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = i + 1;
          const here = meetings.get(day);
          const today = isThisMonth && now!.getDate() === day;
          const past = Boolean(now && view && new Date(year, month, day + 1) <= now);
          const isNext = here && day === nextDay;
          const isSelected = selected === day;
          // Meeting days are buttons that open their details; other days are plain numbers.
          const Cell = here ? "button" : "span";
          return (
            <li key={day} className="flex items-center justify-center py-0.5">
              <Cell
                {...(here
                  ? {
                      type: "button" as const,
                      onClick: () => setSelected(isSelected ? null : day),
                      "aria-expanded": isSelected,
                    }
                  : {})}
                className={`relative flex size-8 items-center justify-center rounded-full transition-[background-color,box-shadow,scale] sm:size-9 ${
                  here ? "cursor-pointer hover:scale-110 focus-visible:outline-white" : ""
                } ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--tile)]" : ""} ${
                  isNext
                    ? "font-semibold text-white"
                    : here
                      ? past
                        ? "bg-white/[0.07] text-white/35"
                        : "text-white"
                      : past
                        ? "text-white/30"
                        : "text-white/85"
                }`}
                style={{
                  backgroundColor: isNext ? BLUE : here && !past ? PALE_BLUE : undefined,
                  ["--tile" as string]: colour,
                }}
              >
                {view ? day : ""}
                {/* Today: a small white dot under the number */}
                {today && <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-white" />}
                {today && <span className="sr-only"> (today)</span>}
                {here && view && (
                  <span className="sr-only">
                    {" "}
                    {new Date(year, month, day).toLocaleDateString(undefined, { month: "long" })}:{" "}
                    {here.map(describe).join(", ")}
                  </span>
                )}
              </Cell>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto pt-6">
        {/* Google Calendar subscribes to /calendar.ics by its address, so it stays up to date.
            The address is only known in the browser; until then the button goes to the file. */}
        <a
          href={now ? googleCalendarUrl() : "/calendar.ics"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-squircle-xs bg-white px-4 text-sm font-semibold text-ink transition-[background-color,scale] duration-200 hover:bg-white/90 active:scale-[0.98]"
        >
          {/* Google Calendar's own logo (from Google's servers), so it's clear where this goes */}
          <Image src="/assets/google-calendar.png" alt="" width={20} height={20} className="size-5" />
          Add to Google Calendar
        </a>
      </div>

      {/* The chosen meeting's details, sliding up over the foot of the calendar */}
      <div
        aria-live="polite"
        inert={!chosen}
        className={`absolute inset-x-3 bottom-3 rounded-squircle-sm bg-[#26262b]/85 p-5 ring-1 ring-white/10 ring-inset backdrop-blur-xl transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          chosen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {chosen && now && (
          <>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close meeting details"
              className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white"
            >
              <X aria-hidden className="size-4" />
            </button>
            <div className="flex flex-col gap-5">
              {chosen.map((o) => (
                <MeetingDetails key={o.meeting.name} occurrence={o} now={now} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** One meeting's details in the panel: when, how long, what it is, and what to do next. */
function MeetingDetails({ occurrence: o, now }: { occurrence: Occurrence; now: Date }) {
  const ends = o.start.getTime() + (o.timed ? o.meeting.durationMinutes * 60_000 : 86_400_000);
  const over = ends <= now.getTime();
  const day = o.timed
    ? o.start.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : o.start.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: meetingTimeZoneId,
      });
  const time = o.timed ? o.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null;

  return (
    <div className="pr-8">
      <p className="text-sm text-white/70">
        {day}
        {time ? ` · ${time}` : " · time to be announced"}
      </p>
      <h3 className="mt-1.5 text-lg font-semibold leading-snug text-white">{o.meeting.name}</h3>
      <p className="mt-1 text-sm text-white/60">{duration(o.meeting.durationMinutes)}</p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/80">{o.meeting.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {over ? (
          <Link href="/watch" className={panelButtonGlass}>
            Watch recaps
          </Link>
        ) : (
          <>
            <a href={singleEventUrl(o)} target="_blank" rel="noreferrer" className={panelButtonSolid}>
              <Image src="/assets/google-calendar.png" alt="" width={16} height={16} className="size-4" />
              Add to Google Calendar
            </a>
            <Link href="/live" className={panelButtonGlass}>
              Join online
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

const panelButton =
  "inline-flex h-9 items-center gap-2 rounded-squircle-xs px-3.5 text-[0.8rem] font-semibold transition-[background-color,scale] duration-200 active:scale-[0.98]";
const panelButtonSolid = `${panelButton} bg-white text-ink hover:bg-white/90`;
const panelButtonGlass = `${panelButton} bg-white/12 text-white hover:bg-white/20`;

/** "1 hr 30 min", "2 hours". */
function duration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  if (!m) return h === 1 ? "1 hour" : `${h} hours`;
  return `${h} hr ${m} min`;
}

/** A Google Calendar link that adds just this one meeting (not the whole repeating series). */
function singleEventUrl(o: Occurrence) {
  const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  let dates: string;
  if (o.timed) {
    const end = new Date(o.start.getTime() + o.meeting.durationMinutes * 60_000);
    dates = `${utc(o.start)}/${utc(end)}`;
  } else {
    // No set start time yet: an all-day entry on the church's date.
    const d = wallDate(o.start, meetingTimeZoneId);
    const ymd = (date: Date) =>
      `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, "0")}${String(date.getUTCDate()).padStart(2, "0")}`;
    dates = `${ymd(new Date(Date.UTC(d.year, d.month, d.day)))}/${ymd(new Date(Date.UTC(d.year, d.month, d.day + 1)))}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: o.meeting.name,
    dates,
    details: `${o.meeting.description}\nJoin online: ${window.location.origin}/live`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function MonthButton({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous month" : "Next month"}
      className="flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}

/**
 * The meetings in a month of the visitor's calendar, by day of the month. Timed meetings
 * land on the visitor's local date; untimed ones keep the church's date.
 */
function meetingsByDay(year: number, month: number) {
  // A day either side, so a meeting pushed across midnight by the time zone is still caught.
  const found = occurrencesBetween(
    meetingSchedule,
    new Date(year, month, 0),
    new Date(year, month + 1, 1, 23, 59),
  );
  const byDay = new Map<number, Occurrence[]>();
  for (const o of found) {
    const date = localDate(o);
    if (date.year !== year || date.month !== month) continue;
    byDay.set(date.day, [...(byDay.get(date.day) ?? []), o]);
  }
  return byDay;
}

/** The visitor's calendar date for a meeting; untimed meetings keep the church's date. */
function localDate(o: Occurrence) {
  return o.timed
    ? { year: o.start.getFullYear(), month: o.start.getMonth(), day: o.start.getDate() }
    : wallDate(o.start, meetingTimeZoneId);
}

function describe(o: Occurrence) {
  const time = o.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return o.timed ? `${o.meeting.name} at ${time}` : o.meeting.name;
}

/** Google Calendar's "add by URL" for /calendar.ics on this site. */
function googleCalendarUrl() {
  const feed = `webcal://${window.location.host}/calendar.ics`;
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feed)}`;
}
