"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";

/**
 * The hamburger button and its drawer: a dark panel the full height of the window
 * that slides in over the page from the right (the whole screen on phones).
 * The drawer stays in the page when closed, off-screen and inert, so it can animate.
 */
export function SiteMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const openButton = openButtonRef.current;
    closeButtonRef.current?.focus();

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
          className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-night text-night-text transition-[translate,visibility] duration-300 ease-out motion-reduce:transition-none sm:w-[420px] [&_:focus-visible]:outline-white ${
            open ? "visible translate-x-0" : "invisible translate-x-full"
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
