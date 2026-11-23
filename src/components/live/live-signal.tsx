"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { useLiveStatus } from "@/lib/live-status";

/**
 * The red broadcast icon, shown only while the channel is streaming: it fades in, then
 * pulses to draw the eye. Nothing at all otherwise.
 */
export function LiveSignal({ className = "" }: { className?: string }) {
  const { live } = useLiveStatus();
  if (!live) return null;

  return (
    <span className={`live-appear inline-flex items-center ${className}`}>
      <Radio aria-hidden className="animate-live size-[1.1rem] text-live" strokeWidth={2.25} />
      <span className="sr-only">(live now)</span>
    </span>
  );
}

type LinkTarget = { label: string; href: string };

/**
 * A link that points somewhere else while the channel is streaming: `action` normally,
 * `liveAction` (when given) during a stream. `children` go after the label, e.g. an arrow.
 */
export function LiveAwareLink({
  action,
  liveAction,
  className,
  labelClassName,
  children,
}: {
  action: LinkTarget;
  liveAction?: LinkTarget;
  className?: string;
  /** Classes for the words alone (not the icon after them), e.g. an underline. */
  labelClassName?: string;
  children?: ReactNode;
}) {
  const { live } = useLiveStatus();
  const target = live && liveAction ? liveAction : action;
  return (
    <Link href={target.href} className={className}>
      <span className={labelClassName}>{target.label}</span>
      {children}
    </Link>
  );
}
