import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { and, desc, eq, sql } from "drizzle-orm";
import { Check, Mail, RotateCcw } from "lucide-react";
import { actionButton } from "@/components/ui/styles";
import { meetingTimeZoneId } from "@/config/site";
import { db } from "@/db";
import { message } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isTeamEmail } from "@/lib/team";
import { setMessageStatus } from "./actions";
import { DeleteButton } from "./delete-button";

export const metadata: Metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

/**
 * The team's inbox: prayer requests and messages from the drawers (components/drawers), newest
 * first. Only for signed-in team members (TEAM_EMAILS); everyone else is sent to sign in, or
 * told it's private.
 */
export default function InboxPage({ searchParams }: PageProps<"/inbox">) {
  return (
    <div className="container-page pb-16 pt-10 md:pt-14">
      <div className="mx-auto max-w-[56rem]">
        <Suspense fallback={<div className="min-h-[60svh]" />}>
          <Inbox searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

const SHOW = { new: "New", done: "Done", all: "All" } as const;
const KINDS = { all: "Everything", prayer: "Prayer requests", contact: "Messages" } as const;

async function Inbox({ searchParams }: Pick<PageProps<"/inbox">, "searchParams">) {
  await connection();
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/inbox");
  if (!isTeamEmail(session.user.email)) {
    return (
      <div className="flex min-h-[50svh] flex-col justify-center">
        <h1 className="text-headline text-ink">This page is for the team</h1>
        <p className="mt-4 max-w-[46ch] text-[1rem] leading-relaxed text-body">
          You’re signed in as {session.user.email}, which isn’t on the team list. If that’s a mistake, ask whoever looks
          after the website to add you.
        </p>
      </div>
    );
  }

  const params = await searchParams;
  const show = pick(params.show, SHOW, "new");
  const kind = pick(params.kind, KINDS, "all");
  const filters = [
    show !== "all" ? eq(message.status, show) : undefined,
    kind !== "all" ? eq(message.kind, kind) : undefined,
  ].filter((f) => f !== undefined);
  const href = (next: { show?: string; kind?: string }) => `/inbox?${new URLSearchParams({ show: next.show ?? show, kind: next.kind ?? kind })}`;

  const [rows, [counts]] = await Promise.all([
    db
      .select()
      .from(message)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(message.createdAt))
      .limit(200),
    db
      .select({ fresh: sql<number>`sum(case when ${message.status} = 'new' then 1 else 0 end)` })
      .from(message),
  ]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline text-ink">Inbox</h1>
          <p className="mt-2 text-[0.95rem] text-muted">
            {counts?.fresh ? `${counts.fresh} new` : "Nothing new"} · Signed in as {session.user.name}
          </p>
        </div>
      </header>

      <nav aria-label="Filter" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <div className="flex gap-1.5">
          {Object.entries(SHOW).map(([value, label]) => (
            <Chip key={value} href={href({ show: value })} active={show === value}>
              {label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(KINDS).map(([value, label]) => (
            <Chip key={value} href={href({ kind: value })} active={kind === value}>
              {label}
            </Chip>
          ))}
        </div>
      </nav>

      {rows.length === 0 ? (
        <p className="mt-16 text-[1rem] text-muted">{show === "new" ? "You’re all caught up." : "Nothing here yet."}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {rows.map((row) => (
            <li key={row.id} className={`rounded-squircle-md p-6 ring-1 ring-rule ring-inset sm:p-7 dark:bg-canvas ${row.status === "done" ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="rounded-squircle-xs bg-ink/[0.06] px-2 py-0.5 text-xs font-semibold text-ink">
                  {row.kind === "prayer" ? "Prayer request" : "Message"}
                </span>
                <span className="font-semibold text-ink">{row.name || "Anonymous"}</span>
                {row.email && (
                  <a href={`mailto:${row.email}`} className="text-muted underline-offset-4 hover:text-ink hover:underline">
                    {row.email}
                  </a>
                )}
                <span className="text-muted">· {formatWhen(row.createdAt)}</span>
              </div>
              {row.followUp && <p className="mt-3 text-sm font-semibold text-ink">Would like someone to get in touch</p>}
              <p className="mt-4 whitespace-pre-line break-words text-[1rem] leading-relaxed text-body">{row.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value={row.status === "done" ? "new" : "done"} />
                  <button type="submit" className={actionButton}>
                    {row.status === "done" ? <RotateCcw aria-hidden className="size-4" /> : <Check aria-hidden className="size-4" />}
                    {row.status === "done" ? "Mark as new" : row.kind === "prayer" ? "Prayed for" : "Done"}
                  </button>
                </form>
                {row.email && (
                  <a href={`mailto:${row.email}?subject=${encodeURIComponent(row.kind === "prayer" ? "Your prayer request" : "Your message to Purpose House")}`} className={actionButton}>
                    <Mail aria-hidden className="size-4" />
                    Reply
                  </a>
                )}
                <DeleteButton id={row.id} className={actionButton} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-9 items-center rounded-squircle-xs px-3.5 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-paper" : "bg-ink/[0.06] text-ink hover:bg-ink/10"
      }`}
    >
      {children}
    </Link>
  );
}

function pick<T extends Record<string, string>>(value: string | string[] | undefined, options: T, fallback: keyof T & string): keyof T & string {
  return typeof value === "string" && value in options ? value : fallback;
}

/** "Nov 23, 7:45 PM", in the church's time zone. */
function formatWhen(date: Date) {
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: meetingTimeZoneId });
}
