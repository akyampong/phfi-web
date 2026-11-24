import Link from "next/link";
import { Play } from "lucide-react";
import { TonalArtwork } from "@/components/art/artwork";
import { Cover } from "@/components/art/cover";
import { groupUnderline, metaCaps } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";
import { formatLength, type Message, type Series } from "@/lib/watch-types";

/** Frosted glass, as on the home page's cards and play buttons. */
const glass =
  "bg-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-xl backdrop-brightness-[0.85]";

/**
 * A message: its thumbnail (with the length in the corner), then the title and the date and
 * meeting. Same rhythm as the home page's cards.
 */
export function MessageCard({
  message,
  sizes,
  preload = false,
  withSummary = false,
  large = false,
}: {
  message: Message;
  sizes: string;
  preload?: boolean;
  /** Add a line or two about it (in the full list; rows keep to the title and date). */
  withSummary?: boolean;
  /** Larger: rounder picture and a bigger title, for the latest messages at the top of /watch. */
  large?: boolean;
}) {
  return (
    <Link href={`/watch/${message.slug}`} className="group block">
      <span className={`relative block aspect-video overflow-hidden bg-canvas ${large ? "rounded-squircle-md" : "rounded-squircle-sm"}`}>
        <Cover
          photo={message.image}
          art={message.art}
          uid={`message-${message.slug}`}
          sizes={sizes}
          preload={preload}
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        {message.seconds !== undefined && (
          <span className={`absolute bottom-3 right-3 rounded-squircle-xs px-2 py-0.5 text-xs font-semibold tabular-nums ${glass}`}>
            {formatLength(message.seconds)}
          </span>
        )}
      </span>
      <span className={`block ${large ? "mt-5" : "mt-4"}`}>
        {/* One line, ending in "…" when it's longer; the whole title shows on hover */}
        <h3
          title={message.title}
          // Room below for the hover underline, which the one-line clip would otherwise cut off
          className={`line-clamp-1 pb-[0.2em] ${large ? "text-[clamp(1.25rem,1.1rem+0.5vw,1.5rem)] font-medium leading-snug tracking-[-0.015em] text-ink" : "text-title text-ink"}`}
        >
          <span className={groupUnderline}>{message.title}</span>
        </h3>
        <p className={`mt-2 ${metaCaps}`}>
          {formatDate(message.date)}
          {message.meeting && ` · ${message.meeting}`}
        </p>
        {withSummary && message.summary && (
          <p className="mt-2.5 line-clamp-2 text-[0.95rem] leading-relaxed text-body">{message.summary}</p>
        )}
      </span>
    </Link>
  );
}

/** A message in a narrow list (beside the player): a small thumbnail with the title and date. */
export function MessageRow({ message, current = false, label }: { message: Message; current?: boolean; label?: string }) {
  return (
    <Link
      href={`/watch/${message.slug}`}
      aria-current={current ? "page" : undefined}
      className="group grid grid-cols-[8.5rem_1fr] items-start gap-3.5"
    >
      <span className="relative block aspect-video overflow-hidden rounded-squircle-xs bg-canvas">
        <Cover photo={message.image} art={message.art} uid={`row-${message.slug}`} sizes="136px" />
        {current && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-semibold text-white">
            Now playing
          </span>
        )}
      </span>
      <span className="min-w-0 pt-0.5">
        {label && <span className={`mb-1 block ${metaCaps}`}>{label}</span>}
        <span className={`line-clamp-2 text-[0.95rem] font-semibold leading-snug ${current ? "text-muted" : "text-ink"}`}>
          <span className={current ? "" : groupUnderline}>{message.title}</span>
        </span>
        <span className={`mt-1.5 block ${metaCaps}`}>
          {formatDate(message.date)}
          {message.seconds !== undefined && ` · ${formatLength(message.seconds)}`}
        </span>
      </span>
    </Link>
  );
}

/** A clip: an upright thumbnail with its title over the bottom, like a phone's short videos. */
export function ClipCard({ clip, sizes }: { clip: Message; sizes: string }) {
  return (
    <Link
      href={`/watch/${clip.slug}`}
      className="group relative block aspect-[9/16] overflow-hidden rounded-squircle-sm bg-night"
    >
      <Cover
        photo={clip.image}
        art={clip.art}
        uid={`clip-${clip.slug}`}
        sizes={sizes}
        className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
      <span aria-hidden className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full ${glass}`}>
        <Play className="ml-px size-3.5 fill-current" />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4">
        <span className="line-clamp-3 text-[0.95rem] font-semibold leading-snug text-white">{clip.title}</span>
        {clip.seconds !== undefined && (
          <span className="mt-1 block text-xs font-medium tabular-nums text-white/75">{formatLength(clip.seconds)}</span>
        )}
      </span>
    </Link>
  );
}

/**
 * A series as a poster: its colour with a large tone-on-tone shape (or its own artwork), the
 * title set over the bottom, like the key art of a show. Optionally its description below.
 */
export function SeriesPoster({ series, sizes, withDescription = false }: { series: Series; sizes: string; withDescription?: boolean }) {
  const count = series.messages.length;
  return (
    <Link href={`/watch/series/${series.slug}`} className="group block">
      <span className="relative flex aspect-[3/4] flex-col overflow-hidden rounded-squircle-md" style={{ backgroundColor: series.colour }}>
        {series.photo ? (
          <>
            <Cover photo={series.photo} art={{ motif: "rings", palette: "ink" }} uid={`poster-${series.slug}`} sizes={sizes} className={zoom} />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-black/0" />
          </>
        ) : (
          <TonalArtwork motif={series.motif} colour={series.colour} uid={`poster-${series.slug}`} className={`absolute inset-0 size-full ${zoom}`} />
        )}
        <span className="relative mt-auto block p-5 text-white sm:p-6">
          <span className="block text-xs font-semibold uppercase text-white/70">
            {count} {count === 1 ? "message" : "messages"}
          </span>
          <span className="mt-2 block text-[clamp(1.375rem,1.15rem+0.8vw,1.875rem)] font-medium leading-[1.08] tracking-[-0.02em] text-balance">
            {series.title}
          </span>
        </span>
      </span>
      {withDescription && series.description && (
        <span className="mt-4 line-clamp-2 block text-[0.95rem] leading-relaxed text-body">{series.description}</span>
      )}
    </Link>
  );
}

const zoom = "transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none";
