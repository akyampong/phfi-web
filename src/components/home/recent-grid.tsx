import Link from "next/link";
import { ArrowRight, File, Play } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { groupUnderline, textLink } from "@/components/ui/styles";
import type { ContentItem } from "@/content/home";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/reveal";

/** The latest recaps and articles: a four-column grid on desktop, compact rows on phones. */
export function RecentGrid({ items }: { items: ContentItem[] }) {
  return (
    <section aria-labelledby="recent-title">
      <Reveal className="flex items-end justify-between gap-6">
        <h2 id="recent-title" className="text-headline text-ink">
          Recently at Purpose House
        </h2>
        <Link href="/watch" className={`${textLink} mb-1 shrink-0`}>
          <span className={groupUnderline}>View all</span>
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <ul className="mt-8 grid gap-x-6 gap-y-8 sm:mt-10 sm:grid-cols-2 sm:gap-y-14 lg:mt-12 lg:grid-cols-4 lg:gap-x-8">
        {items.map((item, i) => (
          // Four to a row on desktop, so each row comes in left to right
          <Reveal as="li" key={item.slug} order={i % 4}>
            <ContentCard item={item} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  const isRecap = item.kind === "recap";
  // Both icons solid: a play button for recaps, a plain page (no lines) for articles
  const Icon = isRecap ? Play : File;
  const kind = isRecap ? "Recap" : "Article";

  return (
    // Phones: a small picture beside the text. From sm up: picture above, as a card.
    <Link href={item.href} className="group grid grid-cols-[7rem_1fr] items-start gap-4 sm:block">
      <span className="relative block aspect-[4/3] overflow-hidden rounded-squircle-sm bg-canvas sm:aspect-[16/10]">
        <Cover
          photo={item.photo}
          art={item.art}
          uid={`recent-${item.slug}`}
          sizes="(min-width: 1504px) 340px, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 112px"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {/* The kind of post, on frosted glass like the hero's arrows and the play button */}
        <span className="absolute left-3 top-3 hidden items-center gap-1.5 rounded-squircle-xs bg-white/15 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-xl backdrop-brightness-[0.85] sm:inline-flex">
          <Icon aria-hidden className="size-3 fill-current" strokeWidth={2} />
          {kind}
        </span>
      </span>

      <span className="block sm:mt-5">
        {/* On phones the picture is too small for the label, so it moves above the title */}
        <span className="mb-1 block text-xs font-medium text-muted sm:hidden">{kind}</span>
        {/* Just the title, then the date, then the summary: no scripture line, so there are
            only three levels of text on a card */}
        <h3 className="text-title text-ink">
          {/* Underline draws in from the left while the card is hovered */}
          <span className={groupUnderline}>{item.title}</span>
        </h3>
        {/* Date and length in capitals with normal letter spacing: "NOV 10, 2026 · 48 MIN" */}
        <p className="mt-2 text-xs font-medium uppercase text-muted">
          {formatDate(item.date)} · {item.length}
        </p>
        <p className="mt-3 line-clamp-3 hidden text-[0.95rem] leading-relaxed text-body sm:block">{item.excerpt}</p>
      </span>
    </Link>
  );
}
