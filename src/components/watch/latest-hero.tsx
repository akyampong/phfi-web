import Link from "next/link";
import { Layers, Play } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { onImageButton, onImageGlassButton } from "@/components/ui/styles";
import { formatDate } from "@/lib/format";
import { formatLength, type Message } from "@/lib/watch-types";
import { NextLive, heroFrame } from "./hero";

/**
 * The newest message, filling the top of /watch: its picture edge to edge, the title large
 * over the bottom, and when the next meeting goes live in the corner.
 */
export function LatestHero({ message }: { message: Message }) {
  const href = `/watch/${message.slug}`;
  const meta = [message.scripture?.reference, formatDate(message.date), message.seconds !== undefined && formatLength(message.seconds)]
    .filter(Boolean)
    .join(" · ");

  return (
    <section aria-labelledby="hero-title" className={heroFrame}>
      <Cover photo={message.image} art={message.art} uid="watch-hero" sizes="(min-width: 1504px) 1440px, 100vw" preload className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-black/15" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/75 via-black/30 to-black/0" />

      <NextLive className="absolute left-6 top-6 sm:left-10 sm:top-10 lg:left-14 lg:top-12" />

      <div className="relative mt-auto px-6 pb-8 text-white sm:px-10 sm:pb-10 lg:px-14 lg:pb-14">
        <p className="text-sm font-medium text-white/80">
          Latest message{message.meeting && ` · ${message.meeting}`}
        </p>
        <h2 id="hero-title" className="mt-3 max-w-[22ch] text-page text-balance text-white">
          <Link href={href} className="outline-offset-4">
            {message.title}
          </Link>
        </h2>
        <p className="mt-4 text-[0.95rem] text-white/80">{meta}</p>
        {message.summary && (
          <p className="mt-4 hidden max-w-[52ch] text-[clamp(1.0625rem,0.98rem+0.3vw,1.1875rem)] leading-relaxed text-white/85 sm:line-clamp-2">
            {message.summary}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={href} className={onImageButton}>
            <Play aria-hidden className="size-4 fill-current" />
            Watch now
          </Link>
          {message.series && (
            <Link href={`/watch/series/${message.series.slug}`} className={onImageGlassButton}>
              <Layers aria-hidden className="size-4" />
              <span>
                Part {message.series.part}
                <span className="hidden sm:inline"> of {message.series.title}</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
