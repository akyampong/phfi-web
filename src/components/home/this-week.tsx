import Image from "next/image";
import Link from "next/link";
import { buttonPrimary } from "@/components/ui/styles";
import type { ThisWeek as ThisWeekData } from "@/content/home";
import { Reveal } from "@/components/ui/reveal";
import { VerseActions } from "./verse-actions";

/** The verse of the week is always the New King James Version (Bible.com's version 114). */
const TRANSLATION = "NKJV";
const bibleComUrl = (passage: string) => `https://www.bible.com/bible/114/${passage}.${TRANSLATION}`;

/** The two column headings, "This week's verse" and "Prayer points", share one style. */
const columnHeading =
  "flex h-9 items-center gap-2.5 text-[clamp(1.375rem,1.2rem+0.5vw,1.625rem)] font-semibold tracking-[-0.015em] text-ink";

/**
 * This week: the verse of the week, set large, beside the week's three prayer points, on the
 * page itself with no panel, so it reads as a calm pause after the hero. Two matching headings,
 * "This week's verse" and "Prayer points", sit level across the top and tie the pair together.
 */
export function ThisWeek({ week }: { week: ThisWeekData }) {
  const { verse } = week;
  const url = bibleComUrl(verse.passage);
  const shareText = `“${verse.text}” ${verse.reference} (${TRANSLATION})`;

  return (
    <section aria-labelledby="this-week-title">
      {/* The verse takes seven of twelve columns and the prayer points a narrow four, starting
          a full column further on, so a wide gutter (about 210px on a large screen) keeps the
          two apart */}
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-x-24">
        {/* The verse of the week */}
        <Reveal className="lg:col-span-7">
          <h2 id="this-week-title" className={columnHeading}>
            {/* The YouVersion Bible App icon (from YouVersion's own site), linking to the passage
                on Bible.com: the same place the reference below goes */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 transition-transform duration-200 hover:scale-105"
            >
              <Image
                src="/assets/youversion-bible-app.png"
                alt={`Read ${verse.reference} in the YouVersion Bible App`}
                width={28}
                height={28}
                className="size-7"
              />
            </a>
            This week’s verse
          </h2>
          <figure className="mt-7">
            <blockquote className="text-[clamp(1.4375rem,1.1rem+1.1vw,2.125rem)] font-normal leading-[1.28] tracking-[-0.02em] text-ink text-pretty">
              <p>“{verse.text}”</p>
            </blockquote>
            <figcaption className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
              {/* The reference opens the passage on Bible.com, to read on */}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:underline"
              >
                <cite className="not-italic">
                  <span className="font-semibold text-ink">{verse.reference}</span>
                  <span className="text-muted"> · {TRANSLATION}</span>
                </cite>
                <span className="sr-only"> (read on Bible.com)</span>
              </a>
              <VerseActions text={shareText} url={url} />
            </figcaption>
          </figure>
        </Reveal>

        {/* The prayer points */}
        <Reveal order={1} className="lg:col-span-4 lg:col-start-9">
          <h3 className={columnHeading}>
            {/* The praying hands emoji in a medium-dark skin tone, in the visitor's own emoji style */}
            <span aria-hidden className="text-[1.35rem] leading-none">🙏🏾</span>
            Prayer points
          </h3>
          <ol className="mt-7 flex flex-col gap-6">
            {week.prayerPoints.map((point, i) => (
              // Number and text share a baseline, so the number sits on the first line
              <li key={point} className="flex items-baseline gap-4">
                <span aria-hidden className="w-6 shrink-0 text-[0.95rem] font-semibold tabular-nums text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[1.0625rem] leading-[1.65] text-body">{point}</p>
              </li>
            ))}
          </ol>
          <Link href="/prayer" className={`${buttonPrimary} mt-9`}>
            Send a prayer request
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
