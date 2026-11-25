import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRight, BookOpen, Layers } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { ShareButton } from "@/components/ui/share-button";
import { actionButton, bodyText, metaCaps } from "@/components/ui/styles";
import { MessageRow } from "@/components/watch/cards";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Chapters, Player, PlayerProvider } from "@/components/watch/player";
import { RichText } from "@/components/watch/rich-text";
import { TRANSLATION, bibleComUrl } from "@/lib/bible";
import { formatDate } from "@/lib/format";
import { getCatalogue, getMessage } from "@/lib/watch";
import { formatLength, type Catalogue, type Message } from "@/lib/watch-types";

/** Every message is ready ahead of time; a new recording's page is made on its first visit. */
export async function generateStaticParams() {
  const { messages } = await getCatalogue();
  // Cache Components needs at least one; an empty library has no pages to make.
  return messages.length ? messages.map((m) => ({ slug: m.slug })) : [{ slug: "latest" }];
}

export async function generateMetadata({ params }: PageProps<"/watch/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const message = await getMessage(slug);
  if (!message) return { title: "Message not found" };
  const description = message.summary || `${message.meeting ?? "A message"} from ${formatDate(message.date)}.`;
  return {
    title: message.title,
    description,
    alternates: { canonical: `/watch/${message.slug}` },
    openGraph: {
      type: "video.other",
      title: message.title,
      description,
      images: message.image ? [{ url: message.image.src }] : undefined,
      videos: message.videoId ? [{ url: `https://www.youtube.com/watch?v=${message.videoId}` }] : undefined,
    },
  };
}

export default function MessagePage({ params }: PageProps<"/watch/[slug]">) {
  return (
    <PageTransition>
      <Suspense fallback={<MessageSkeleton />}>
        <MessageView params={params} />
      </Suspense>
    </PageTransition>
  );
}

async function MessageView({ params }: Pick<PageProps<"/watch/[slug]">, "params">) {
  const { slug } = await params;
  const catalogue = await getCatalogue();
  const message = catalogue.messages.find((m) => m.slug === slug);
  if (!message) {
    // /watch/{YouTube video ID} works too, and goes to the message's proper address.
    const byVideo = catalogue.messages.find((m) => m.videoId === slug);
    if (byVideo) permanentRedirect(`/watch/${byVideo.slug}`);
    notFound();
  }

  const series = message.series && catalogue.series.find((s) => s.slug === message.series!.slug);
  const parts = series ? series.messages.map((s) => catalogue.messages.find((m) => m.slug === s)!).filter(Boolean) : [];
  const more = related(message, catalogue, new Set(parts.map((p) => p.slug)));
  const isClip = message.kind === "clip";
  // The description, unless it only repeats the summary already shown under the title.
  const description = message.description.join(" ") === message.summary ? [] : message.description;

  return (
    <article className="container-page pb-12 pt-4 md:pb-16 lg:pb-20 lg:pt-6">
      <VideoJsonLd message={message} />
      <div className="content-width">
        <Breadcrumbs
          trail={[
            { label: "Watch", href: "/watch" },
            isClip
              ? { label: "Clips", href: "/watch/clips" }
              : series
                ? { label: series.title, href: `/watch/series/${series.slug}` }
                : { label: "Messages", href: "/watch#messages" },
            { label: message.title },
          ]}
        />

        <PlayerProvider>
          <div className="mt-4 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
            <div className="min-w-0">
              {/* Edge to edge on phones, like the live page */}
              <div id="player" className="-mx-5 scroll-mt-20 md:mx-0">
                <Player
                  videoId={message.videoId}
                  title={message.title}
                  image={message.image}
                  art={message.art}
                  seconds={message.seconds}
                  vertical={message.vertical}
                  embeddable={message.embeddable}
                />
              </div>

              <header className="mt-6 lg:mt-8">
                <h1 className="max-w-[44ch] text-[clamp(1.25rem,1.1rem+0.5vw,1.625rem)] font-medium leading-snug tracking-[-0.015em] text-balance text-ink">{message.title}</h1>
                <p className={`mt-3 ${metaCaps}`}>
                  {[message.meeting, formatDate(message.date), message.seconds !== undefined && formatLength(message.seconds)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {message.scripture && (
                    <a href={bibleComUrl(message.scripture.passage)} target="_blank" rel="noreferrer" className={actionButton}>
                      <BookOpen aria-hidden className="size-4" />
                      {message.scripture.reference}
                      <span className="sr-only"> ({TRANSLATION}, on Bible.com)</span>
                    </a>
                  )}
                  {series && message.series && (
                    <Link href={`/watch/series/${series.slug}`} className={actionButton}>
                      <Layers aria-hidden className="size-4" />
                      Part {message.series.part} of {series.title}
                    </Link>
                  )}
                  <ShareButton title={message.title} path={`/watch/${message.slug}`} />
                  {message.videoId && (
                    <a href={`https://www.youtube.com/watch?v=${message.videoId}`} target="_blank" rel="noreferrer" className={actionButton}>
                      YouTube
                      <ArrowUpRight aria-hidden className="size-4" />
                    </a>
                  )}
                </div>
              </header>

              {(message.summary || description.length > 0 || message.speaker) && (
                <div className={`mt-8 max-w-[65ch] ${bodyText}`}>
                  {message.speaker && <p className="mb-4 text-[0.95rem] text-muted">With {message.speaker}</p>}
                  {description.length > 0 ? <RichText paragraphs={description} /> : <p>{message.summary}</p>}
                </div>
              )}

              {message.chapters.length > 0 && (
                <section aria-labelledby="chapters-title" className="mt-12 max-w-[65ch]">
                  <h2 id="chapters-title" className={metaCaps}>
                    Chapters
                  </h2>
                  <div className="-mx-3 mt-3">
                    <Chapters chapters={message.chapters} />
                  </div>
                </section>
              )}
            </div>

            <aside className="flex flex-col gap-12">
              {series && parts.length > 1 && (
                <section aria-labelledby="series-parts-title">
                  <p className={metaCaps}>Series · {parts.length} messages</p>
                  <h2 id="series-parts-title" className="mt-2 text-card text-ink">
                    <Link href={`/watch/series/${series.slug}`} className="hover:underline hover:underline-offset-4">
                      {series.title}
                    </Link>
                  </h2>
                  <ol className="mt-5 flex flex-col gap-4">
                    {parts.map((part) => (
                      <li key={part.slug}>
                        <MessageRow message={part} current={part.slug === message.slug} label={`Part ${part.series?.part}`} />
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {more.length > 0 && (
                <section aria-labelledby="more-title">
                  <h2 id="more-title" className="text-card text-ink">
                    {isClip ? "More clips" : "More messages"}
                  </h2>
                  <ul className="mt-5 flex flex-col gap-4">
                    {more.map((m) => (
                      <li key={m.slug}>
                        <MessageRow message={m} />
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={isClip ? "/watch/clips" : "/watch#messages"}
                    className="mt-6 inline-flex text-[0.95rem] font-semibold text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
                  >
                    {isClip ? "All clips" : "All messages"}
                  </Link>
                </section>
              )}
            </aside>
          </div>
        </PlayerProvider>
      </div>
    </article>
  );
}

/**
 * What to watch next: from the same meeting first, then the newest, leaving out this one and
 * its series (already listed). Clips suggest clips.
 */
function related(message: Message, catalogue: Catalogue, exclude: Set<string>): Message[] {
  const pool = catalogue.messages.filter((m) => m.kind === message.kind && m.slug !== message.slug && !exclude.has(m.slug));
  const sameMeeting = pool.filter((m) => message.meeting && m.meeting === message.meeting);
  const rest = pool.filter((m) => !sameMeeting.includes(m));
  return [...sameMeeting.slice(0, 4), ...rest].slice(0, 6);
}

/** Tells search engines this page is a video, so it can show with its thumbnail and length. */
function VideoJsonLd({ message }: { message: Message }) {
  if (!message.videoId) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: message.title,
    description: message.summary || message.title,
    thumbnailUrl: message.image ? [message.image.src] : undefined,
    uploadDate: message.date,
    duration: message.seconds ? `PT${message.seconds}S` : undefined,
    embedUrl: `https://www.youtube.com/embed/${message.videoId}`,
    url: `https://www.youtube.com/watch?v=${message.videoId}`,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** A faint outline of the page while the message loads. */
function MessageSkeleton() {
  return (
    <div aria-hidden className="container-page pb-16 pt-4 lg:pt-6">
      <div className="content-width">
        <div className="h-5 w-48 rounded-full bg-ink/[0.05]" />
        <div className="mt-4 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div>
            <div className="-mx-5 aspect-video bg-ink/[0.05] md:mx-0 md:rounded-squircle-lg" />
            <div className="mt-8 h-9 w-2/3 rounded-full bg-ink/[0.05]" />
            <div className="mt-4 h-4 w-1/3 rounded-full bg-ink/[0.05]" />
          </div>
          <div className="hidden flex-col gap-4 lg:flex">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="grid grid-cols-[8.5rem_1fr] gap-3.5">
                <div className="aspect-video rounded-squircle-xs bg-ink/[0.05]" />
                <div className="mt-1 h-4 rounded-full bg-ink/[0.05]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
