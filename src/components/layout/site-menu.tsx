"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * The hamburger button and its drawer: a dark panel the full height of the window
 * that slides in over the page from the right (the whole screen on phones).
 * The drawer stays in the page when closed, off-screen and inert, so it can animate.
 */
/** The event the search shortcut sends to open the menu with its search field focused. */
export const OPEN_MENU_SEARCH = "phfi:open-menu-search";
/** Sent to close the menu, e.g. when its Sign in link opens the sign-in modal instead. */
export const CLOSE_MENU = "phfi:close-menu";

export function SiteMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Set when the menu is opened by the search shortcut, so it focuses search, not ×. */
  const focusSearchRef = useRef(false);

  // The ⌘/ shortcut (search-shortcut.tsx) opens the menu "for search" on narrow screens.
  useEffect(() => {
    const openForSearch = () => {
      focusSearchRef.current = true;
      setOpen(true);
    };
    const close = () => setOpen(false);
    window.addEventListener(OPEN_MENU_SEARCH, openForSearch);
    window.addEventListener(CLOSE_MENU, close);
    return () => {
      window.removeEventListener(OPEN_MENU_SEARCH, openForSearch);
      window.removeEventListener(CLOSE_MENU, close);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const openButton = openButtonRef.current;
    const search = focusSearchRef.current ? document.getElementById("menu-search") : null;
    focusSearchRef.current = false;
    // Only if it's showing (the menu hides its search field on wide screens, where the header has one)
    if (search instanceof HTMLInputElement && search.getClientRects().length > 0) {
      search.focus();
      search.select();
    } else {
      closeButtonRef.current?.focus();
    }

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      openButton?.focus();
    };
  }, [open]);

  // Keep Tab inside the drawer while it is open.
  function trapFocus(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="-mr-1 inline-flex size-10 cursor-pointer items-center justify-center text-ink"
      >
        {/* A modern two-line menu icon: two equal, rounded lines, wider than they are tall */}
        <svg aria-hidden viewBox="0 0 28 28" fill="none" className="size-7">
          <path d="M3 9h22M3 19h22" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
        </svg>
      </button>

      <div inert={!open} className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
        {/* Clicking the page beside the drawer closes the menu. */}
        <div aria-hidden onClick={() => setOpen(false)} className="absolute inset-0" />

        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          onKeyDown={trapFocus}
          // Close the menu when a link inside it is followed or a search is submitted.
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
          onSubmit={() => setOpen(false)}
          // Opening: it becomes visible at once (only the slide is animated), so focus can move
          // into it straight away; a hidden element can't take focus. Closing: visibility waits
          // for the slide to finish, so it slides out before it disappears.
          className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-night text-night-text duration-300 ease-out motion-reduce:transition-none sm:w-[420px] [&_:focus-visible]:outline-white ${
            open ? "visible translate-x-0 transition-[translate]" : "invisible translate-x-full transition-[translate,visibility]"
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-end px-5 sm:px-8 lg:h-16">
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="-mr-2 inline-flex size-10 cursor-pointer items-center justify-center text-night-text hover:text-white"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Sections are split by faint lines that run the full width of the drawer. */}
          <div className="flex flex-col divide-y divide-white/10 pb-6">{children}</div>
        </div>
      </div>
    </>
  );
}

/** One block of the drawer, padded so the lines between blocks can run edge to edge. */
export function DrawerSection({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-11 first:pt-3 sm:px-8 ${className}`}>{children}</div>;
}
