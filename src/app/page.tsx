import { Bento } from "@/components/home/bento";
import { FeaturedMessage } from "@/components/home/featured-message";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { Newsletter } from "@/components/home/newsletter";
import { NextSteps } from "@/components/home/next-steps";
import { RecentGrid } from "@/components/home/recent-grid";
import { ThisWeek } from "@/components/home/this-week";
import { WaysToJoin } from "@/components/home/ways-to-join";
import { PageTransition } from "@/components/layout/page-transition";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/config/site";
import { bentoTiles, featured, heroSlides, nextSteps, recent, thisWeek, ways } from "@/content/home";

export default function HomePage() {
  return (
    // Spacing rhythm (phone / tablet / desktop):
    //   hero carousel            flush under the navbar, 12px from each screen edge
    //   everything after it      a centred column of at most 1440px (content-width)
    //   between sections         96 / 128 / 160px  (space is the only separator: no lines)
    //   last section → footer    about one section gap, together with the footer's own top padding
    // Motion: the hero animates itself; everything below fades up as it scrolls into view.
    <PageTransition>
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <h1 className="sr-only">{siteConfig.name}</h1>

        <div className="flex flex-col gap-24 md:gap-32 lg:gap-40">
          {/* Pulled out past the container's padding: 20 − 8 = 12px and 32 − 20 = 12px from the edge */}
          <div className="-mx-2 md:-mx-5">
            <HeroCarousel slides={heroSlides} />
          </div>

          {/* Everything after the hero sits in the 1440px reading column */}
          <div className="content-width flex flex-col gap-24 md:gap-32 lg:gap-40">
            {/* This week's verse and prayer points: the part that changes each week, so it comes first */}
            <ThisWeek week={thisWeek} />
            <WaysToJoin ways={ways} />
            <Reveal>
              <FeaturedMessage message={featured} />
            </Reveal>
            <Bento tiles={bentoTiles} />
            <RecentGrid items={recent} />
            <NextSteps steps={nextSteps} />
            <Reveal>
              <Newsletter />
            </Reveal>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
