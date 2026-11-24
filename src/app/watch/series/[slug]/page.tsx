import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Play } from "lucide-react";
import { TonalArtwork } from "@/components/art/artwork";
import { Cover } from "@/components/art/cover";
import { PageTransition } from "@/components/layout/page-transition";
import { Reveal } from "@/components/ui/reveal";
import { ShareButton } from "@/components/ui/share-button";
import { groupUnderline, metaCaps, onImageButton, onImageGlassButton } from "@/components/ui/styles";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatDate, formatShortDate } from "@/lib/format";
import { getCatalogue, getSeries } from "@/lib/watch";
import { formatLength, type Message } from "@/lib/watch-types";

export async function generateStaticParams() {
  const { series } = await getCatalogue();
  // Cache Components needs at least one; with no series there are no pages to make.
  return series.length ? series.map((s) => ({ slug: s.slug })) : [{ slug: "latest" }];
}

export async function generateMetadata({ params }: PageProps<"/watch/series/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeries(slug);
  if (!series) return { title: "Series not found" };
  return {
    title: series.title,
    description: series.description || `A series of ${series.messages.length} messages.`,
    alternates: { canonical: `/watch/series/${series.slug}` },
    openGraph: { images: series.photo ? [{ url: series.photo.src }] : undefined },
  };
}

export default function SeriesPage({ params }: PageProps<"/watch/series/[slug]">) {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-[70svh]" />}>
        <SeriesView params={params} />
      </Suspense>
    </PageTransition>
  );
}

/** One series: its artwork and description, then every message in order. */
async function SeriesView({ params }: Pick<PageProps<"/watch/series/[slug]">, "params">) {
  const { slug } = await params;
  const { series: all, messages } = await getCatalogue();
  const series = all.find((s) => s.slug === slug);
  if (!series) notFound();

  const parts = series.messages.map((s) => messages.find((m) => m.slug === s)).filter((m): m is Message => Boolean(m));
  const first = parts[0];
  const range =
    parts.length > 1
      ? `${formatShortDate(first.date)} – ${formatDate(parts.at(-1)!.date)}`
      : formatDate(first.date);

  return (
    <div className="container-page pb-12 pt-6 md:pb-16 lg:pb-20 lg:pt-8">
      <div className="content-width">
        <Breadcrumbs trail={[{ label: "Watch", href: "/watch" }, { label: "Series", href: "/watch/series" }, { label: series.title }]} />

        {/* The series in its own colour, as on /watch: what it's about, and where to start */}
        <header className="relative mt-6 overflow-hidden rounded-squircle-lg text-white md:mt-8" style={{ backgroundColor: series.colour }}>
          {series.photo ? (
            <>
              <Cover photo={series.photo} art={{ motif: "rings", palette: "ink" }} uid="series-hero" sizes="100vw" preload />
              <span aria-hidden className="absolute inset-0 bg-black/55" />
            </>
          ) : (
            <TonalArtwork motif={series.motif} colour={series.colour} uid="series-hero" className="absolute inset-0 size-full" />
          )}
          <div className="relative flex min-h-[26rem] flex-col justify-end p-6 sm:p-10 lg:min-h-[32rem] lg:p-14">
            <p className="text-sm font-medium text-white/75">
              Series · {parts.length} {parts.length === 1 ? "message" : "messages"} · {range}
            </p>
            <h1 className="mt-4 max-w-[16ch] text-white text-[clamp(2.5rem,1.55rem+3.2vw,4.5rem)] font-normal leading-[1.02] tracking-[-0.035em] text-balance">
              {series.title}
            </h1>
            {series.description && (
              <p className="mt-5 max-w-[48ch] text-[clamp(1.0625rem,0.98rem+0.3vw,1.1875rem)] leading-relaxed text-white/85">
                {series.description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={`/watch/${first.slug}`} className={onImageButton}>
                <Play aria-hidden className="size-4 fill-current" />
                {parts.length > 1 ? "Start from part 1" : "Watch"}
              </Link>
              <ShareButton title={series.title} path={`/watch/series/${series.slug}`} className={`${onImageGlassButton} cursor-pointer`} />
            </div>
          </div>
        </header>

        <section aria-labelledby="parts-title" className="mt-16 md:mt-24">
          <h2 id="parts-title" className="text-headline text-ink">
            Messages
          </h2>
          <ol className="mt-8 flex flex-col gap-10 sm:mt-10 sm:gap-8">
            {parts.map((part, i) => (
              <Reveal as="li" key={part.slug}>
                <PartRow message={part} part={i + 1} />
              </Reveal>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

/** A part of the series: its number, picture, title, passage, date and a line or two about it. */
function PartRow({ message, part }: { message: Message; part: number }) {
  return (
    <Link
      href={`/watch/${message.slug}`}
      className="group grid gap-5 sm:grid-cols-[3rem_16rem_1fr] sm:items-start sm:gap-6 lg:grid-cols-[4rem_20rem_1fr] lg:gap-8"
    >
      <span aria-hidden className="hidden pt-1 text-2xl font-medium tabular-nums text-muted sm:block">
        {String(part).padStart(2, "0")}
      </span>
      <span className="relative block aspect-video overflow-hidden rounded-squircle-sm bg-canvas">
        <Cover
          photo={message.image}
          art={message.art}
          uid={`part-${message.slug}`}
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 256px, 100vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </span>
      <span className="block sm:pt-1">
        <span className={`block ${metaCaps}`}>
          <span className="sm:hidden">Part {part} · </span>
          {formatDate(message.date)}
          {message.seconds !== undefined && ` · ${formatLength(message.seconds)}`}
        </span>
        <h3 className="mt-2 text-title text-ink">
          <span className={groupUnderline}>{message.title}</span>
        </h3>
        {message.scripture && <span className="mt-1.5 block text-[0.95rem] font-medium text-ink">{message.scripture.reference}</span>}
        {message.summary && <p className="mt-3 line-clamp-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-body">{message.summary}</p>}
      </span>
    </Link>
  );
}
