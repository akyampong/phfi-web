"use client";

import { useEffect, useRef, useState, useTransition, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";
import { authClient } from "@/lib/auth-client";

const input =
  "h-12 w-full rounded-squircle-xs border border-rule bg-paper px-4 text-[1rem] text-ink transition-colors placeholder:text-muted/70 focus:border-ink focus:outline-none";
/** The modal's titles: a little larger than a section heading, smaller than a page title. */
const title = "text-[clamp(1.5rem,1.3rem+0.6vw,1.875rem)] font-medium leading-tight tracking-[-0.02em] text-ink";
const RESEND_AFTER = 30;

/**
 * Passwordless sign-in: "Continue with Google", or an email address and the six-digit code sent
 * to it. A new address makes a new account. Afterwards they stay on the page they were on, now
 * signed in (`onSignedIn` closes the modal around it).
 */
export function SignInForm({
  googleEnabled,
  onSignedIn,
}: {
  googleEnabled: boolean;
  /** With who signed in, so the modal can ask for a name if there isn't one. */
  onSignedIn: (user?: { name?: string | null }) => void;
}) {
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);
  const [pending, startTransition] = useTransition();
  const codeRef = useRef<HTMLInputElement>(null);

  // Count down to when another code can be sent
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  // On to the code: put the cursor in it (once it's no longer disabled by the pending send)
  useEffect(() => {
    if (step === "code" && !pending) codeRef.current?.focus();
  }, [step, pending]);

  function sendCode() {
    setError("");
    startTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" });
      if (error) {
        setError(error.status === 429 ? "Too many tries. Please wait a minute." : "We couldn’t send a code to that address. Check it and try again.");
        return;
      }
      setCode("");
      setStep("code");
      setWait(RESEND_AFTER);
    });
  }

  function verify(value: string) {
    setError("");
    startTransition(async () => {
      const { data, error } = await authClient.signIn.emailOtp({ email: email.trim(), otp: value });
      if (error) {
        setCode("");
        codeRef.current?.focus();
        setError(
          error.status === 429 || error.code === "TOO_MANY_ATTEMPTS"
            ? "Too many tries. Please ask for a new code."
            : error.code === "OTP_EXPIRED"
              ? "That code has expired. Please ask for a new one."
              : "That code isn’t right. Check the email and try again.",
        );
        return;
      }
      onSignedIn(data?.user);
      router.refresh();
    });
  }

  function google() {
    setError("");
    startTransition(async () => {
      // Google sends them back to this same page, signed in
      const here = window.location.pathname + window.location.search;
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: here });
      if (error) setError("Google sign-in didn’t work. Please try again, or use your email.");
    });
  }

  if (step === "code") {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setError("");
          }}
          className="-ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full py-1 pl-1 pr-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </button>
        <span aria-hidden className="mt-7 flex size-11 items-center justify-center rounded-full bg-ink/[0.06] text-ink">
          <MailCheck className="size-[1.375rem]" />
        </span>
        <h2 id="sign-in-title" className={`mt-4 ${title}`}>
          Check your email
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-body">
          Enter the six-digit code we sent to <span className="break-words font-semibold text-ink">{email.trim()}</span>.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) verify(code);
          }}
          className="mt-7 flex flex-col gap-3"
        >
          <CodeField
            ref={codeRef}
            value={code}
            disabled={pending}
            invalid={Boolean(error)}
            onChange={(digits) => {
              setCode(digits);
              if (error) setError("");
              // Six digits in: sign in straight away
              if (digits.length === 6) verify(digits);
            }}
          />
          {error && (
            <p role="alert" className="text-[0.95rem] font-medium text-live">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending || code.length !== 6} className={`${buttonPrimary} h-12 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          The code works for 10 minutes. Not there? Check spam, or{" "}
          {wait > 0 ? (
            <span className="tabular-nums">send another in {wait}s.</span>
          ) : (
            <button type="button" onClick={sendCode} disabled={pending} className="cursor-pointer font-semibold text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink">
              send another
            </button>
          )}
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-xs text-muted">Development: without RESEND_API_KEY, the code is printed in the terminal running the site.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 id="sign-in-title" className={title}>
        Sign in
      </h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-body">New here? The same steps make your account. No password needed.</p>
      <div className="mt-7 flex flex-col gap-3">
        {googleEnabled && (
          <>
            <button type="button" onClick={google} disabled={pending} className={`${buttonSecondary} h-12 w-full cursor-pointer gap-3 disabled:opacity-60`}>
              <GoogleMark />
              Continue with Google
            </button>
            <p className="py-1 text-center text-xs font-medium uppercase text-muted">or</p>
          </>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) sendCode();
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor="sign-in-email" className="sr-only">
            Email
          </label>
          <input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="Your email address"
            aria-invalid={Boolean(error)}
            className={input}
          />
          {error && (
            <p role="alert" className="text-[0.95rem] font-medium text-live">
              {error}
            </p>
          )}
          <button type="submit" disabled={pending || !email.trim()} className={`${buttonPrimary} h-12 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
            {pending ? "Sending a code…" : "Continue with email"}
          </button>
        </form>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-muted">We’ll email you a six-digit code to sign in with.</p>
    </div>
  );
}

/**
 * After a first sign-in by email (or for an account made before names were asked for): what
 * should we call you? It's how they show to the team on prayer requests and in the header.
 */
export function NameForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  function save() {
    const value = name.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!value) return;
    setError("");
    startTransition(async () => {
      const { error } = await authClient.updateUser({ name: value });
      if (error) {
        setError("That didn’t save. Please try again.");
        return;
      }
      onDone();
    });
  }

  return (
    <div>
      <h2 id="sign-in-title" className={title}>
        What should we call you?
      </h2>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-body">
        Your name is how the Purpose House team will know you, on prayer requests and messages you send.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="mt-7 flex flex-col gap-3"
      >
        <label htmlFor="sign-in-name" className="sr-only">
          Your name
        </label>
        <input
          ref={fieldRef}
          id="sign-in-name"
          name="name"
          autoComplete="name"
          maxLength={80}
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="Your name"
          className={input}
        />
        {error && (
          <p role="alert" className="text-[0.95rem] font-medium text-live">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending || !name.trim()} className={`${buttonPrimary} h-12 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
          {pending ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

/**
 * Six boxes for the code. Underneath is one ordinary input (see-through, over the boxes), so
 * typing, pasting and the phone's "from Messages/Mail" suggestion all work as usual.
 */
function CodeField({
  ref,
  value,
  disabled,
  invalid,
  onChange,
}: {
  ref: RefObject<HTMLInputElement | null>;
  value: string;
  disabled: boolean;
  invalid: boolean;
  onChange: (digits: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, 5);
  return (
    <div className="relative">
      <div aria-hidden className="grid grid-cols-6 gap-2 sm:gap-2.5">
        {Array.from({ length: 6 }, (_, i) => {
          const current = focused && !disabled && i === active;
          return (
            <span
              key={i}
              className={`flex h-14 items-center justify-center rounded-squircle-xs border bg-paper text-[1.5rem] font-semibold tabular-nums text-ink transition-colors sm:h-16 ${
                invalid ? "border-live/60" : current ? "border-ink" : value[i] ? "border-rule-strong" : "border-rule"
              } ${disabled ? "opacity-60" : ""}`}
            >
              {value[i] ?? (current && <span className="h-6 w-0.5 animate-pulse rounded-full bg-ink" />)}
            </span>
          );
        })}
      </div>
      <label htmlFor="sign-in-code" className="sr-only">
        Six-digit code
      </label>
      <input
        ref={ref}
        id="sign-in-code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        value={value}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
        className="absolute inset-0 size-full cursor-text bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent"
      />
    </div>
  );
}

/** Google's "G", in its colours: Google's sign-in guidelines ask for it on the button. */
function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-[1.1rem]">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.38l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}
