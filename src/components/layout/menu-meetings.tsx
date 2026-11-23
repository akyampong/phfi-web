import Link from "next/link";
import type { Meeting } from "@/config/site";
import { MeetingArt } from "./meeting-art";

/**
 * The meetings as a list in the menu drawer: name, when, and a small piece of artwork on the
 * right. Each links to the meeting calendar on the home page (/live exists only during a stream).
 */
export function MenuMeetings({ meetings }: { meetings: Meeting[] }) {
  return (
    <section aria-labelledby="menu-meetings">
      <h2 id="menu-meetings" className="sr-only">
        Meet with us online
      </h2>
      <ul className="flex flex-col gap-7">
        {meetings.map((meeting) => (
          <li key={meeting.name}>
            <Link href="/#meeting-times" className="group flex items-center justify-between gap-6">
              <span className="min-w-0">
                <span className="block text-[1.1rem] leading-snug text-night-text transition-colors group-hover:text-white">
                  {meeting.name}
                </span>
                <span className="mt-1 block text-[0.82rem] leading-snug text-night-muted">
                  {meeting.summary}
                </span>
              </span>
              <MeetingArt
                art={meeting.art}
                uid={`drawer-${meeting.art}`}
                className="size-10 shrink-0 rounded-squircle-xs ring-1 ring-white/15 transition-opacity group-hover:opacity-90"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
