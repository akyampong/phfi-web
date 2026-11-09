import Link from "next/link";
import type { NavItem } from "@/config/site";

type NavListProps = {
  items: NavItem[];
  isLive: boolean;
  activeHref?: string | null;
  variant?: "desktop" | "mobile";
};

/** Presentational list of main menu links. Used on the server and the client. */
export function NavList({ items, isLive, activeHref = null, variant = "desktop" }: NavListProps) {
  if (variant === "mobile") {
    return (
      <ul className="divide-y divide-rule border-y border-rule">
        {items.map((item) => {
          const active = item.href === activeHref;
          const live = isLive && item.href === "/live";
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between py-4 font-serif text-2xl font-semibold ${
                  active ? "text-brand" : "text-ink"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.label}
                  {live && <LiveBadge />}
                </span>
                <span aria-hidden className="text-base text-muted">
                  →
                </span>
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
        const live = isLive && item.href === "/live";
        return (
          <li key={item.href} className="flex">
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-1.5 text-[0.95rem] font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:transition-colors ${
                live
                  ? "text-live"
                  : active
                    ? "text-brand after:bg-brand"
                    : "text-ink after:bg-transparent hover:text-brand"
              }`}
            >
              {live && <span aria-hidden className="animate-live size-2 rounded-full bg-live" />}
              {item.label}
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
    <span className="label-caps inline-flex items-center gap-1.5 rounded-full bg-live px-2 py-1 text-[0.6rem] text-white">
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
