"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** One observer for every Reveal on the page; each element is let go once it has shown. */
let observer: IntersectionObserver | null = null;

function observe(element: Element) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        observer?.unobserve(entry.target);
      }
    },
    // Start once the element is a little way up from the bottom of the screen.
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  observer.observe(element);
  return () => observer?.unobserve(element);
}

type RevealProps = {
  /** The element to render; "li" lets a list item reveal itself. */
  as?: "div" | "li";
  /**
   * Its place in a row, from 0. Items in the same row start 90ms apart, so a row of
   * cards comes in left to right instead of all at once.
   */
  order?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Fades its content up the first time it scrolls into view. The motion itself is CSS
 * (see "Scroll reveal" in globals.css), so this only flags the moment to start.
 */
export function Reveal({ as: Tag = "div", order = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) return observe(ref.current);
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal=""
      className={className}
      style={order ? ({ "--i": order } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
