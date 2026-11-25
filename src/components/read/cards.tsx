import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Cover } from "@/components/art/cover";
import { bodyText, buttonPrimary, groupUnderline, metaCaps } from "@/components/ui/styles";
import type { ArticleSummary } from "@/lib/article-types";
import { formatDate } from "@/lib/format";

const zoom = "transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none";

/** "NOV 11, 2026 · 6 MIN READ" */
export function articleMeta(article: ArticleSummary) {
  return `${formatDate(article.date)} · ${article.minutes} min read`;
}

/**
 * An article in a grid: its picture (with its topic on frosted glass), then the title, the
 * date and reading time, and the summary. The same rhythm as the home page's cards.
 */
export function ArticleCard({ article, sizes }: { article: ArticleSummary; sizes: string }) {
  const topic = article.topics[0];
  return (
    <Link href={`/read/${article.slug}`} className="group block">
      <span className="relative block aspect-[16/10] overflow-hidden rounded-squircle-sm bg-canvas">
        <Cover photo={article.photo} art={article.art} uid={`article-${article.slug}`} sizes={sizes} className={zoom} />
        {topic && (
          <span className="absolute left-3 top-3 rounded-squircle-xs bg-white/15 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-xl backdrop-brightness-[0.85]">
            {topic.name}
          </span>
        )}
      </span>
      <span className="mt-5 block">
        <h3 className="text-card text-ink">
          <span className={groupUnderline}>{article.title}</span>
        </h3>
        <p className={`mt-2 ${metaCaps}`}>{articleMeta(article)}</p>
        {article.summary && <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-body">{article.summary}</p>}
      </span>
    </Link>
  );
}

/** The newest article, large: its picture beside the title, passage and summary. */
export function FeaturedArticle({ article }: { article: ArticleSummary }) {
  const href = `/read/${article.slug}`;
  return (
    <section aria-labelledby="featured-article-title" className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16">
      <Link href={href} tabIndex={-1} aria-hidden className="group relative block aspect-[16/10] overflow-hidden rounded-squircle-md bg-canvas lg:col-span-7">
        <Cover photo={article.photo} art={article.art} uid="featured-article" sizes="(min-width: 1504px) 820px, (min-width: 1024px) 55vw, 100vw" preload className={zoom} />
      </Link>
      <div className="lg:col-span-5">
        <p className={metaCaps}>
          Latest{article.topics[0] && ` · ${article.topics[0].name}`}
        </p>
        <h2 id="featured-article-title" className="mt-4 text-[clamp(1.5rem,1.3rem+0.6vw,1.875rem)] font-medium leading-tight tracking-[-0.02em] text-balance text-ink">
          <Link href={href} className="hover:underline hover:decoration-rule-strong hover:underline-offset-[0.15em]">
            {article.title}
          </Link>
        </h2>
        {article.summary && <p className={`mt-5 max-w-[42ch] ${bodyText}`}>{article.summary}</p>}
        <p className="mt-6 text-sm text-muted">
          {[article.author, formatDate(article.date), `${article.minutes} min read`].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-9">
          <Link href={href} className={buttonPrimary}>
            Read the article
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
