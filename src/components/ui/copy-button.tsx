"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copies a value (an account number, say) and says so for two seconds. `label` names what's
 * copied for screen readers: "Copy Cedi account".
 */
export function CopyButton({
  value,
  label,
  className = "",
  compact = false,
  iconOnly = false,
}: {
  value: string;
  label: string;
  className?: string;
  /** Just the icon on phones, where space is tight (the label still names it for screen readers). */
  compact?: boolean;
  /** Just the icon, always: a small round button, for lists of numbers. */
  iconOnly?: boolean;
}) {
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

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label}: copied` : label}
        title={copied ? "Copied" : "Copy"}
        className={`inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-[background-color,color,scale] duration-200 hover:bg-ink/[0.06] hover:text-ink active:scale-95 ${
          copied ? "text-ink" : ""
        } ${className}`}
      >
        {copied ? <Check aria-hidden className="size-[1.1rem]" /> : <Copy aria-hidden className="size-[1.1rem]" />}
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied" : ""}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `${label}: copied` : label}
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-squircle-xs bg-ink/[0.06] px-3 text-sm font-semibold text-ink transition-[background-color,scale] duration-200 hover:bg-ink/10 active:scale-[0.98] ${className}`}
    >
      {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      <span aria-live="polite" className={compact ? "max-sm:sr-only" : ""}>
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
