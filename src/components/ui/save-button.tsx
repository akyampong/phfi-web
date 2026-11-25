"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { getSavedState, setSaved } from "@/app/account/actions";
import { SIGN_IN_HASH } from "@/components/auth/sign-in-modal";
import { useSession } from "@/lib/auth-client";
import { actionButton } from "./styles";

/**
 * Save a message or article to your account (/account). Signed out, it opens the sign-in
 * modal instead; once signed in, it shows whether this one is saved.
 */
export function SaveButton({ kind, slug }: { kind: "message" | "article"; slug: string }) {
  const { data: session, isPending } = useSession();
  const userId = session?.user.id;
  const [saved, setSavedState] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let live = true;
    getSavedState(kind, slug)
      .then((state) => live && setSavedState(state.saved))
      .catch(() => live && setSavedState(false));
    return () => {
      live = false;
    };
  }, [userId, kind, slug]);

  const icon = <Bookmark aria-hidden className={`size-4 ${saved ? "fill-current" : ""}`} />;

  if (!isPending && !userId)
    return (
      <a href={SIGN_IN_HASH} className={actionButton}>
        {icon}
        Save
      </a>
    );

  async function toggle() {
    if (saved === null || busy) return;
    const next = !saved;
    setSavedState(next);
    setBusy(true);
    try {
      setSavedState(await setSaved(kind, slug, next));
    } catch {
      setSavedState(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={saved === null} aria-pressed={saved ?? false} className={`${actionButton} disabled:cursor-default`}>
      {icon}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
