"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { CLOSE_MENU } from "@/components/layout/site-menu";
import { useSession } from "@/lib/auth-client";
import { NameForm, SignInForm } from "./sign-in-form";

/** Any link to this opens the sign-in modal instead of going anywhere: <Link href="#sign-in">. */
export const SIGN_IN_HASH = "#sign-in";

/**
 * Sign-in, as a modal over whatever page someone is on: any "#sign-in" link opens it (the
 * header's Sign in, the menu's, a "sign in to save" prompt), and /sign-in opens it over the
 * home page. Once signed in it closes and the page refreshes in place, so they carry on where
 * they were.
 *
 * Anyone signed in without a name (a first sign-in by email, or an account from before names
 * were asked for) is asked for one here, on whichever page they're on, before carrying on.
 */
export function SignInModal({ googleEnabled }: { googleEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  /** Bumped on each opening, so the form starts afresh. */
  const [round, setRound] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  /** Just signed in by email with no name: ask straight away, before the session catches up. */
  const [justSignedIn, setJustSignedIn] = useState(false);
  /** Who just gave their name, so the question goes at once rather than when the session catches up. */
  const [namedId, setNamedId] = useState<string | null>(null);
  const askName = (justSignedIn || Boolean(session && !session.user.name?.trim())) && !(namedId && namedId === session?.user.id);
  // Once someone is signed in, the sign-in form's job is done: forget it was opened, so it
  // doesn't come back if they sign out later
  const userId = session?.user.id;
  const [seenUserId, setSeenUserId] = useState(userId);
  if (userId !== seenUserId) {
    setSeenUserId(userId);
    if (userId && open) setOpen(false);
  }
  // The sign-in form is never shown to someone already signed in (say /…#sign-in was reloaded
  // before their session had loaded)
  const visible = (open && !session) || askName;
  // Read by the Escape handler, which is set up once per opening
  const askNameRef = useRef(askName);
  const signedInRef = useRef(false);
  useEffect(() => {
    askNameRef.current = askName;
    signedInRef.current = Boolean(session);
  }, [askName, session]);

  function close() {
    if (!askNameRef.current) setOpen(false);
  }

  useEffect(() => {
    const show = () => {
      // Already signed in (a stale link, or /…#sign-in reloaded): nothing to do
      if (signedInRef.current) return;
      // The menu may be open (its Sign in link): close it, so the modal isn't over it
      window.dispatchEvent(new Event(CLOSE_MENU));
      setRound((r) => r + 1);
      setOpen(true);
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link?.getAttribute("href")?.endsWith(SIGN_IN_HASH)) return;
      event.preventDefault();
      event.stopPropagation();
      returnTo.current = link as HTMLElement;
      show();
    };
    const fromAddress = () => {
      if (window.location.hash !== SIGN_IN_HASH) return;
      show();
      clearHash();
    };
    fromAddress();
    window.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", fromAddress);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", fromAddress);
    };
  }, []);

  // Closing: make sure the address no longer opens it again on reload
  useEffect(() => {
    if (!visible) clearHash();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const back = returnTo.current;
    const field = panelRef.current?.querySelector<HTMLElement>("input:not([type=hidden])");
    (field ?? closeRef.current)?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !askNameRef.current) setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      back?.focus();
    };
  }, [visible]);

  // Keep Tab inside the modal while it's open
  function trapFocus(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled])")].filter(
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
    <div
      inert={!visible}
      // Visible at once when opening (a hidden element can't take focus), hidden only after the
      // fade out has finished when closing
      className={`fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6 ${
        visible ? "visible" : "invisible transition-[visibility] duration-300"
      }`}
    >
      {/* The page behind, dimmed; clicking it closes the modal */}
      <div
        aria-hidden
        onClick={close}
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-in-title"
        onKeyDown={trapFocus}
        // A sheet from the bottom on phones; on wider screens a card in the middle, with a
        // panel of artwork and what an account is for beside the form
        className={`relative grid max-h-[92svh] w-full overflow-y-auto rounded-t-[1.75rem] bg-paper shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] transition-[translate,opacity,scale] duration-300 ease-out motion-reduce:transition-none sm:max-w-[28rem] sm:rounded-squircle-lg md:max-w-[56rem] md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-1.5 dark:ring-1 dark:ring-white/10 ${
          visible ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-8 opacity-0 sm:translate-y-0 sm:scale-[0.97]"
        }`}
      >
        <Welcome />
        <div className="relative px-6 pb-8 pt-7 sm:px-9 sm:pb-10 sm:pt-9 md:flex md:min-h-[35rem] md:flex-col md:justify-center md:px-12 md:py-12">
          {!askName && (
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute right-3 top-3 inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink sm:right-4 sm:top-4"
            >
              <X className="size-5" />
            </button>
          )}
          {/* A narrow column for the form, centred in the space beside the photo */}
          <div className="md:mx-auto md:w-full md:max-w-[20rem]">
            {askName ? (
              <NameForm
                onDone={() => {
                  setNamedId(session?.user.id ?? null);
                  setJustSignedIn(false);
                  setOpen(false);
                  router.refresh();
                }}
              />
            ) : (
              <SignInForm
                key={round}
                googleEnabled={googleEnabled}
                onSignedIn={(user) => {
                  if (!user?.name?.trim()) setJustSignedIn(true);
                  setOpen(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function clearHash() {
  if (window.location.hash === SIGN_IN_HASH)
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
}

/** The panel beside the form on wider screens: a photo from worship, the logo, and one line of welcome. */
function Welcome() {
  return (
    <div className="relative hidden overflow-hidden rounded-squircle-md bg-night p-9 text-white md:flex md:flex-col md:justify-between">
      <Image src="/assets/bg.avif" alt="" fill sizes="448px" className="object-cover object-[45%_50%]" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30" />
      <div className="relative">
        <Logo tone="onDark" />
      </div>
      <p className="relative max-w-[18rem] text-[1.75rem] font-medium leading-tight tracking-[-0.02em] text-balance">
        There’s a place for you in this family.
      </p>
    </div>
  );
}
