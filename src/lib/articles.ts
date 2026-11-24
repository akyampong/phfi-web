import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { marked } from "marked";
import type { ArtSpec, Motif, Palette } from "@/components/art/artwork";
import { findScripture } from "@/lib/bible";
import { topicSlug, type Article, type ArticleSummary } from "@/lib/article-types";

/**
 * Articles for the Read pages, one Markdown file each in content/articles/. The file's name is
 * its address (praying-when-words-run-out.md → /read/praying-when-words-run-out). It starts
 * with its details between two lines of three dashes, then the article itself in Markdown:
 *
 *   ---
 *   title: Praying When Words Run Out
 *   summary: One or two sentences for cards and search results.
 *   date: 2026-11-11
 *   topics: Prayer, Psalms
 *   scripture: Romans 8:26          (optional: the main passage, linked to Bible.com)
 *   author: Name                    (optional)
 *   photo: https://… or /read/…jpg  (optional: without one, artwork is drawn)
 *   photoAlt: What the photo shows
 *   photoCredit: https://…          (optional: the photo's source page)
 *   draft: true                     (optional: hidden on the live site until removed)
 *   ---
 *
 *   The article, in Markdown: ## for headings, > for quotes, **bold**, *italic*, lists, links.
 *
 * Publishing is a commit: the site is rebuilt with the new file.
 */
const DIRECTORY = path.join(process.cwd(), "content", "articles");
const WORDS_PER_MINUTE = 230;

/** Every published article, newest first. */
export async function getArticles(): Promise<Article[]> {
  "use cache";
  // In development an edited file shows within about a minute (anything shorter-lived would
  // count as live data and stop the pages being prerendered); on the live site articles only
  // change with a new build, so they're kept for good.
  if (process.env.NODE_ENV === "development") cacheLife("minutes");
  else cacheLife("max");

  // Files starting with _ (like _template.md) are notes, not articles.
  const files = (await readdir(DIRECTORY)).filter((file) => file.endsWith(".md") && !file.startsWith("_"));
  const articles = await Promise.all(files.map(async (file) => parse(file.replace(/\.md$/, ""), await readFile(path.join(DIRECTORY, file), "utf8"))));
  return articles
    .filter((a): a is Article => a !== null)
    .filter((a) => !a.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await getArticles()).find((a) => a.slug === slug);
}

/** The details for cards and lists, without the article's text (smaller to send to the browser). */
export function summarise({ html, ...summary }: Article): ArticleSummary {
  void html;
  return summary;
}

function parse(slug: string, source: string): Article | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) {
    console.warn(`[read] ${slug}.md has no details at the top (between --- lines), so it's left out.`);
    return null;
  }
  const fields = parseFields(match[1]);
  const body = match[2].trim();
  if (!fields.title || !fields.date) {
    console.warn(`[read] ${slug}.md needs at least a title and a date, so it's left out.`);
    return null;
  }

  const words = body.replace(/[#>*_`[\]()-]/g, " ").split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: fields.title,
    summary: fields.summary ?? "",
    date: fields.date,
    topics: (fields.topics ?? "")
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({ name, slug: topicSlug(name) })),
    scripture: fields.scripture ? findScripture(fields.scripture) : undefined,
    author: fields.author,
    photo: fields.photo ? { src: fields.photo, alt: fields.photoAlt ?? "", credit: fields.photoCredit } : undefined,
    art: artFor(slug),
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    draft: fields.draft === "true",
    html: marked.parse(body, { async: false, gfm: true }),
  };
}

/** "key: value" lines; quotes around a value are optional. */
function parseFields(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const at = line.indexOf(":");
    if (at < 1 || line.trimStart().startsWith("#")) continue;
    const key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim().replace(/^(["'])([\s\S]*)\1$/, "$2");
    if (value) fields[key] = value;
  }
  return fields;
}

const MOTIFS: Motif[] = ["sunset", "orbits", "moon", "arch", "rays", "rings", "waves"];
const PALETTES: Palette[] = ["ember", "blush", "dusk", "forest", "sand", "ink"];

/** Artwork that's always the same for the same article, for those without a photo. */
function artFor(seed: string): ArtSpec {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return { motif: MOTIFS[hash % MOTIFS.length], palette: PALETTES[Math.floor(hash / MOTIFS.length) % PALETTES.length] };
}
