import { index, integer, pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const savedKind = pgEnum("saved_kind", ["message", "article"]);

/**
 * What someone has saved to come back to: messages (videos) and articles, by their address
 * slug. Shown on /account.
 */
export const savedItem = pgTable(
  "saved_item",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: savedKind("kind").notNull(),
    slug: text("slug").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.kind, table.slug] }), index("saved_item_user_idx").on(table.userId, table.savedAt)],
);

/**
 * How far someone got through each message, so they can carry on where they stopped
 * ("Continue watching" on /account, and the player offering to resume).
 */
export const watchProgress = pgTable(
  "watch_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    /** Where they stopped, in seconds. */
    seconds: integer("seconds").notNull(),
    /** The video's length, in seconds, when known. */
    duration: integer("duration"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.slug] }), index("watch_progress_user_idx").on(table.userId, table.updatedAt)],
);
