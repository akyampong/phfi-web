import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/page-transition";
import { Reveal } from "@/components/ui/reveal";
import { ClipCard } from "@/components/watch/cards";
import { Breadcrumbs, EmptyState, PageIntro } from "@/components/watch/page-parts";
import { getCatalogue } from "@/lib/watch";

export const metadata: Metadata = {
  title: "Clips",
  description: "Short moments from our meetings: a minute of encouragement to watch and pass on.",
  alternates: { canonical: "/watch/clips" },
};

/** Every clip, newest first, in upright cards like a phone's short videos. */
export default async function ClipsPage() {
  const clips = (await getCatalogue()).messages.filter((m) => m.kind === "clip");
  return (
    <PageTransition>
      <div className="container-page pb-12 pt-6 md:pb-16 lg:pb-20 lg:pt-8">
        <div className="content-width">
          <Breadcrumbs trail={[{ label: "Watch", href: "/watch" }, { label: "Clips" }]} />
          <div className="mt-8 md:mt-12">
            <PageIntro title="Clips">
              Short moments from our meetings: a minute of encouragement to watch, and to pass on to someone who needs it.
            </PageIntro>
          </div>
          <div className="mt-14 md:mt-20">
            {clips.length === 0 ? (
              <EmptyState title="No clips yet">
                Short highlights from our meetings will appear here.
              </EmptyState>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {clips.map((clip, i) => (
                  <Reveal as="li" key={clip.slug} order={i % 5}>
                    <ClipCard clip={clip} sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" />
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
