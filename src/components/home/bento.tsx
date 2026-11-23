"use client";

import Link from "next/link";
import { TonalArtwork } from "@/components/art/artwork";
import { describeOccurrence, useNow } from "@/components/live/schedule";
import { meetingSchedule } from "@/config/site";
import type { BentoTile } from "@/content/home";
import { Reveal } from "@/components/ui/reveal";
import { upcomingMeetings, type Occurrence } from "@/lib/schedule";
import { MeetingCalendar } from "./meeting-calendar";

/**
 * Bento grid of colour tiles: two wide tiles over three narrower ones on desktop,
 * two columns on tablets (the last tile spans both), one column on phones.
 *
 * The top right wide tile is always the meeting that comes next ("Next up", with its date
 * and time in the visitor's zone); the other meetings follow in the second row, then the
 * calendar. Which meeting is next depends on the visitor's clock, so the server renders the
 * tiles in their listed order and the browser moves the right one up.
 *
 * Each whole tile is the link; the white button only shows where it goes. The meeting
 * times tile is a calendar instead, with its own button.
 */
export function Bento({ tiles }: { tiles: BentoTile[] }) {
  const now = useNow();
  const next = now ? upcomingMeetings(meetingSchedule, now)[0] : undefined;
  const ordered = next ? nextFirst(tiles, next) : tiles;

  return (
    <section aria-labelledby="bento-title">
      <Reveal>
        <h2 id="bento-title" className="max-w-[20ch] text-headline text-ink text-balance">
          Our rhythm of fellowship
        </h2>
      </Reveal>

      <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-6 lg:gap-5">
        {ordered.map((tile, i) => {
          const isNext = Boolean(next && tile.meeting === next.meeting.name);
          return (
            <Reveal
              as="li"
              key={tile.label}
              // Two tiles in the top row, three in the next: count from 0 in each row.
              order={i < 2 ? i : i - 2}
              className={`${i < 2 ? "lg:col-span-3" : "lg:col-span-2"} ${
                i === ordered.length - 1 && ordered.length % 2 === 1 ? "md:col-span-2 lg:col-span-2" : ""
              }`}
            >
              {tile.calendar ? (
                <MeetingCalendar colour={tile.colour} />
              ) : (
                <Link
                  href={tile.href}
                  className="group relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-squircle-md p-6 text-white sm:min-h-[20rem] lg:min-h-[24rem] lg:p-8"
                  style={{ backgroundColor: tile.colour }}
                >
                  <TonalArtwork
                    motif={tile.motif}
                    colour={tile.colour}
                    // Named after the tile, not its place, as the tiles can change places.
                    uid={`bento-${tile.motif}`}
                    className="absolute inset-0 size-full transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                  <span className="relative flex flex-1 flex-col justify-center py-6">
                    <span className="text-sm font-medium text-white/85">
                      {isNext ? `Next up · ${tile.label}` : tile.label}
                    </span>
                    <span className="mt-2 block max-w-[20ch] text-[clamp(1.5rem,1.2rem+0.9vw,2rem)] font-bold leading-[1.12] tracking-[-0.02em] text-balance">
                      {tile.title}
                    </span>
                    {(isNext || tile.detail) && (
                      <span className="mt-3 text-sm text-white/75">
                        {isNext && next ? describeOccurrence(next) : tile.detail}
                      </span>
                    )}
                  </span>
                  <span className="relative inline-flex h-9 items-center self-start rounded-squircle-xs bg-white px-4 text-sm font-semibold text-coal transition-colors group-hover:bg-white/90">
                    {tile.action}
                  </span>
                </Link>
              )}
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

/** The tiles with the next meeting's moved up to second place, beside the first tile. */
function nextFirst(tiles: BentoTile[], next: Occurrence) {
  const index = tiles.findIndex((t) => t.meeting === next.meeting.name);
  if (index < 0) return tiles;
  const rest = tiles.filter((_, i) => i !== index);
  return [rest[0], tiles[index], ...rest.slice(1)];
}
