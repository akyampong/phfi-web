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
        <div className="content-width flex flex-col gap-24 pt-12 md:gap-32 md:pt-16 lg:gap-40 lg:pt-20">
          <div className="flex flex-col gap-14 md:gap-20">
            <header>
              <h1 className="text-page text-ink">Read</h1>
              <p className={`mt-5 max-w-[52ch] ${bodyText}`}>
                Articles to keep you close to Christ through the week: on prayer, the Psalms, life together and more.
              </p>
            </header>
            {articles[0] && <FeaturedArticle article={articles[0]} />}
          </div>

          {articles.length > 1 && (
            // The address can point here directly: /read?topic=prayer#all
            <section id="all" aria-labelledby="all-title" className="scroll-mt-24">
              <Reveal>
                <h2 id="all-title" className="text-headline text-ink">
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
