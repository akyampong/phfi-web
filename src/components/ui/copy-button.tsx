"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copies a value (an account number, say) and says so for two seconds. `label` names what's
 * copied for screen readers: "Copy Cedi account".
 */
export function CopyButton({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Copying isn't allowed here (an old browser, say): the number is on screen to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label}: copied` : label}
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-squircle-xs bg-ink/[0.06] px-3 text-sm font-semibold text-ink transition-[background-color,scale] duration-200 hover:bg-ink/10 active:scale-[0.98] ${className}`}
    >
      {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
