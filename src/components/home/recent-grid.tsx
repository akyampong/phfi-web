import Link from "next/link";
import { ArrowRight, FileText, Play } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { textLink } from "@/components/ui/styles";
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
          View all
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
  const Icon = isRecap ? Play : FileText;
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
        <span className="label-caps absolute left-3 top-3 hidden items-center gap-1.5 rounded-squircle-xs bg-black/55 px-2 py-1 text-[0.62rem] text-white backdrop-blur-sm sm:inline-flex">
          <Icon aria-hidden className={`size-3 ${isRecap ? "fill-current" : ""}`} />
          {kind}
        </span>
      </span>

      <span className="block sm:mt-5">
        {/* On phones the picture is too small for the label, so it moves above the title */}
        <span className="mb-1 block text-xs font-medium text-muted sm:hidden">{kind}</span>
        <h3 className="text-title text-ink group-hover:underline group-hover:underline-offset-4">{item.title}</h3>
        {item.subtitle && <p className="mt-1 text-[0.95rem] font-medium text-body">{item.subtitle}</p>}
        <p className="label-caps mt-2 text-[0.66rem] text-muted sm:mt-3">
          {formatDate(item.date)} · {item.length}
        </p>
        <p className="mt-3 line-clamp-3 hidden text-[0.95rem] leading-relaxed text-body sm:block">{item.excerpt}</p>
      </span>
    </Link>
  );
}
