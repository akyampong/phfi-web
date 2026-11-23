import Link from "next/link";
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
              {live && <span aria-hidden className="animate-live size-2 rounded-full bg-live" />}
              {/* The underline sits just under the label, not at the bottom of the header. */}
              <span
                // The underline grows out from the centre on hover, and stays for the current section
                className={`relative after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-center after:rounded-full after:transition-[scale,background-color] after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  live
                    ? "after:scale-x-0"
                    : active
                      ? "after:scale-x-100 after:bg-ink"
                      : "after:scale-x-0 after:bg-rule-strong group-hover:after:scale-x-100"
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

function LiveBadge() {
  return (
    <span className="label-caps inline-flex items-center gap-1.5 rounded-squircle-xs bg-live px-2 py-1 text-[0.6rem] text-white">
      <span aria-hidden className="animate-live size-1.5 rounded-full bg-white" />
      Live now
    </span>
  );
}

/** Returns the href of the menu item that matches the current path. */
export function findActiveHref(items: NavItem[], pathname: string): string | null {
  const matches = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const item = items.find((i) => matches(i.href) || i.match?.some(matches));
  return item?.href ?? null;
}
