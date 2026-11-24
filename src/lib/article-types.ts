import type { ArtSpec } from "@/components/art/artwork";
import type { Photo } from "@/components/art/cover";
import type { Scripture } from "@/lib/bible";

export type Topic = { name: string; slug: string };

/** An article's details: everything but its text. Safe to send to the browser. */
export type ArticleSummary = {
  /** Its address: /read/{slug}. */
  slug: string;
  title: string;
  /** One or two sentences, for cards and search results. */
  summary: string;
  /** ISO date. */
  date: string;
  topics: Topic[];
  /** The main passage, when it has one. */
  scripture?: Scripture;
  author?: string;
  photo?: Photo;
  /** Drawn instead when there's no photo. */
  art: ArtSpec;
  /** Reading time, in minutes. */
  minutes: number;
  /** Only shown in development. */
  draft: boolean;
};

/** An article with its text, as HTML. */
export type Article = ArticleSummary & { html: string };

/** "Spiritual habits" → "spiritual-habits", for the address (/read?topic=…). */
export function topicSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
