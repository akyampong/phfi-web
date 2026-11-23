"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { useLiveStatus, type LiveStatus } from "@/lib/live-status";

/**
 * The red "Live" tag beside the logo, shown only while the channel is streaming. Clicking it
 * opens /live. Starts from the server's answer, then follows the page's shared live check
 * (lib/live-status.ts), so it appears on whatever page someone is reading when a stream
 * starts, and disappears when it ends.
 */
export function LivePill({ initial }: { initial: LiveStatus }) {
  const state = useLiveStatus(initial);
  if (!state.live) return null;

  return (
    <Link
      href="/live"
      title={state.title ? `Live now: ${state.title}` : "Live now"}
      className="live-appear inline-flex h-8 items-center gap-1.5 rounded-squircle-xs bg-live px-2.5 text-[0.78rem] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-live/90"
    >
      {/* Pulses like the other live icons */}
      <Radio aria-hidden className="animate-live size-4" strokeWidth={2.25} />
      Live
      <span className="sr-only">now{state.title ? `: ${state.title}` : ""}. Watch the stream</span>
    </Link>
  );
}
