import { boolean, index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const messageKind = pgEnum("message_kind", ["prayer", "contact"]);
export const messageStatus = pgEnum("message_status", ["new", "done"]);

/**
 * Prayer requests and messages sent from the drawers (components/drawers), read by the team in
 * /inbox. Nothing here is ever shown publicly. A request sent while signed in is linked to the
 * account, so its sender can see it (and whether it's been prayed for) on /account.
 */
export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    kind: messageKind("kind").notNull(),
    /** The account it was sent from, if signed in. Deleting the account deletes these too. */
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    /** Optional for prayer requests (they can be sent anonymously). */
    name: text("name"),
    email: text("email"),
    body: text("body").notNull(),
    /** For prayer requests: they'd like someone to get in touch. */
    followUp: boolean("follow_up").default(false).notNull(),
    /** "new" until someone on the team marks it done (prayed for, or answered). */
    status: messageStatus("status").default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("message_created_at_idx").on(table.createdAt), index("message_user_id_idx").on(table.userId)],
);
