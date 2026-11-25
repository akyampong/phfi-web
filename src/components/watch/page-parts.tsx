import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { bodyText, buttonSecondary, groupUnderline, textLink } from "@/components/ui/styles";

/** The top of a Watch page: a large title and a line about what's here. */
export function PageIntro({ title, children, after }: { title: string; children: ReactNode; after?: ReactNode }) {
  return (
    <header className="flex flex-col gap-8">
      <div>
        <h1 className="text-page-sm text-ink">{title}</h1>
        <p className={`mt-5 max-w-[52ch] ${bodyText}`}>{children}</p>
      </div>
      {after}
    </header>
  );
}

/** A section's title, with a "View all" link on the right when there's more on another page. */
export function SectionHeading({ id, title, href, linkLabel = "View all" }: { id: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <h2 id={id} className="text-section text-ink">
        {title}
      </h2>
      {href && (
        <Link href={href} className={`${textLink} mb-1 shrink-0`}>
          <span className={groupUnderline}>{linkLabel}</span>
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Shown when there's nothing to list yet. */
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-6 rounded-squircle-md bg-canvas px-6 py-12 sm:px-10 sm:py-16">
      <div>
        <p className="text-title text-ink">{title}</p>
        <p className="mt-2 max-w-[52ch] text-body">{children}</p>
      </div>
      <Link href="/#meeting-times" className={buttonSecondary}>
        See meeting times
      </Link>
    </div>
  );
}
