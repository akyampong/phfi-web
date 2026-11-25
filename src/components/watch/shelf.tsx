"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { groupUnderline, textLink } from "@/components/ui/styles";

/**
 * How many fit across the reading column at each size, with the next one peeking in on
 * phones and tablets so it's clear the row scrolls.
 */
const columns = {
  // 16:9 videos: 1.2 on phones, 2.2 on tablets, 3 then 4 on wide screens
  video: "gap-x-5 auto-cols-[82%] sm:auto-cols-[46%] lg:gap-x-6 lg:auto-cols-[calc((100%-3rem)/3)] xl:auto-cols-[calc((100%-4.5rem)/4)]",
  // Series posters (3:4): 1.6, 2.6, then 4 and 5
  poster: "gap-x-5 auto-cols-[62%] sm:auto-cols-[37%] lg:gap-x-6 lg:auto-cols-[calc((100%-4.5rem)/4)] xl:auto-cols-[calc((100%-6rem)/5)]",
  // Upright clips (9:16): 2.3, 3.4, then 5 and 6
  clip: "gap-x-3 auto-cols-[42%] sm:auto-cols-[29%] sm:gap-x-4 lg:auto-cols-[calc((100%-4rem)/5)] xl:auto-cols-[calc((100%-5rem)/6)]",
};

type ShelfProps = {
  id: string;
  title: string;
  /** A short line beside the title, e.g. when the meeting is. */
  detail?: string;
  /** Where "See all" goes; no link when everything is already in the row. */
  href?: string;
  size: keyof typeof columns;
  /** The row's <li> items. */
  children: ReactNode;
};

/**
 * A row that scrolls sideways, like a streaming app's: swipe on touch screens, arrow buttons
 * on wide ones. It runs out to the edge of the screen on smaller screens, and each card
 * snaps into line with the page's left edge.
 */
export function Shelf({ id, title, detail, href, size, children }: ShelfProps) {
  const scroller = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const list = scroller.current;
    if (!list) return;
    const update = () =>
      setEdges({ start: list.scrollLeft < 4, end: list.scrollLeft + list.clientWidth >= list.scrollWidth - 4 });
    update();
    list.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function page(direction: 1 | -1) {
    const list = scroller.current;
    if (!list) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A screenful at a time, less a little so the last card stays in view for context
    list.scrollBy({ left: direction * list.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  }

  const arrows = !(edges.start && edges.end);

  return (
    <section aria-labelledby={id}>
      <div className="flex items-end justify-between gap-6">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id={id} className="text-section text-ink">
            {title}
          </h2>
          {detail && <p className="text-sm text-muted">{detail}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {href && (
            <Link href={href} className={textLink}>
              <span className={groupUnderline}>See all</span>
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          {arrows && (
            <div className="hidden gap-1.5 md:flex">
              <ArrowButton label={`Back in ${title}`} disabled={edges.start} onClick={() => page(-1)}>
                <ChevronLeft aria-hidden className="size-[1.15rem]" />
              </ArrowButton>
              <ArrowButton label={`More in ${title}`} disabled={edges.end} onClick={() => page(1)}>
                <ChevronRight aria-hidden className="size-[1.15rem]" />
              </ArrowButton>
            </div>
          )}
        </div>
      </div>
      <ul
        ref={scroller}
        className={`-mx-5 mt-6 grid snap-x snap-mandatory grid-flow-col overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:-mx-8 md:mt-7 md:scroll-px-8 md:px-8 [&::-webkit-scrollbar]:hidden [&>li]:snap-start ${columns[size]}`}
      >
        {children}
      </ul>
    </section>
  );
}

function ArrowButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-ink/[0.06] text-ink transition-[background-color,opacity] hover:bg-ink/10 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-ink/[0.06]"
    >
      {children}
    </button>
  );
}
