import { connection } from "next/server";
import type { NavItem } from "@/config/site";
import { isLiveNow } from "@/lib/youtube";
import { NavLinks } from "./nav-links";

type LiveNavProps = { items: NavItem[]; variant?: "desktop" | "drawer" };

/**
 * The main menu with the live indicator switched on while the channel is streaming.
 * Render inside <Suspense> with a plain NavList as the fallback: the live check is
 * fetched per request (cached for 30 seconds) and must not hold up the header.
 */
export async function LiveNav({ items, variant }: LiveNavProps) {
  await connection(); // Always checked at request time, never baked into the prerendered page.
  const isLive = await isLiveNow();
  return <NavLinks items={items} isLive={isLive} variant={variant} />;
}
