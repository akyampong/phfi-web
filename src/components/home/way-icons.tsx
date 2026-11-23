import type { ReactNode } from "react";
import type { Way } from "@/content/home";

/**
 * Custom icons for "Find your way in", drawn as one set: a fine ink outline on a 32px grid.
 * When the pointer is over the icon's card (or a keyboard user tabs into it), the icon's
 * main shape fills in solid, and the small details inside it turn white so they still read,
 * which shows at a glance which card has focus. The card is the "group/way" around it.
 */

/** The main shape: empty until its card is hovered or focused, then filled with ink. */
const body =
  "fill-transparent transition-[fill] duration-300 ease-out group-hover/way:fill-current group-focus-within/way:fill-current";
/** Lines drawn inside the main shape: ink, then white once the shape behind them fills. */
const detailLine =
  "transition-[stroke] duration-300 ease-out group-hover/way:stroke-paper group-focus-within/way:stroke-paper";
/** Solid dots inside the main shape: ink, then white. */
const detailDot =
  "fill-current transition-[fill] duration-300 ease-out group-hover/way:fill-paper group-focus-within/way:fill-paper";

const paths: Record<Way["icon"], ReactNode> = {
  // A screen with a live broadcast on it
  live: (
    <>
      <rect className={body} x="4" y="7" width="24" height="17" rx="3.5" />
      <path d="M12 28h8" />
      <circle className={detailDot} cx="16" cy="15.5" r="1.75" stroke="none" />
      <path className={detailLine} d="M12.6 12.1a4.8 4.8 0 0 0 0 6.8M19.4 12.1a4.8 4.8 0 0 1 0 6.8" />
    </>
  ),
  // A play button inside a circling arrow: watch it again, whenever you like
  watch: (
    <>
      <path className={body} d="M13.5 11.6v8.8l7-4.4z" />
      <path d="M26.5 16A10.5 10.5 0 1 1 23.4 8.6" />
      <path d="M24.2 4.4v4.6h-4.6" />
    </>
  ),
  // An open book with a ribbon marking the place
  read: (
    <>
      <path
        className={body}
        d="M16 9.2c-2.6-2-6.4-2.6-11-2.2v16.6c4.6-.4 8.4.2 11 2.2 2.6-2 6.4-2.6 11-2.2V7c-4.6-.4-8.4.2-11 2.2z"
      />
      <path className={detailLine} d="M16 9.2v16.6" />
      <path className={detailLine} d="M21 7.4v6.6l1.9-1.4 1.9 1.4V7.1" />
    </>
  ),
  // Two people side by side
  connect: (
    <>
      <circle className={body} cx="21.75" cy="12.5" r="3.5" />
      <path d="M20.4 19.2c.4-.1.9-.2 1.4-.2 3.4 0 6.2 2.7 6.2 6.4" />
      <circle className={body} cx="12" cy="11.5" r="4.25" />
      <path className={body} d="M4.5 26.5c0-4.3 3.4-7.5 7.5-7.5s7.5 3.2 7.5 7.5z" />
    </>
  ),
};

/** One of the "Find your way in" icons. Place it inside an element with the "group/way" class. */
export function WayIcon({ name }: { name: Way["icon"] }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-9 text-ink"
    >
      {paths[name]}
    </svg>
  );
}
