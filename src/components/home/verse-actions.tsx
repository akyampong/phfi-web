"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Two quiet icons beside the verse: share (the box-and-arrow icon people know from their
 * phones, opening the share sheet so it can go straight to WhatsApp or Messages) and copy.
 * Share only shows where the browser has a share sheet.
 */
export function VerseActions({ text, url }: { text: string; url: string }) {
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const [copied, setCopied] = useState(false);

  async function share() {
    try {
      await navigator.share({ text, url });
    } catch {
      // The visitor closed the share sheet: nothing to do.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copying isn't allowed here: nothing to do.
    }
  }

  return (
    <div className="flex items-center gap-1">
      {canShare && (
        <button type="button" onClick={share} aria-label="Share the verse" className={iconButton}>
          <ShareIcon />
        </button>
      )}
      <button type="button" onClick={copy} aria-label={copied ? "Copied" : "Copy the verse"} className={iconButton}>
        {copied ? (
          <Check aria-hidden className="size-[1.15rem]" strokeWidth={2} />
        ) : (
          <Copy aria-hidden className="size-[1.15rem]" strokeWidth={1.75} />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Verse copied" : ""}
      </span>
    </div>
  );
}

const iconButton =
  "flex size-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink";

/**
 * The share icon from iPhones and Macs: an arrow rising out of an open, rounded box. Drawn
 * here because the icon set's version has a squarer, flatter box that reads less clearly.
 */
export function ShareIcon({ className = "size-[1.2rem]" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* The box, open at the top where the arrow comes out */}
      <path d="M8.5 9.5H7.25A2.25 2.25 0 0 0 5 11.75v7A2.25 2.25 0 0 0 7.25 21h9.5A2.25 2.25 0 0 0 19 18.75v-7a2.25 2.25 0 0 0-2.25-2.25H15.5" />
      {/* The arrow */}
      <path d="M12 14.5V3" />
      <path d="M8.75 6.25 12 3l3.25 3.25" />
    </svg>
  );
}
