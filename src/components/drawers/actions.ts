"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/db";
import { message } from "@/db/schema";
import { getSession } from "@/lib/session";

export type SendState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string; field?: "name" | "email" | "body"; values: Values };

/** What was written, handed back with an error so the form keeps it. */
export type Values = { name: string; email: string; body: string };

const LIMITS = { name: 100, email: 200, body: 5000 };
/** Anyone sending more than this many in ten minutes is asked to wait. */
const PER_TEN_MINUTES = 5;
const recent = new Map<string, number[]>();

/**
 * Saves a prayer request or a message from the drawers (see drawers.tsx) for the team's
 * inbox (/inbox).
 * Bots are turned away quietly (they're told it worked): a hidden "website" field people
 * never see, and forms sent within three seconds of the page loading.
 */
export async function sendMessage(_previous: SendState, form: FormData): Promise<SendState> {
  const kind = form.get("kind") === "contact" ? "contact" : "prayer";
  const name = text(form, "name");
  const email = text(form, "email");
  const body = text(form, "body");
  const followUp = form.get("followUp") === "on";
  const values = { name, email, body };

  // Bots: the hidden field filled in, or sent faster than anyone could type
  const startedAt = Number(form.get("startedAt"));
  if (text(form, "website") || !Number.isFinite(startedAt) || Date.now() - startedAt < 3_000) return { status: "sent" };

  if (!body) return fail(values, { field: "body", message: kind === "prayer" ? "Please write your prayer request." : "Please write your message." });
  if (body.length > LIMITS.body) return fail(values, { field: "body", message: `Please keep it under ${LIMITS.body.toLocaleString()} characters.` });
  if (name.length > LIMITS.name) return fail(values, { field: "name", message: "That name is too long." });
  if (kind === "contact" && !name) return fail(values, { field: "name", message: "Please tell us your name." });
  // A message always needs a way to reply; a prayer request only if they'd like us to get in touch
  if ((kind === "contact" || followUp) && !email) return fail(values, { field: "email", message: "Please add your email so we can reply." });
  if (email && (email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))
    return fail(values, { field: "email", message: "That email address doesn’t look right." });

  // A few at a time from any one connection
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const times = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (times.length >= PER_TEN_MINUTES) return fail(values, { message: "You’ve sent a few already. Please try again in a few minutes." });
  recent.set(ip, [...times, now]);

  // Signed in: linked to the account, so it shows on /account (with whether it's been prayed for)
  const session = await getSession().catch(() => null);

  try {
    await db.insert(message).values({
      id: randomUUID(),
      kind,
      userId: session?.user.id ?? null,
      name: name || null,
      email: email || null,
      body,
      followUp: kind === "prayer" && followUp,
    });
  } catch (error) {
    console.error(`[${kind}] Could not save a ${kind === "prayer" ? "prayer request" : "message"}:`, error);
    return fail(values, { message: "Something went wrong on our side. Please try again in a moment." });
  }
  return { status: "sent" };
}

function fail(values: Values, error: { message: string; field?: "name" | "email" | "body" }): SendState {
  return { status: "error", ...error, values };
}

function text(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}
