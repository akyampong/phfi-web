import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, Smartphone } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CopyButton } from "@/components/ui/copy-button";
import { Reveal } from "@/components/ui/reveal";
import { bodyText, groupUnderline, textLink } from "@/components/ui/styles";
import { giveVerse, givingSupports, paymentMethods, type PaymentMethod } from "@/content/give";
import { TRANSLATION, bibleComUrl } from "@/lib/bible";

export const metadata: Metadata = {
  title: "Give",
  description: "Give to Purpose House Fellowship International by MTN Mobile Money or bank transfer to GT Bank Ghana.",
  alternates: { canonical: "/give" },
};

/**
 * The Give page: why we give, the ways to give (MTN Mobile Money and GT Bank Ghana, every
 * number with a copy button), and what giving supports. Details are in content/give.ts.
 */
export default function GivePage() {
  return (
    <PageTransition>
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <div className="content-width flex flex-col gap-24 pt-12 md:gap-32 md:pt-16 lg:gap-40 lg:pt-20">
          <div className="flex flex-col gap-14 md:gap-20">
            <header className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
              <div className="lg:col-span-7">
                <h1 className="text-display text-ink">Give</h1>
                <p className={`mt-5 max-w-[48ch] ${bodyText}`}>
                  Your generosity keeps the fellowship gathering, caring for one another and reaching further. Thank you for
                  giving.
                </p>
              </div>
              <figure className="lg:col-span-5">
                <blockquote className="text-[clamp(1.125rem,1.02rem+0.4vw,1.35rem)] leading-relaxed text-ink">
                  <p>“{giveVerse.text}”</p>
                </blockquote>
                <figcaption className="mt-3 text-sm text-muted">
                  <a href={bibleComUrl(giveVerse.passage)} target="_blank" rel="noreferrer" className="hover:text-ink">
                    <span className="font-semibold text-ink">{giveVerse.reference}</span> · {TRANSLATION}
                  </a>
                </figcaption>
              </figure>
            </header>

            <section aria-labelledby="ways-title">
              <h2 id="ways-title" className="sr-only">
                Ways to give
              </h2>
              <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
                {paymentMethods.map((method) => (
                  <Method key={method.id} method={method} />
                ))}
              </div>
            </section>
          </div>

          <section aria-labelledby="supports-title">
            <Reveal>
              <h2 id="supports-title" className="text-headline text-ink">
                What your giving does
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-3 lg:mt-14">
              {givingSupports.map((item, i) => (
                <Reveal as="li" key={item.title} order={i}>
                  <span aria-hidden className="text-sm font-semibold tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-title text-ink">{item.title}</h3>
                  <p className="mt-2.5 text-[1rem] leading-relaxed text-body">{item.text}</p>
                </Reveal>
              ))}
            </ul>
          </section>

          <Reveal className="flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-headline text-ink">Questions about giving?</h2>
              <p className={`mt-4 max-w-[48ch] ${bodyText}`}>
                For bank details for international transfers, a receipt, or anything else, we’re glad to help.
              </p>
            </div>
            {/* Opens the contact drawer */}
            <Link href="#contact" className={`${textLink} mb-1 shrink-0`}>
              <span className={groupUnderline}>Get in touch</span>
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}

const methodIcons = { mobile: Smartphone, bank: Landmark };

/** One way to give: who it's to, then each number, large and with a copy button. */
function Method({ method }: { method: PaymentMethod }) {
  const Icon = methodIcons[method.icon];
  return (
    <article aria-labelledby={`${method.id}-title`} className="rounded-squircle-lg p-6 ring-1 ring-rule ring-inset sm:p-8 lg:p-10 dark:bg-canvas">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-squircle-xs bg-ink/[0.06] text-ink">
          <Icon aria-hidden className="size-[1.35rem]" strokeWidth={1.75} />
        </span>
        <div>
          <h3 id={`${method.id}-title`} className="text-title text-ink">
            {method.name}
          </h3>
          <p className="mt-1 text-[0.95rem] text-muted">{method.description}</p>
        </div>
      </div>

      <dl className="mt-8 flex flex-col gap-7">
        <div>
          <dt className="text-sm text-muted">Account name</dt>
          <dd className="mt-1 text-lg font-medium text-ink">{method.accountName}</dd>
        </div>
        {method.details.map((detail) => (
          <div key={detail.label} className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <dt className="text-sm text-muted">
                {detail.label}
                {detail.note && <span className="text-muted/80"> · {detail.note}</span>}
              </dt>
              <dd className="mt-1 text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] font-medium leading-tight tracking-[-0.01em] tabular-nums text-ink">
                {detail.value}
              </dd>
            </div>
            <CopyButton value={detail.copy ?? detail.value} label={`Copy ${detail.label}`} />
          </div>
        ))}
      </dl>

      {method.notes?.map((note) => (
        <p key={note} className="mt-8 text-[0.95rem] leading-relaxed text-body">
          {note}
        </p>
      ))}
    </article>
  );
}
