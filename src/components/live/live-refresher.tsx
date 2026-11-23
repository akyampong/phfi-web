"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-checks the live status every 30 seconds while the page is visible, so the player
 * appears when a stream starts (and the title and viewer count stay current) without a reload.
 * The player itself is not reloaded: only what changed is updated.
 */
export function LiveRefresher({ every = 30_000 }: { every?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, every);
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, every]);

  return null;
}
