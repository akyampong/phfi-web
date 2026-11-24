import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, HandHeart, Radio, Sprout } from "lucide-react";
import { AccountCard } from "@/components/give/accounts";
import { Faq } from "@/components/give/faq";
import { GiveWidget } from "@/components/give/give-widget";
import { PageTransition } from "@/components/layout/page-transition";
import { Reveal } from "@/components/ui/reveal";
import { bodyText, groupUnderline, textLink } from "@/components/ui/styles";
import { giveVerse, givingFaqs, givingPromises, givingSupports, paymentMethods } from "@/content/give";
import { TRANSLATION, bibleComUrl } from "@/lib/bible";

export const metadata: Metadata = {
  title: "Give",
  description: "Give to Purpose House Fellowship International online, by MTN Mobile Money, or by bank transfer to GT Bank Ghana.",
  alternates: { canonical: "/give" },
};

const supportIcons = [Radio, HandHeart, Sprout];

/**
 * The Give page, built like the giving pages people trust: one focused giving card as the
 * hero (on a dark band, beside why we give), then the other ways to give (mobile money and
 * bank, side by side), what giving does, and questions. Content is in content/give.ts.
 */
export default function GivePage() {
  return (
    <PageTransition>
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <div className="content-width flex flex-col gap-24 pt-2 md:gap-32 md:pt-4 lg:gap-40">
          {/* The hero: why we give on the left, the giving card on the right */}
          <section
            aria-labelledby="give-title"
            className="overflow-hidden rounded-squircle-lg bg-night bg-[radial-gradient(ellipse_at_0%_0%,rgba(255,255,255,0.07),transparent_55%)] text-night-text"
          >
            {/* Wide screens: words on the left, the card on the right. Phones: the title, then the
                card, then the reassurances and the verse, so the card isn't far down. */}
            <div className="grid gap-x-10 gap-y-10 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-12 lg:gap-y-0 lg:px-14 lg:py-16 xl:px-16">
              <div className="lg:col-span-6 lg:self-end">
                <h1 id="give-title" className="text-page text-white">
                  Give
                </h1>
                <p className="mt-5 max-w-[42ch] text-[clamp(1.0625rem,0.98rem+0.35vw,1.1875rem)] leading-[1.6] text-night-text">
                  Your generosity keeps the fellowship gathering, caring for one another and reaching further. Thank you for
                  giving.
                </p>
              </div>
              <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center xl:col-span-5 xl:col-start-8">
                <GiveWidget />
              </div>
              <div className="lg:col-span-6 lg:self-start lg:pt-8">
                <ul className="flex flex-col gap-3">
                  {givingPromises.map((promise) => (
                    <li key={promise} className="flex items-center gap-3 text-[0.98rem] text-white">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
                      </span>
                      {promise}
                    </li>
                  ))}
                </ul>
                <figure className="mt-12 max-w-[44ch] lg:mt-16">
                  <blockquote className="text-[1.0625rem] leading-relaxed text-white/90">
                    <p>“{giveVerse.text}”</p>
                  </blockquote>
                  <figcaption className="mt-3 text-sm text-night-muted">
                    <a href={bibleComUrl(giveVerse.passage)} target="_blank" rel="noreferrer" className="hover:text-white">
                      <span className="font-semibold text-white">{giveVerse.reference}</span> · {TRANSLATION}
                    </a>
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          <section aria-labelledby="ways-title">
            <Reveal className="max-w-[48rem]">
              <h2 id="ways-title" className="text-headline text-ink">
                Other ways to give
              </h2>
              <p className={`mt-4 ${bodyText}`}>Give straight from your mobile money wallet or your bank, in Ghana or from abroad.</p>
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 lg:gap-6">
              {paymentMethods.map((method, i) => (
                <Reveal key={method.id} order={i} className="flex">
                  <AccountCard method={method} />
                </Reveal>
              ))}
            </div>
          </section>

          <section aria-labelledby="supports-title">
            <Reveal>
              <h2 id="supports-title" className="text-headline text-ink">
                What your giving does
              </h2>
            </Reveal>
            <ul className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-3 lg:mt-14">
              {givingSupports.map((item, i) => {
                const Icon = supportIcons[i % supportIcons.length];
                return (
                  <Reveal as="li" key={item.title} order={i}>
                    <span className="flex size-12 items-center justify-center rounded-squircle-xs bg-ink/[0.06] text-ink">
                      <Icon aria-hidden className="size-[1.35rem]" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-6 text-title text-ink">{item.title}</h3>
                    <p className="mt-2.5 text-[1rem] leading-relaxed text-body">{item.text}</p>
                  </Reveal>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="faq-title" className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <h2 id="faq-title" className="text-headline text-ink">
                Questions
              </h2>
              <p className={`mt-4 ${bodyText}`}>Anything else about giving, we’re glad to help.</p>
              {/* Opens the contact drawer */}
              <Link href="#contact" className={`${textLink} mt-6`}>
                <span className={groupUnderline}>Get in touch</span>
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
            <Reveal className="lg:col-span-8">
              <Faq items={givingFaqs} />
            </Reveal>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
