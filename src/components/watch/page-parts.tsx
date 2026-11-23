import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { bodyText, buttonSecondary, groupUnderline, textLink } from "@/components/ui/styles";

/** The top of a Watch page: a large title and a line about what's here. */
export function PageIntro({ title, children, after }: { title: string; children: ReactNode; after?: ReactNode }) {
  return (
    <header className="flex flex-col gap-8">
      <div>
        <h1 className="text-display text-ink">{title}</h1>
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
      <h2 id={id} className="text-headline text-ink">
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

/** Where this page sits under Watch: "Watch › Series › Building Capacity". The last step is this page. */
export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {trail.map((step, i) => (
          // On phones the current page is left off: its title is right below, and the trail stays on one line.
          <li key={step.label} className={`items-center gap-1 ${i > 0 && i === trail.length - 1 ? "hidden sm:flex" : "flex"}`}>
            {i > 0 && <ChevronRight aria-hidden className="size-3.5" />}
            {step.href ? (
              <Link href={step.href} className="transition-colors hover:text-ink">
                {step.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {step.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
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
