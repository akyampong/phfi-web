"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonPrimary } from "@/components/ui/styles";
import { authClient } from "@/lib/auth-client";

const input =
  "h-12 w-full rounded-squircle-xs border border-rule bg-paper px-4 text-[1rem] text-ink transition-colors focus:border-ink focus:outline-none";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Only addresses on this site: "/inbox", never "//elsewhere.com" or "https://…"
  const wanted = params.get("next") ?? "";
  const next = wanted.startsWith("/") && !wanted.startsWith("//") ? wanted : "/";
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(form: FormData) {
    setError("");
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      if (error) {
        setError(error.status === 429 ? "Too many tries. Please wait a minute." : "That email and password don’t match.");
        return;
      }
      router.replace(next);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="mt-10 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-ink">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={input} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-ink">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      {error && (
        <p role="alert" className="text-[0.95rem] font-medium text-live">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${buttonPrimary} mt-2 w-full cursor-pointer disabled:cursor-wait disabled:opacity-60`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
