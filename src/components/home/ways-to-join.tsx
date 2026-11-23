import { ChevronRight } from "lucide-react";
import type { Way } from "@/content/home";
import { LiveAwareLink, LiveSignal } from "@/components/live/live-signal";
import { Reveal } from "@/components/ui/reveal";
import { groupUnderline } from "@/components/ui/styles";
import { WayIcon } from "./way-icons";

/** A centred heading over four ways into the fellowship, kept apart by space alone. */
export function WaysToJoin({ ways }: { ways: Way[] }) {
  return (
    <section aria-labelledby="ways-title" className="mx-auto w-full max-w-[75rem]">
      <Reveal className="text-center">
        {/* The title says it all, so there's no line under it */}
        <h2 id="ways-title" className="mx-auto max-w-[24ch] text-headline text-ink text-balance">
          Join us live, catch up when you can, or read through the week
        </h2>
      </Reveal>

      <ul className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-16">
        {ways.map((way, i) => {
          return (
            // group/way: hovering anywhere on the card (or tabbing into it) fills its icon and
            // nudges its arrow forward, to show which card has focus
            <Reveal as="li" key={way.href} order={i} className="group/way flex flex-col">
              <WayIcon name={way.icon} />
              <h3 className="mt-5 flex items-center gap-2 text-title text-ink">
                {way.title}
                {/* Only while a stream is on */}
                {way.live && <LiveSignal />}
              </h3>
              <p className="mt-3 max-w-[34ch] flex-1 text-[0.95rem] leading-[1.7] text-muted">{way.text}</p>
              {/* Switches to its live link while a stream is on */}
              <LiveAwareLink
                action={{ label: way.action, href: way.href }}
                liveAction={way.liveAction}
                className="group mt-6 inline-flex items-center gap-1 self-start text-[0.95rem] font-semibold text-ink"
                labelClassName={groupUnderline}
              >
                <ChevronRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/way:translate-x-1 group-focus-within/way:translate-x-1"
                />
              </LiveAwareLink>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
