import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { Reveal } from "@/components/ui/reveal";
import { SeriesPoster } from "@/components/watch/cards";
import { Breadcrumbs, EmptyState, PageIntro } from "@/components/watch/page-parts";
import { getCatalogue } from "@/lib/watch";

export const metadata: Metadata = {
  title: "Series",
  description: "Teaching series from Purpose House Fellowship International, to watch from the start.",
  alternates: { canonical: "/watch/series" },
};

/** Every series, the one with the newest message first. */
export default async function SeriesIndexPage() {
  const { series } = await getCatalogue();
  return (
    <PageTransition>
      <div className="container-page pb-12 pt-6 md:pb-16 lg:pb-20 lg:pt-8">
        <div className="content-width">
          <Breadcrumbs trail={[{ label: "Watch", href: "/watch" }, { label: "Series" }]} />
          <div className="mt-8 md:mt-12">
            <PageIntro title="Series">
              Our teaching, a book or a theme at a time. Start from the first message, or pick up where you left off.
            </PageIntro>
          </div>
          <div className="mt-14 md:mt-20">
            {series.length === 0 ? (
              <EmptyState title="No series yet">
                When a series begins, its messages will be gathered here in order.
              </EmptyState>
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4 xl:grid-cols-5">
                {series.map((s, i) => (
                  <Reveal as="li" key={s.slug} order={i % 5}>
                    <SeriesPoster series={s} withDescription sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, 50vw" />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
