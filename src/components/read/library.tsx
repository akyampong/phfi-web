"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { buttonSecondary } from "@/components/ui/styles";
import type { ArticleSummary, Topic } from "@/lib/article-types";
import { ArticleCard } from "./cards";

const PAGE = 12;
const cardSizes = "(min-width: 1504px) 460px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * Every article, newest first, with a choice of topic. The topic is kept in the address
 * (/read?topic=prayer#all), so a topic can be linked to from an article. Twelve at a time.
 * Render inside <Suspense> (it reads the address); ArticleGrid makes a good fallback.
 */
export function ReadLibrary({ articles, topics }: { articles: ArticleSummary[]; topics: Topic[] }) {
  const params = useSearchParams();
  const topic = topics.find((t) => t.slug === params.get("topic"));
  const [shown, setShown] = useState({ topic: "", count: PAGE });
  const count = shown.topic === (topic?.slug ?? "") ? shown.count : PAGE;
  const results = topic ? articles.filter((a) => a.topics.some((t) => t.slug === topic.slug)) : articles;

  function choose(next?: Topic) {
    // Replace (not push) the address: choosing isn't a new page for the Back button.
    window.history.replaceState(null, "", next ? `/read?topic=${next.slug}#all` : "/read#all");
  }

  return (
    <div>
      {topics.length > 1 && (
        // Scrolls sideways on phones rather than wrapping onto several lines
        <div role="group" aria-label="Topic" className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-8 md:px-8 lg:mx-0 lg:flex-wrap lg:px-0">
          <Chip active={!topic} onClick={() => choose()}>
            All
          </Chip>
          {topics.map((t) => (
            <Chip key={t.slug} active={topic?.slug === t.slug} onClick={() => choose(topic?.slug === t.slug ? undefined : t)}>
              {t.name}
            </Chip>
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-5 text-sm text-muted">
        {results.length} {results.length === 1 ? "article" : "articles"}
        {topic && ` on ${topic.name.toLowerCase()}`}
      </p>

      <ArticleGrid articles={results.slice(0, count)} />
      {results.length > count && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setShown({ topic: topic?.slug ?? "", count: count + PAGE })} className={`${buttonSecondary} cursor-pointer`}>
            Show more
          </button>
        </div>
      )}
    </div>
  );
}

/** One column on phones, two on tablets, three on wide screens. */
export function ArticleGrid({ articles }: { articles: ArticleSummary[] }) {
  return (
    <ul className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
      {articles.map((article) => (
        <li key={article.slug}>
          <ArticleCard article={article} sizes={cardSizes} />
        </li>
      ))}
    </ul>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-squircle-xs px-3.5 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-paper" : "bg-ink/[0.06] text-ink hover:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );
}
