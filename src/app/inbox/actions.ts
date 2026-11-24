"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { message } from "@/db/schema";
import { getTeamSession } from "@/lib/team";

/** Marks a request done (prayed for, or answered), or back to new. Team only. */
export async function setMessageStatus(form: FormData) {
  if (!(await getTeamSession())) return;
  const id = String(form.get("id") ?? "");
  const status = form.get("status") === "done" ? "done" : "new";
  if (!id) return;
  await db.update(message).set({ status }).where(eq(message.id, id));
  refresh();
}

/** Deletes a message for good. Team only. */
export async function deleteMessage(form: FormData) {
  if (!(await getTeamSession())) return;
  const id = String(form.get("id") ?? "");
  if (!id) return;
  await db.delete(message).where(eq(message.id, id));
  refresh();
}
