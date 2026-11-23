"use client";

import { useEffect, useSyncExternalStore } from "react";
import { OPEN_MENU_SEARCH } from "./site-menu";

/** True on Apple devices, where the shortcut is ⌘/ rather than Ctrl+/. False on the server. */
function useIsApple() {
  return useSyncExternalStore(
    () => () => {},
    () => /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac"),
    () => false,
  );
}

/**
 * ⌘/ (Ctrl+/ on Windows and Linux) jumps into search from anywhere on the site. On wide
 * screens that's the search bar in the header; where the header has none, it opens the menu
 * and focuses the search field there. Escape leaves the field again.
 *
 * Renders nothing: it only listens for the keys. Place it once, in the header.
 */
export function SearchShortcut() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const field = document.activeElement;
      if (e.key === "Escape" && field instanceof HTMLInputElement && field.type === "search") {
        field.blur();
        return;
      }
      if (e.key !== "/" || !(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey) return;
      e.preventDefault();

      const header = document.getElementById("header-search");
      // The header's search bar is hidden below the lg breakpoint (no layout box then)
      if (header instanceof HTMLInputElement && header.getClientRects().length > 0) {
        header.focus();
        header.select();
        return;
      }
      // Otherwise ask the menu to open with its search field focused (site-menu.tsx)
      window.dispatchEvent(new Event(OPEN_MENU_SEARCH));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}

/** The shortcut, shown inside the header search bar: "⌘/" on Apple devices, "Ctrl /" elsewhere. */
export function SearchShortcutHint({ className = "" }: { className?: string }) {
  const apple = useIsApple();
  return (
    // A small black key, its corners a smaller squircle than the search bar's so the two curves
    // sit evenly inside one another (5px plain corners where squircles aren't supported)
    <kbd
      aria-hidden
      className={`pointer-events-none flex h-7 items-center rounded-[5px] bg-ink px-2 font-sans text-[0.8125rem] font-semibold leading-none text-white supports-[corner-shape:squircle]:rounded-[10px] supports-[corner-shape:squircle]:[corner-shape:squircle] ${className}`}
    >
      {apple ? "⌘ /" : "Ctrl /"}
    </kbd>
  );
}
