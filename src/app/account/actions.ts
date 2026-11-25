"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { savedItem, watchProgress } from "@/db/schema";
import { getSession } from "@/lib/session";

type Kind = "message" | "article";

/** Whether this page is saved, and whether anyone is signed in to save it. */
export async function getSavedState(kind: Kind, slug: string): Promise<{ signedIn: boolean; saved: boolean }> {
  const session = await getSession();
  if (!session) return { signedIn: false, saved: false };
  const rows = await db
    .select({ slug: savedItem.slug })
    .from(savedItem)
    .where(and(eq(savedItem.userId, session.user.id), eq(savedItem.kind, kind), eq(savedItem.slug, slug)))
    .limit(1);
  return { signedIn: true, saved: rows.length > 0 };
}

/** Saves or unsaves a message or article for the signed-in person. Returns whether it's saved now. */
export async function setSaved(kind: Kind, slug: string, saved: boolean): Promise<boolean> {
  const session = await getSession();
  if (!session || !slug || slug.length > 200) return false;
  if (saved) {
    await db.insert(savedItem).values({ userId: session.user.id, kind, slug }).onConflictDoNothing();
  } else {
    await db.delete(savedItem).where(and(eq(savedItem.userId, session.user.id), eq(savedItem.kind, kind), eq(savedItem.slug, slug)));
  }
  return saved;
}

/** Where the signed-in person stopped in a message, in seconds (or null: not signed in, or never watched). */
export async function getProgress(slug: string): Promise<{ seconds: number; duration: number | null } | null> {
  const session = await getSession();
  if (!session) return null;
  const [row] = await db
    .select({ seconds: watchProgress.seconds, duration: watchProgress.duration })
    .from(watchProgress)
    .where(and(eq(watchProgress.userId, session.user.id), eq(watchProgress.slug, slug)))
    .limit(1);
  return row ?? null;
}

/** Remembers where the signed-in person has got to in a message. Quietly does nothing otherwise. */
export async function saveProgress(slug: string, seconds: number, duration?: number): Promise<void> {
  const session = await getSession();
  if (!session || !slug || slug.length > 200 || !Number.isFinite(seconds) || seconds < 0) return;
  const at = Math.floor(seconds);
  const length = duration && Number.isFinite(duration) && duration > 0 ? Math.floor(duration) : null;
  await db
    .insert(watchProgress)
    .values({ userId: session.user.id, slug, seconds: at, duration: length })
    .onConflictDoUpdate({
      target: [watchProgress.userId, watchProgress.slug],
      set: { seconds: at, duration: sql`coalesce(${length}, ${watchProgress.duration})`, updatedAt: new Date() },
    });
}

/** Takes a message off "Continue watching". */
export async function clearProgress(slug: string): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await db.delete(watchProgress).where(and(eq(watchProgress.userId, session.user.id), eq(watchProgress.slug, slug)));
}
