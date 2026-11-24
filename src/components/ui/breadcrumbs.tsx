import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Where this page sits: "Watch › Series › Building Capacity". The last step is this page. */
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
