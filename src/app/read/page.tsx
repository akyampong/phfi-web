import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { FeaturedArticle } from "@/components/read/cards";
import { ArticleGrid, ReadLibrary } from "@/components/read/library";
import { Reveal } from "@/components/ui/reveal";
import { bodyText } from "@/components/ui/styles";
import type { Topic } from "@/lib/article-types";
import { getArticles, summarise } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Read",
  description: "Articles to keep you close to Christ through the week: on prayer, the Psalms, community and more.",
  alternates: { canonical: "/read" },
};

/**
 * The Read page: the newest article large, then every article by topic. Articles are
 * Markdown files in content/articles (see lib/articles.ts).
 */
export default async function ReadPage() {
  const articles = (await getArticles()).map(summarise);
  // Topics with the most articles first
  const counts = new Map<string, { topic: Topic; count: number }>();
  for (const article of articles)
    for (const topic of article.topics) counts.set(topic.slug, { topic, count: (counts.get(topic.slug)?.count ?? 0) + 1 });
  const topics = [...counts.values()].sort((a, b) => b.count - a.count || a.topic.name.localeCompare(b.topic.name)).map((t) => t.topic);

  return (
    <PageTransition>
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <h1 className="sr-only">Read</h1>
        {/* Spaced like /watch: a plain section heading over the newest article, no page title */}
        <div className="content-width flex flex-col gap-16 pt-8 md:gap-20 md:pt-10 lg:gap-24 lg:pt-12">
          {articles[0] && (
            <section aria-labelledby="latest-title">
              <h2 id="latest-title" className="text-section text-ink">
                Latest article
              </h2>
              <div className="mt-8 lg:mt-10">
                <FeaturedArticle article={articles[0]} />
              </div>
            </section>
          )}

          {articles.length > 1 && (
            // The address can point here directly: /read?topic=prayer#all
            <section id="all" aria-labelledby="all-title" className="scroll-mt-24">
              <Reveal>
                <h2 id="all-title" className="text-section text-ink">
                  All articles
                </h2>
              </Reveal>
              <div className="mt-6 md:mt-8">
                <Suspense fallback={<ArticleGrid articles={articles.slice(0, 12)} />}>
                  <ReadLibrary articles={articles} topics={topics} />
                </Suspense>
              </div>
            </section>
          )}

          {articles.length === 0 && (
            <p className={bodyText}>The first articles are on their way.</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
