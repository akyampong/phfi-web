"use client";

import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/site";
import { NavList, findActiveHref } from "./nav-list";

type NavLinksProps = {
  items: NavItem[];
  isLive: boolean;
  variant?: "desktop" | "mobile";
};

/** Main menu links with the current section highlighted. Render inside <Suspense>. */
export function NavLinks({ items, isLive, variant }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <NavList
      items={items}
      isLive={isLive}
      variant={variant}
      activeHref={findActiveHref(items, pathname)}
    />
  );
}
