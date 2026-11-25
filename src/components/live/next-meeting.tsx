"use client";

import { CalendarClock } from "lucide-react";
import { describeOccurrence, useNow } from "@/components/live/schedule";
import { meetingSchedule } from "@/config/site";
import { upcomingMeetings } from "@/lib/schedule";

/**
 * "Next live: Tuesday Fellowship, Tuesday 25 November at 7:00 PM", in the visitor's own time
 * zone (only the browser knows it, so the line fills in once the page has loaded; its space is
 * kept so nothing moves).
 */
export function NextMeeting({ className = "" }: { className?: string }) {
  const now = useNow();
  const next = now ? upcomingMeetings(meetingSchedule, now)[0] : undefined;
  return (
    <p className={`flex min-h-6 items-center justify-center gap-2 ${className}`}>
      {next && (
        <>
          <CalendarClock aria-hidden className="size-4 shrink-0" />
          <span>
            Next live: {next.meeting.name}, {describeOccurrence(next)}
          </span>
        </>
      )}
    </p>
  );
}
