import Link from "next/link";
import { Radio } from "lucide-react";
import type { NavItem } from "@/config/site";

type NavListProps = {
  items: NavItem[];
  isLive: boolean;
  activeHref?: string | null;
  variant?: "desktop" | "drawer";
};

/** Presentational list of main menu links. Used on the server and the client. */
export function NavList({ items, isLive, activeHref = null, variant = "desktop" }: NavListProps) {
  if (variant === "drawer") {
    // Large links on the dark drawer; the current section is white, the rest grey.
    return (
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.href === activeHref;
          const live = isLive && item.showsLive;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 py-1.5 text-[1.3rem] leading-snug transition-colors ${
                  active ? "text-white" : "text-night-text/80 hover:text-white"
                }`}
              >
                {item.label}
                {live && <LiveBadge />}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex h-full items-stretch gap-7">
      {items.map((item) => {
        const active = item.href === activeHref;
        const live = isLive && item.showsLive;
        return (
          <li key={item.href} className="flex">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-1.5 text-base font-normal transition-colors ${
                live ? "text-live" : active ? "text-ink" : "text-body hover:text-ink"
              }`}
            >
              {live && <Radio aria-hidden className="animate-live size-4" strokeWidth={2.25} />}
              {/* The underline sits just under the label, not at the bottom of the header. */}
              <span
                // The underline draws in from the left on hover, like every underline on the site,
                // and stays for the current section. It's the calendar's blue (#0a84ff), the one
                // accent colour in the site's UI.
                className={`relative after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:transition-[scale,background-color] after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  live
                    ? "after:scale-x-0"
                    : active
                      ? "after:scale-x-100 after:bg-[#0a84ff]"
                      : "after:scale-x-0 after:bg-[#0a84ff] group-hover:after:scale-x-100"
                }`}
              >
                {item.label}
              </span>
              {live && <span className="sr-only">(streaming now)</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** The same red tag as beside the logo (live-pill.tsx): the pulsing broadcast icon and "Live". */
function LiveBadge() {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-squircle-xs bg-live px-2.5 text-[0.72rem] font-bold uppercase leading-none tracking-[0.06em] text-white">
      <Radio aria-hidden className="animate-live size-3.5" strokeWidth={2.25} />
      Live
      <span className="sr-only">now</span>
    </span>
  );
}

/** Returns the href of the menu item that matches the current path. */
export function findActiveHref(items: NavItem[], pathname: string): string | null {
  const matches = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const item = items.find((i) => matches(i.href) || i.match?.some(matches));
  return item?.href ?? null;
}
