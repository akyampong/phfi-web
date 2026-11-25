import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { and, desc, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { SignInPrompt } from "@/components/auth/sign-in-prompt";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ArticleCard } from "@/components/read/cards";
import { Avatar } from "@/components/ui/avatar";
import { actionButton, bodyText, groupUnderline, metaCaps, textLink } from "@/components/ui/styles";
import { MessageCard } from "@/components/watch/cards";
import { meetingTimeZoneId } from "@/config/site";
import { db } from "@/db";
import { message, savedItem, watchProgress } from "@/db/schema";
import { getArticles, summarise } from "@/lib/articles";
import { getSession } from "@/lib/session";
import { getCatalogue } from "@/lib/watch";
import { DeleteAccount } from "./delete-account";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

/**
 * Someone's own corner of the site: messages to pick up where they left off, what they've
 * saved, the prayer requests they've sent, and their details. Signed out, it asks them to
 * sign in (the modal), and refreshes into itself once they have.
 */
export default function AccountPage() {
  return (
    <div className="container-page pb-12 md:pb-16 lg:pb-20">
      <div className="content-width pt-12 md:pt-16 lg:pt-20">
        <Suspense fallback={<div className="min-h-[60svh]" />}>
          <Account />
        </Suspense>
      </div>
    </div>
  );
}

/** Watched less than this, it hasn't really been started; within this of the end, it's finished. */
const STARTED = 30;
const NEARLY_DONE = 0.95;

async function Account() {
  await connection();
  const session = await getSession();
  if (!session)
    return (
      <SignInPrompt
        title="Your account"
        text="Sign in to save messages and articles, pick up videos where you left off, and keep your prayer requests together."
      />
    );

  const { user } = session;
  const [progress, saved, requests, catalogue, articles] = await Promise.all([
    db
      .select({ slug: watchProgress.slug, seconds: watchProgress.seconds, duration: watchProgress.duration })
      .from(watchProgress)
      .where(eq(watchProgress.userId, user.id))
      .orderBy(desc(watchProgress.updatedAt))
      .limit(24),
    db
      .select({ kind: savedItem.kind, slug: savedItem.slug })
      .from(savedItem)
      .where(eq(savedItem.userId, user.id))
      .orderBy(desc(savedItem.savedAt)),
    db
      .select({ id: message.id, body: message.body, status: message.status, createdAt: message.createdAt })
      .from(message)
      .where(and(eq(message.userId, user.id), eq(message.kind, "prayer")))
      .orderBy(desc(message.createdAt))
      .limit(50),
    getCatalogue(),
    getArticles(),
  ]);

  const bySlug = new Map(catalogue.messages.map((m) => [m.slug, m]));
  const articleBySlug = new Map(articles.map((a) => [a.slug, a]));

  const watching = progress
    .flatMap((row) => {
      const item = bySlug.get(row.slug);
      const length = row.duration ?? item?.seconds;
      if (!item || row.seconds < STARTED || (length && row.seconds / length >= NEARLY_DONE)) return [];
      return [{ message: item, progress: length ? row.seconds / length : undefined }];
    })
    .slice(0, 8);
  const savedMessages = saved.flatMap((row) => (row.kind === "message" && bySlug.get(row.slug) ? [bySlug.get(row.slug)!] : []));
  const savedArticles = saved.flatMap((row) => {
    const article = row.kind === "article" && articleBySlug.get(row.slug);
    return article ? [summarise(article)] : [];
  });

  const name = user.name?.trim() ?? "";

  return (
    <div className="flex flex-col gap-24 md:gap-32">
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
        <div className="flex min-w-0 items-center gap-5">
          <Avatar id={user.id} image={user.image} size={72} />
          <div className="min-w-0">
            <h1 className="truncate text-page-sm text-ink">{name || "Your account"}</h1>
            <p className="mt-1.5 truncate text-[1rem] text-muted">{user.email}</p>
          </div>
        </div>
        <SignOutButton className={actionButton} />
      </header>

      {watching.length > 0 && (
        <Section id="continue" title="Continue watching">
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {watching.map(({ message: item, progress: done }) => (
              <li key={item.slug}>
                <MessageCard message={item} progress={done} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" />
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="saved" title="Saved">
        {savedMessages.length === 0 && savedArticles.length === 0 ? (
          <Empty
            text="Save a message or an article and it’ll be kept here for later."
            links={[
              { href: "/watch", label: "Watch" },
              { href: "/read", label: "Read" },
            ]}
          />
        ) : (
          <div className="flex flex-col gap-14">
            {savedMessages.length > 0 && (
              <div>
                <h3 className={metaCaps}>Messages</h3>
                <ul className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                  {savedMessages.map((item) => (
                    <li key={item.slug}>
                      <MessageCard message={item} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {savedArticles.length > 0 && (
              <div>
                <h3 className={metaCaps}>Articles</h3>
                <ul className="mt-5 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                  {savedArticles.map((article) => (
                    <li key={article.slug}>
                      <ArticleCard article={article} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section
        id="prayer"
        title="Your prayer requests"
        action={
          <a href="#pray" className={textLink}>
            <span className={groupUnderline}>Send a prayer request</span>
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        }
      >
        {requests.length === 0 ? (
          <Empty text="Prayer requests you send while signed in show here, with a note once the team has prayed for them." />
        ) : (
          <ul className="flex max-w-[46rem] flex-col gap-10">
            {requests.map((request) => (
              <li key={request.id}>
                <p className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${metaCaps}`}>
                  <time dateTime={request.createdAt.toISOString()}>{formatSent(request.createdAt)}</time>
                  <span
                    className={`rounded-full px-2.5 py-0.5 normal-case ${
                      request.status === "done" ? "bg-ink text-paper" : "bg-ink/[0.07] text-ink"
                    }`}
                  >
                    {request.status === "done" ? "Prayed for" : "Received"}
                  </span>
                </p>
                <p className="mt-3 line-clamp-4 whitespace-pre-line text-[1rem] leading-relaxed text-body">{request.body}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="details" title="Your details">
        <ProfileForm name={name} email={user.email} />
        <div className="mt-16">
          <h3 className="text-[1rem] font-semibold text-ink">Delete your account</h3>
          <p className="mt-2 max-w-[46ch] text-[0.95rem] leading-relaxed text-body">
            Removes your account and everything saved with it.
          </p>
          <div className="mt-5">
            <DeleteAccount />
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 id={`${id}-title`} className="text-section text-ink">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-6 md:mt-8">{children}</div>
    </section>
  );
}

function Empty({ text, links = [] }: { text: string; links?: { href: string; label: string }[] }) {
  return (
    <div>
      <p className={`max-w-[46ch] ${bodyText}`}>{text}</p>
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={actionButton}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatSent(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: meetingTimeZoneId });
}
