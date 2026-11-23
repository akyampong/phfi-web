import { meetingSchedule, meetingTimeZoneId, siteConfig, type Meeting } from "@/config/site";
import { nextOccurrence, wallDate } from "@/lib/schedule";

/**
 * /calendar.ics: every meeting as a repeating calendar event. Opening it adds the meetings
 * to someone's calendar; subscribing to it (webcal://…/calendar.ics, or Google Calendar's
 * "From URL") keeps their calendar in step when the schedule changes.
 *
 * It is built from meetingSchedule in config/site.ts, so there is nothing to keep in sync.
 */

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
/** Repeats are counted from here, so every build writes the same file. */
const SERIES_START = new Date(Date.UTC(2026, 0, 1));

export function GET(request: Request) {
  const liveUrl = new URL("/live", request.url).href;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PHFI//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${text(siteConfig.shortName)} meetings`,
    `X-WR-TIMEZONE:${meetingTimeZoneId}`,
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    ...meetingSchedule.flatMap((meeting) => event(meeting, liveUrl)),
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="phfi-meetings.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function event(meeting: Meeting, liveUrl: string) {
  const first = nextOccurrence(meeting, SERIES_START);
  if (!first) return [];
  const day = wallDate(first.start, meetingTimeZoneId);
  const date = `${day.year}${pad(day.month + 1)}${pad(day.day)}`;
  const weekday = WEEKDAYS[meeting.weekday];
  const rule =
    meeting.frequency === "last" ? `FREQ=MONTHLY;BYDAY=-1${weekday}` : `FREQ=WEEKLY;BYDAY=${weekday}`;

  // With a start time it is a timed event in the church's time zone; without one, an
  // all-day entry on the right date.
  const when = meeting.startTime
    ? [
        `DTSTART;TZID=${meetingTimeZoneId}:${date}T${meeting.startTime.replace(":", "")}00`,
        `DURATION:PT${meeting.durationMinutes}M`,
      ]
    : [`DTSTART;VALUE=DATE:${date}`, "DURATION:P1D"];

  return [
    "BEGIN:VEVENT",
    `UID:${meeting.name.toLowerCase().replace(/\W+/g, "-")}@phfi`,
    `DTSTAMP:${stamp(SERIES_START)}`,
    `SUMMARY:${text(meeting.name)}`,
    `DESCRIPTION:${text(`${meeting.description}\nJoin online: ${liveUrl}`)}`,
    `URL:${liveUrl}`,
    ...when,
    `RRULE:${rule}`,
    "END:VEVENT",
  ];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function stamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escapes text for a calendar file. */
function text(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

/** Calendar files wrap lines longer than 75 characters onto continuation lines. */
function fold(line: string) {
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) parts.push((i ? " " : "") + line.slice(i, i + 73));
  return parts.join("\r\n");
}
