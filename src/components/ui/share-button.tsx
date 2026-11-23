"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ShareIcon } from "@/components/home/verse-actions";
import { actionButton } from "./styles";

/**
 * Share a page: the phone's share sheet where there is one, otherwise copy the link.
 * `path` is the page's address on this site, e.g. "/live" or "/watch/faith-that-waits".
 */
export function ShareButton({ title, path, className = actionButton }: { title: string; path: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // The share sheet was closed, or copying isn't allowed here: nothing to do.
    }
  }

  return (
    <button type="button" onClick={share} className={className}>
      {copied ? <Check aria-hidden className="size-4" /> : <ShareIcon className="size-4" />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
