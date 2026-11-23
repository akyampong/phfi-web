"use client";

import { useSyncExternalStore } from "react";
import { meetingSchedule, meetingTimeZone, meetingTimeZoneId } from "@/config/site";
import { upcomingMeetings, type Occurrence } from "@/lib/schedule";

/**
 * Times in the visitor's own time zone. The visitor's clock and zone are only known in the
 * browser, so the server renders placeholders of the same size and the browser fills them in.
 */

/** The current time, ticking every 30 seconds. Null during the server render. */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribeToClock, readClock, () => null);
  return ms === null ? null : new Date(ms);
}

let clock = Date.now();
function readClock() {
  return clock;
}
function subscribeToClock(onChange: () => void) {
  clock = Date.now();
  const id = setInterval(() => {
    clock = Date.now();
    onChange();
  }, 30_000);
  return () => clearInterval(id);
}

const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const dayAndDate = (d: Date) => d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
/** Untimed meetings keep the church's calendar date, so they are not shifted by a time zone. */
const churchDate = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", timeZone: meetingTimeZoneId });

function zoneName() {
  const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(new Date());
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

/** "in 2 days", "in 3 hours", "in 12 minutes". */
function fromNow(target: Date, now: Date) {
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const minutes = Math.round((target.getTime() - now.getTime()) / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 36) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

/** "Tuesday 24 November at 7:00 PM" in the visitor's zone; just the date for untimed meetings. */
export function describeOccurrence(o: Occurrence) {
  return o.timed ? `${dayAndDate(o.start)} at ${time(o.start)}` : churchDate(o.start);
}

/** The next meeting, for the "not live right now" panel. */
export function NextMeeting() {
  const now = useNow();
  const next = now ? upcomingMeetings(meetingSchedule, now)[0] : null;

  return (
    <div className="min-h-[5.5rem]" aria-live="polite">
      {next && now && (
        <>
          <p className="text-[clamp(1.5rem,1.2rem+1vw,2.25rem)] font-bold leading-tight tracking-[-0.02em] text-white">
            {next.meeting.name}
          </p>
          <p className="mt-2 text-white/80">
            {describeOccurrence(next)}
            {next.timed && <span className="text-white/60"> · {fromNow(next.start, now)}</span>}
          </p>
        </>
      )}
    </div>
  );
}

/** Every meeting with its next date and start time, in the visitor's time zone. */
export function Schedule() {
  const now = useNow();
  const upcoming = now ? upcomingMeetings(meetingSchedule, now) : null;

  return (
    <div>
      <p className="text-[0.95rem] text-muted">
        {now ? (
          <>
            Shown in your time zone ({zoneName()}). Our meetings are set in {meetingTimeZone}.
          </>
        ) : (
          <>Our meetings are set in {meetingTimeZone}.</>
        )}
      </p>

      <ul className="mt-8 grid gap-8 md:grid-cols-3 md:gap-8">
        {meetingSchedule.map((meeting) => {
          const o = upcoming?.find((u) => u.meeting === meeting);
          return (
            <li key={meeting.name}>
              <h3 className="text-title text-ink">{meeting.name}</h3>
              <p className="mt-1 text-sm font-medium text-muted">{meeting.summary}</p>
              <p className="mt-2 min-h-[3.25rem] text-[0.95rem] leading-relaxed text-body">
                {o && now ? (
                  <>
                    Next: {describeOccurrence(o)}
                    {o.timed && <span className="block text-muted">{fromNow(o.start, now)}</span>}
                  </>
                ) : (
                  <span className="text-muted">Working out your local time…</span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** "Started 18 minutes ago". */
export function StartedAgo({ at }: { at: string }) {
  const now = useNow();
  if (!now) return null;
  return <>Started {fromNow(new Date(at), now)}</>;
}

/** A moment in the visitor's time zone, e.g. "Tuesday 17 November at 8:00 PM". */
export function LocalTime({ at }: { at: string }) {
  const now = useNow();
  if (!now) return null;
  const d = new Date(at);
  return (
    <>
      {dayAndDate(d)} at {time(d)} · {fromNow(d, now)}
    </>
  );
}
