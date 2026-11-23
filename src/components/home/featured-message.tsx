import Link from "next/link";
import { Play } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";
import type { ContentItem } from "@/content/home";
import { formatDate } from "@/lib/format";

/** The newest message: a 16:9 video frame (YouTube's shape) beside the title at display size. */
export function FeaturedMessage({ message }: { message: ContentItem }) {
  return (
    <section aria-labelledby="featured-title" className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16">
      <Link
        href={message.href}
        aria-label={`Watch ${message.title}`}
        className="group relative block aspect-video overflow-hidden rounded-squircle-md bg-ink lg:col-span-7"
      >
        <Cover
          photo={message.photo}
          art={message.art}
          uid="featured"
          sizes="(min-width: 1504px) 820px, (min-width: 1024px) 55vw, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0" />
        {/* A round play button in the centre, in the same frosted glass as the hero's arrows:
            no outline, just blur, a soft shadow, and a little more glass on hover (no growing:
            scaling a blurred element makes its edge shimmer). What's behind it
            is dimmed slightly, so the white play icon still stands out on a bright sky */}
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl backdrop-brightness-[0.8] transition-colors duration-300 group-hover:bg-white/20 sm:size-[4.5rem]">
            <Play className="ml-0.5 size-5 fill-current sm:size-6" />
          </span>
        </span>
        <span aria-hidden className="label-caps absolute bottom-0 left-0 p-5 text-white/90 sm:p-8">
          {message.meeting}
          <span className="hidden sm:inline"> · {message.length}</span>
        </span>
      </Link>

      <div className="lg:col-span-5">
        <h2 id="featured-title" className="text-headline text-ink text-balance">
          {/* Plain text: the video beside it and the button below already go to the message */}
          {message.title}
        </h2>
        {message.subtitle && <p className="mt-5 text-lg font-medium text-ink">{message.subtitle}</p>}
        <p className="mt-5 max-w-[40ch] text-lead text-body">{message.excerpt}</p>
        <p className="mt-6 text-sm text-muted">
          {message.meeting} · {formatDate(message.date)}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href={message.href} className={buttonPrimary}>
            <Play aria-hidden className="size-4 fill-current" />
            Watch the recap
          </Link>
          <Link href="/watch" className={buttonSecondary}>
            All recaps
          </Link>
        </div>
      </div>
    </section>
  );
}
