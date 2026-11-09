"use client";

import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

/** The menu button and slide-down panel used below the large breakpoint. */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close the panel when any link inside it is followed.
  function handlePanelClick(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-canvas"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        onClick={handlePanelClick}
        className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-paper"
      >
        <div className="container-page flex flex-col gap-8 pb-12 pt-6">{children}</div>
      </div>
    </div>
  );
}
