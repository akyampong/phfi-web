"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";
import { authClient } from "@/lib/auth-client";

/** Deletes the account and everything kept with it, after a second "are you sure?" click. */
export function DeleteAccount() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "deleting" | "error">("idle");

  async function remove() {
    setStep("deleting");
    const { error } = await authClient.deleteUser();
    if (error) return setStep("error");
    router.push("/");
    router.refresh();
  }

  if (step === "idle")
    return (
      <button type="button" onClick={() => setStep("confirm")} className={`${buttonSecondary} cursor-pointer`}>
        Delete account
      </button>
    );

  return (
    <div role="alert" className="max-w-[34rem] rounded-squircle-sm bg-ink/[0.04] p-5 sm:p-6">
      <p className="text-[1rem] font-semibold text-ink">Delete your account?</p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-body">
        This removes your saved messages and articles, where you got to in each message, and the prayer requests you sent
        while signed in. It can’t be undone.
      </p>
      {step === "error" && <p className="mt-3 text-[0.95rem] font-medium text-live">That didn’t work. Try again in a moment.</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={remove}
          disabled={step === "deleting"}
          className={`${buttonPrimary} cursor-pointer disabled:opacity-60`}
        >
          {step === "deleting" ? "Deleting…" : "Delete everything"}
        </button>
        <button type="button" onClick={() => setStep("idle")} disabled={step === "deleting"} className={`${buttonSecondary} cursor-pointer`}>
          Keep my account
        </button>
      </div>
    </div>
  );
}
