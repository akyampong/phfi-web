import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Prayer requests and messages sent from the drawers (components/drawers), read by the team in /inbox.
 * Nothing here is ever shown publicly.
 */
export const message = sqliteTable(
  "message",
  {
    id: text("id").primaryKey(),
    /** "prayer" for a prayer request, "contact" for a general message. */
    kind: text("kind", { enum: ["prayer", "contact"] }).notNull(),
    /** Optional for prayer requests (they can be sent anonymously). */
    name: text("name"),
    email: text("email"),
    body: text("body").notNull(),
    /** For prayer requests: they'd like someone to get in touch. */
    followUp: integer("follow_up", { mode: "boolean" }).default(false).notNull(),
    /** "new" until someone on the team marks it done (prayed for, or answered). */
    status: text("status", { enum: ["new", "done"] }).default("new").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("message_created_at_idx").on(table.createdAt)],
);
