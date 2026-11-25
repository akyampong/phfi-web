"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary } from "@/components/ui/styles";
import { authClient } from "@/lib/auth-client";

const input =
  "h-12 w-full rounded-squircle-xs border border-rule bg-paper px-4 text-[1rem] text-ink transition-colors placeholder:text-muted/70 focus:border-ink focus:outline-none";

/** Their name, as the team sees it on prayer requests and as it shows in the header. */
export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const changed = value.trim() !== name && value.trim().length > 0;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!changed) return;
    setState("saving");
    const { error } = await authClient.updateUser({ name: value.trim().slice(0, 80) });
    if (error) return setState("error");
    setState("saved");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="flex max-w-[30rem] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="account-name" className="text-sm font-semibold text-ink">
          Name
        </label>
        <input
          id="account-name"
          name="name"
          autoComplete="name"
          maxLength={80}
          value={value}
          placeholder="Your name"
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
          className={input}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-ink">Email</p>
        <p className="text-[1rem] text-body">{email}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={!changed || state === "saving"} className={`${buttonPrimary} cursor-pointer disabled:cursor-not-allowed disabled:opacity-50`}>
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        <p role="status" className="text-sm text-muted">
          {state === "saved" && "Saved."}
          {state === "error" && <span className="font-medium text-live">That didn’t save. Try again in a moment.</span>}
        </p>
      </div>
    </form>
  );
}
