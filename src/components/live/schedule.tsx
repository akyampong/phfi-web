"use client";

import { useSyncExternalStore } from "react";
import { meetingTimeZoneId } from "@/config/site";
import type { Occurrence } from "@/lib/schedule";

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

/** "Started 18 minutes ago". */
export function StartedAgo({ at }: { at: string }) {
  const now = useNow();
  if (!now) return null;
  return <>Started {fromNow(new Date(at), now)}</>;
}
