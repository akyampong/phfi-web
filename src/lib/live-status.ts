"use client";

import { useSyncExternalStore } from "react";

/** Whether the channel is streaming, as /api/live reports it. */
export type LiveStatus = { live: boolean; title?: string };

const OFFLINE: LiveStatus = { live: false };
const POLL_MS = 60_000;

/**
 * One live check for the whole page, however many components want to know: the first one
 * to subscribe starts it (asking straight away, then once a minute and whenever the tab
 * comes back into view), and it stops when the last one goes.
 */
let status: LiveStatus | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

async function check() {
  if (document.visibilityState !== "visible") return;
  try {
    const response = await fetch("/api/live", { cache: "no-store" });
    if (!response.ok) return;
    const next: LiveStatus = await response.json();
    // Only tell components when something actually changed.
    if (status && status.live === next.live && status.title === next.title) return;
    status = next;
    for (const listener of listeners) listener();
  } catch {
    // Offline or the server is busy: keep what we last knew.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void check();
    timer = setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    }
  };
}

/**
 * The current live status. `initial` is what the server knew when it rendered the page,
 * used until the first check comes back; without it, the page starts as not live.
 */
export function useLiveStatus(initial?: LiveStatus): LiveStatus {
  return useSyncExternalStore(
    subscribe,
    () => status ?? initial ?? OFFLINE,
    () => initial ?? OFFLINE,
  );
}
