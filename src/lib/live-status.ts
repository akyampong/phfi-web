"use client";

import { useSyncExternalStore } from "react";

/** Whether the channel is streaming, as /api/live reports it. */
export type LiveStatus = { live: boolean; title?: string };

const OFFLINE: LiveStatus = { live: false };
/** How often an open page asks whether the channel is live (the server answers from a 30-second cache). */
const POLL_MS = 15_000;

/**
 * One live check for the whole page, however many components want to know: the first one
 * to subscribe starts it (asking straight away, then every 15 seconds while the tab is in
 * view, and again whenever the tab or window comes back into view or the connection comes
 * back), and it stops when the last one goes. So the live signals appear on an open page
 * when a stream starts, without anyone refreshing.
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
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
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
