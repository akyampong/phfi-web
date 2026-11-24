"use client";

import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, X } from "lucide-react";
import { sendMessage, type SendState } from "./actions";

type Kind = "prayer" | "contact";

/**
 * Links that open a drawer instead of going anywhere, from any page: <Link href="#pray">
 * opens the prayer request form, <Link href="#contact"> the contact form.
 */
const HASHES: Record<string, Kind> = { "#pray": "prayer", "#contact": "contact" };

const copy: Record<Kind, { title: string; intro: string; thanks: string; thanksText: string; another: string }> = {
  prayer: {
    title: "Prayer request",
    intro: "Whatever you’re carrying, you don’t have to carry it alone. Our prayer team will pray for you by name.",
    thanks: "Thank you. We’re praying with you.",
    thanksText: "Your request is with our prayer team, and only they will see it.",
    another: "Send another",
  },
  contact: {
    title: "Get in touch",
    intro: "A question about the fellowship, giving or getting involved, or simply hello. Someone from the team will reply.",
    thanks: "Thank you. Your message is with us.",
    thanksText: "Someone from the team will reply by email, usually within a few days.",
    another: "Send another message",
  },
};

/**
 * The prayer request and contact drawers: a dark panel that slides in from the right, like the
 * menu, with a short form. They aren't pages: any link to "#pray" or "#contact", anywhere on the
 * site, opens one over whatever you're doing (a live stream keeps playing). /prayer and /contact
 * lead to the home page with it open. What's sent goes to the team's inbox (/inbox).
 */
export function Drawers() {
  const [open, setOpen] = useState(false);
  /** Which form; kept while it slides out, so it doesn't change on the way. */
  const [kind, setKind] = useState<Kind>("prayer");
  /** Bumped after something is sent and closed, so the next opening shows a fresh form. */
  const [formKeys, setFormKeys] = useState<Record<Kind, number>>({ prayer: 0, contact: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Whatever had focus before it opened, to return to when it closes. */
  const returnTo = useRef<HTMLElement | null>(null);

  // Open on any "#pray" / "#contact" link (before Next's links act on it), and when the page
  // loads with one in its address (/prayer redirects to /#pray).
  useEffect(() => {
    const openFor = (hash: string) => {
      const which = HASHES[hash];
      if (!which) return false;
      setKind(which);
      setOpen(true);
      return true;
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      const hash = href.slice(href.indexOf("#"));
      if (!link || !href.includes("#") || !HASHES[hash]) return;
      event.preventDefault();
      event.stopPropagation();
      returnTo.current = link as HTMLElement;
      openFor(hash);
    };
    const fromAddress = () => {
      if (openFor(window.location.hash)) {
        // Take the hash back out of the address, so closing and reloading don't reopen it
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      }
    };
    fromAddress();
    window.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", fromAddress);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", fromAddress);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const back = returnTo.current;
    // The first box of the open form, ready to type; the × if it has been sent
    const field = panelRef.current?.querySelector<HTMLElement>(`[data-form="${kind}"] :is(textarea, input[type=text], input[type=email]):not([tabindex="-1"])`);
    (field ?? closeRef.current)?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      back?.focus();
    };
  }, [open, kind]);

  // Keep Tab inside the drawer while it's open
  function trapFocus(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([tabindex='-1']), textarea")].filter(
      (el) => el.getClientRects().length > 0,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }

  return (
    <div inert={!open} className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Clicking the page beside the drawer closes it */}
      <div aria-hidden onClick={() => setOpen(false)} className="absolute inset-0" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        onKeyDown={trapFocus}
        // As the menu: visible at once when opening (so focus can move in), hidden only after
        // the slide out has finished
        className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-night text-night-text duration-300 ease-out motion-reduce:transition-none sm:w-[440px] [&_:focus-visible]:outline-white ${
          open ? "visible translate-x-0 transition-[translate]" : "invisible translate-x-full transition-[translate,visibility]"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-end px-5 sm:px-8 lg:h-16">
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-mr-2 inline-flex size-10 cursor-pointer items-center justify-center text-night-text hover:text-white"
          >
            <X className="size-6" />
          </button>
        </div>
        <div className="px-5 pb-10 pt-3 sm:px-8">
          <h2 id="drawer-title" className="text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-white">
            {copy[kind].title}
          </h2>
          <p className="mt-3 text-[0.98rem] leading-relaxed text-night-text">{copy[kind].intro}</p>
          {/* Both forms stay in the page, so a half-written one is still there next time */}
          {(["prayer", "contact"] as const).map((which) => (
            <div key={which} data-form={which} hidden={kind !== which} className="mt-9">
              <DrawerForm
                key={formKeys[which]}
                kind={which}
                onDone={() => {
                  setOpen(false);
                  // After the slide out, so the thank-you doesn't vanish while it's still showing
                  setTimeout(() => setFormKeys((keys) => ({ ...keys, [which]: keys[which] + 1 })), 350);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const field =
  "w-full rounded-squircle-xs border border-transparent bg-white/10 px-4 text-[1rem] text-white placeholder:text-night-muted transition-colors focus:border-white/40 focus:bg-white/15 focus:outline-none aria-[invalid=true]:border-[#ff8a80]";
const label = "text-sm font-semibold text-white";
const optional = <span className="font-normal text-night-muted">(optional)</span>;

/** One drawer's form. It works without JavaScript too; after sending, a thank-you takes its place. */
function DrawerForm({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const [state, action, pending] = useActionState<SendState, FormData>(sendMessage, { status: "idle" });
  const [round, setRound] = useState(0);
  // The "sent" answer already dismissed with "Send another": the next one shows its own thanks.
  const [dismissed, setDismissed] = useState<SendState | null>(null);
  const [followUp, setFollowUp] = useState(false);
  const started = useRef<HTMLInputElement>(null);
  const error = state.status === "error" ? state : undefined;
  // React empties a form once its action finishes; after an error, put back what was written.
  const values = error?.values;
  const prayer = kind === "prayer";
  const id = (name: string) => `${kind}-${name}`;

  // When the form appeared, so one sent within moments (a bot) can be told apart.
  useEffect(() => {
    if (started.current) started.current.value = String(Date.now());
  }, [round]);

  if (state.status === "sent" && state !== dismissed) {
    return (
      <div role="status" className="flex flex-col items-start gap-5">
        <span className="flex size-12 items-center justify-center rounded-full bg-white text-coal">
          <Check aria-hidden className="size-6" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-lg font-semibold text-white">{copy[kind].thanks}</p>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-night-text">{copy[kind].thanksText}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={onDone} className={whiteButton}>
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              setDismissed(state);
              setFollowUp(false);
              setRound((r) => r + 1);
            }}
            className={glassButton}
          >
            {copy[kind].another}
          </button>
        </div>
      </div>
    );
  }

  const body = (
    <div className="flex flex-col gap-2">
      <label htmlFor={id("body")} className={label}>
        {prayer ? "What would you like us to pray about?" : "Message"}
      </label>
      <textarea
        id={id("body")}
        name="body"
        required
        rows={prayer ? 6 : 7}
        maxLength={5000}
        defaultValue={values?.body}
        aria-invalid={error?.field === "body"}
        className={`${field} min-h-40 resize-y py-3 leading-relaxed`}
      />
    </div>
  );

  return (
    <form key={round} action={action} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="kind" value={kind} />
      <input ref={started} type="hidden" name="startedAt" defaultValue="" />
      {/* Hidden from people; bots fill it in */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* A prayer request starts with the request; a message with who it's from */}
      {prayer && body}
      <div className="flex flex-col gap-2">
        <label htmlFor={id("name")} className={label}>
          Name {prayer && optional}
        </label>
        <input id={id("name")} name="name" type="text" autoComplete="name" maxLength={100} required={!prayer} defaultValue={values?.name} aria-invalid={error?.field === "name"} className={`${field} h-12`} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={id("email")} className={label}>
          Email {prayer && !followUp && optional}
        </label>
        <input id={id("email")} name="email" type="email" autoComplete="email" maxLength={200} required={!prayer || followUp} defaultValue={values?.email} aria-invalid={error?.field === "email"} className={`${field} h-12`} />
      </div>
      {!prayer && body}
      {prayer && (
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-snug text-night-text">
          <input type="checkbox" name="followUp" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} className="mt-0.5 size-[1.125rem] shrink-0 cursor-pointer accent-white" />
          I’d like someone to get in touch with me
        </label>
      )}

      {error && (
        <p role="alert" className="text-[0.95rem] font-medium text-[#ff8a80]">
          {error.message}
        </p>
      )}

      <div>
        <button type="submit" disabled={pending} className={`${whiteButton} w-full disabled:cursor-wait disabled:opacity-60`}>
          {pending ? "Sending…" : prayer ? "Send prayer request" : "Send message"}
        </button>
        <p className="mt-4 text-sm leading-relaxed text-night-muted">
          {prayer ? "Private: only our prayer team sees requests. They’re never shared or shown on the site." : "We’ll reply to the email address you give."}
        </p>
      </div>
    </form>
  );
}

/** The drawer's buttons, as at the foot of the menu: solid white, and frosted glass. */
const buttonBase =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-squircle-xs px-5 text-[0.95rem] font-semibold transition-[background-color,scale] duration-200 active:scale-[0.98]";
const whiteButton = `${buttonBase} bg-white text-coal hover:bg-white/90`;
const glassButton = `${buttonBase} bg-white/12 text-white hover:bg-white/20`;
