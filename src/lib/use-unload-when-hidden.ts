"use client";

import { useLayoutEffect, type RefObject } from "react";

/**
 * Unloads an iframe while its page is hidden, and loads it again when the page comes back.
 *
 * Next keeps pages you navigate away from alive but hidden (display: none), so going Back is
 * instant. Hidden doesn't stop a YouTube player, though: a stream would carry on playing out
 * of sight. React runs effect cleanups when a page is hidden, so the cleanup swaps the frame for
 * a blank page, and the effect puts the real address (kept in data-src) back when it's shown.
 * For a live stream that's what you want anyway: it rejoins at the current moment.
 */
export function useUnloadWhenHidden(ref: RefObject<HTMLIFrameElement | null>) {
  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const src = frame.dataset.src;
    if (src && frame.getAttribute("src") !== src) frame.setAttribute("src", src);
    return () => frame.setAttribute("src", "about:blank");
  }, [ref]);
}
