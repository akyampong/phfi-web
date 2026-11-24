import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { PageTransition } from "@/components/layout/page-transition";
import { ArticleCard } from "@/components/read/cards";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ShareButton } from "@/components/ui/share-button";
import { actionButton, metaCaps } from "@/components/ui/styles";
import type { Article } from "@/lib/article-types";
import { getArticle, getArticles, summarise } from "@/lib/articles";
import { TRANSLATION, bibleComUrl } from "@/lib/bible";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const articles = await getArticles();
  // Cache Components needs at least one; with no articles there are no pages to make.
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: "latest" }];
}

export async function generateMetadata({ params }: PageProps<"/read/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/read/${article.slug}` },
    authors: article.author ? [{ name: article.author }] : undefined,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary,
      publishedTime: article.date,
      tags: article.topics.map((t) => t.name),
      images: article.photo ? [{ url: article.photo.src, alt: article.photo.alt }] : undefined,
    },
  };
}

export default function ArticlePage({ params }: PageProps<"/read/[slug]">) {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-[80svh]" />}>
        <ArticleView params={params} />
      </Suspense>
    </PageTransition>
  );
}

/** The column the article is read in: about 70 characters a line, from the picture's left edge. */
const column = "w-full max-w-[42rem]";

async function ArticleView({ params }: Pick<PageProps<"/read/[slug]">, "params">) {
  const { slug } = await params;
  const articles = await getArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  const more = related(article, articles);

  return (
    <article className="container-page pb-12 pt-6 md:pb-16 lg:pb-20 lg:pt-8">
      <ArticleJsonLd article={article} />
      <div className="content-width">
        {/* The trail, title, picture and text all start from the same left edge: the picture's */}
        <div className="mx-auto max-w-[64rem]">
          <Breadcrumbs
            trail={[
              { label: "Read", href: "/read" },
              ...(article.topics[0] ? [{ label: article.topics[0].name, href: `/read?topic=${article.topics[0].slug}#all` }] : []),
              { label: article.title },
            ]}
          />

          <header className={`${column} mt-10 md:mt-16`}>
            <p className={metaCaps}>
              {formatDate(article.date)} · {article.minutes} min read
            </p>
            <h1 className="mt-4 text-[clamp(2.25rem,1.5rem+2.4vw,3.75rem)] font-medium leading-[1.05] tracking-[-0.03em] text-balance text-ink">
              {article.title}
            </h1>
            {article.summary && (
              <p className="mt-5 text-[clamp(1.125rem,1.02rem+0.4vw,1.35rem)] leading-relaxed text-body">{article.summary}</p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {article.author && <span className="mr-2 text-[0.95rem] font-medium text-ink">By {article.author}</span>}
              {article.scripture && (
                <a href={bibleComUrl(article.scripture.passage)} target="_blank" rel="noreferrer" className={actionButton}>
                  <BookOpen aria-hidden className="size-4" />
                  {article.scripture.reference}
                  <span className="sr-only"> ({TRANSLATION}, on Bible.com)</span>
                </a>
              )}
              <ShareButton title={article.title} path={`/read/${article.slug}`} />
            </div>
          </header>

          <figure className="mt-10 md:mt-14">
            <div className="relative -mx-5 aspect-[16/9] overflow-hidden bg-canvas md:mx-0 md:rounded-squircle-lg">
              <Cover photo={article.photo} art={article.art} uid="article-cover" sizes="(min-width: 1088px) 1024px, 100vw" preload />
            </div>
            {article.photo?.credit && (
              <figcaption className="mt-3 text-xs text-muted">
                Photo:{" "}
                <a href={article.photo.credit} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
                  Unsplash
                </a>
              </figcaption>
            )}
          </figure>

          {/* The article's text, from its Markdown file in the project (never from visitors) */}
          <div className={`${column} article-body mt-12 md:mt-16`} dangerouslySetInnerHTML={{ __html: article.html }} />

          <footer className={`${column} mt-14 flex flex-wrap items-center justify-between gap-6`}>
            {article.topics.length > 0 && (
              <ul aria-label="Topics" className="flex flex-wrap gap-1.5">
                {article.topics.map((topic) => (
                  <li key={topic.slug}>
                    <Link href={`/read?topic=${topic.slug}#all`} className={actionButton}>
                      {topic.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <ShareButton title={article.title} path={`/read/${article.slug}`} />
          </footer>
        </div>

        {more.length > 0 && (
          <section aria-labelledby="more-title" className="mt-24 md:mt-32">
            <h2 id="more-title" className="text-headline text-ink">
              Keep reading
            </h2>
            <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-10 lg:grid-cols-3 lg:gap-x-8">
              {more.map((a) => (
                <li key={a.slug}>
                  <ArticleCard article={summarise(a)} sizes="(min-width: 1504px) 460px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

/** Three to read next: sharing a topic with this one first, then the newest. */
function related(article: Article, articles: Article[]): Article[] {
  const others = articles.filter((a) => a.slug !== article.slug);
  const shared = (a: Article) => a.topics.filter((t) => article.topics.some((u) => u.slug === t.slug)).length;
  return [...others].sort((a, b) => shared(b) - shared(a) || b.date.localeCompare(a.date)).slice(0, 3);
}

/** Tells search engines this is an article, with its date, author and picture. */
function ArticleJsonLd({ article }: { article: Article }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    datePublished: article.date,
    image: article.photo ? [article.photo.src] : undefined,
    author: article.author ? { "@type": "Person", name: article.author } : { "@type": "Organization", name: "Purpose House Fellowship International" },
    keywords: article.topics.map((t) => t.name).join(", "),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
