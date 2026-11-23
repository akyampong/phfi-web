import { meetingTimeZoneId, type Meeting } from "@/config/site";

/**
 * Meeting times. Meetings are defined in the church's time zone (meetingTimeZoneId);
 * these helpers turn them into real moments so each visitor sees their own local time.
 * Pure functions: safe to run in the browser.
 */

export type Occurrence = {
  meeting: Meeting;
  /** The moment it starts. For a meeting with no fixed start, midnight at the start of its day. */
  start: Date;
  /** False when the meeting has no fixed start time. */
  timed: boolean;
};

/** The next time each meeting happens after `now`, soonest first. */
export function upcomingMeetings(meetings: Meeting[], now: Date, timeZone = meetingTimeZoneId): Occurrence[] {
  return meetings
    .map((meeting) => nextOccurrence(meeting, now, timeZone))
    .filter((o): o is Occurrence => o !== null)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** The next time a meeting starts after `now`. */
export function nextOccurrence(meeting: Meeting, now: Date, timeZone = meetingTimeZoneId): Occurrence | null {
  const today = wallDate(now, timeZone);
  const [hour, minute] = meeting.startTime ? meeting.startTime.split(":").map(Number) : [0, 0];

  // Walk forward day by day through the church's calendar (40 days covers "last of the month").
  for (let i = 0; i <= 40; i++) {
    const day = new Date(Date.UTC(today.year, today.month, today.day + i));
    if (!meetsOn(meeting, day)) continue;

    const year = day.getUTCFullYear();
    const month = day.getUTCMonth();
    const date = day.getUTCDate();
    const start = zonedTimeToUtc(year, month, date, hour, minute, timeZone);
    // An untimed meeting counts as upcoming for its whole day.
    const ends = meeting.startTime ? start.getTime() : start.getTime() + 24 * 3_600_000;
    if (ends > now.getTime()) return { meeting, start, timed: Boolean(meeting.startTime) };
  }
  return null;
}

/**
 * Every meeting from the church-calendar day `from` falls on to the day `to` falls on
 * (both included), soonest first. Used to mark meeting days on a month calendar.
 */
export function occurrencesBetween(
  meetings: Meeting[],
  from: Date,
  to: Date,
  timeZone = meetingTimeZoneId,
): Occurrence[] {
  const first = wallDate(from, timeZone);
  const last = wallDate(to, timeZone);
  const end = Date.UTC(last.year, last.month, last.day);
  const found: Occurrence[] = [];

  for (let t = Date.UTC(first.year, first.month, first.day); t <= end; t += 86_400_000) {
    const day = new Date(t);
    for (const meeting of meetings) {
      if (!meetsOn(meeting, day)) continue;
      const [hour, minute] = meeting.startTime ? meeting.startTime.split(":").map(Number) : [0, 0];
      const start = zonedTimeToUtc(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, minute, timeZone);
      found.push({ meeting, start, timed: Boolean(meeting.startTime) });
    }
  }
  return found.sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Whether a meeting happens on a church-calendar day (a UTC date standing for that day). */
function meetsOn(meeting: Meeting, day: Date) {
  if (day.getUTCDay() !== meeting.weekday) return false;
  // "last": only when there is no same weekday later in the month.
  if (meeting.frequency === "last") {
    return day.getUTCDate() + 7 > daysInMonth(day.getUTCFullYear(), day.getUTCMonth());
  }
  return true;
}

/** The calendar date (year, month 0–11, day) that `instant` falls on in `timeZone`. */
export function wallDate(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month") - 1, day: get("day") };
}

/** The moment when the clocks in `timeZone` read the given date and time. */
function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, timeZone: string) {
  const asIfUtc = Date.UTC(year, month, day, hour, minute);
  // Apply the zone's offset, then once more in case that crossed a daylight-saving change.
  let guess = asIfUtc - offsetMs(asIfUtc, timeZone);
  guess = asIfUtc - offsetMs(guess, timeZone);
  return new Date(guess);
}

/** How far `timeZone` is ahead of UTC at a given moment, in milliseconds. */
function offsetMs(instant: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return wall - Math.floor(instant / 1000) * 1000;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}
