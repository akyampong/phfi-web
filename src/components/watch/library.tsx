"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { buttonSecondary } from "@/components/ui/styles";
import { meetingParam as toParam, type Message } from "@/lib/watch-types";
import { MessageCard } from "./cards";

// Three full rows of five on wide screens
const PAGE = 15;
const cardSizes = "(min-width: 1504px) 270px, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * Every message, newest first, with a choice of meeting. The choice is kept in the address
 * (/watch?meeting=jericho-hour#all), so the "See all" links on each meeting's row land here
 * already chosen, and Back returns to it. Fifteen at a time, with a button for more.
 * Render inside <Suspense> (it reads the address); MessageGrid makes a good fallback.
 */
export function Library({ messages, meetings, skip = 0 }: { messages: Message[]; meetings: string[]; skip?: number }) {
  const params = useSearchParams();
  const meeting = meetings.find((m) => toParam(m) === params.get("meeting")) ?? "";
  const [shown, setShown] = useState({ meeting: "", count: PAGE });
  // Back to twelve whenever the meeting changes.
  const count = shown.meeting === meeting ? shown.count : PAGE;
  // Unfiltered, it leaves out the newest few already shown above it; a chosen meeting shows all of its own
  const results = meeting ? messages.filter((m) => m.meeting === meeting) : messages.slice(skip);

  function choose(next: string) {
    // Replace (not push) the address: choosing isn't a new page for the Back button.
    const url = next ? `${window.location.pathname}?meeting=${toParam(next)}#all` : `${window.location.pathname}#all`;
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      {meetings.length > 0 && (
        // Scrolls sideways on phones rather than wrapping onto several lines
        <div role="group" aria-label="Meeting" className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-8 md:px-8">
          <Chip active={!meeting} onClick={() => choose("")}>
            All
          </Chip>
          {meetings.map((name) => (
            <Chip key={name} active={meeting === name} onClick={() => choose(meeting === name ? "" : name)}>
              {name}
            </Chip>
          ))}
        </div>
      )}

      <p aria-live="polite" className="mt-5 text-sm text-muted">
        {results.length} {results.length === 1 ? "message" : "messages"}
        {meeting && ` from ${meeting}`}
      </p>

      <MessageGrid messages={results.slice(0, count)} />
      {results.length > count && (
        <div className="mt-12 flex justify-center">
          <button type="button" onClick={() => setShown({ meeting, count: count + PAGE })} className={`${buttonSecondary} cursor-pointer`}>
            Show more
          </button>
        </div>
      )}
    </div>
  );
}

/** The grid of message cards: one column on phones, up to five on wide screens. */
export function MessageGrid({ messages }: { messages: Message[] }) {
  return (
    <ul className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {messages.map((message) => (
        <li key={message.slug}>
          <MessageCard message={message} sizes={cardSizes} withSummary />
        </li>
      ))}
    </ul>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 shrink-0 cursor-pointer whitespace-nowrap rounded-squircle-xs px-3.5 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-paper" : "bg-ink/[0.06] text-ink hover:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );
}
