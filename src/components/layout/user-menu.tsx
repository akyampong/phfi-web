"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type UserMenuProps = {
  name: string;
  email: string;
  image: string | null;
};

export function UserMenu({ name, email, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 items-center gap-1.5 rounded-full pl-1 pr-2 hover:bg-canvas"
      >
        <Avatar name={name} image={image} />
        <span className="sr-only">Account menu for {name}</span>
        <ChevronDown aria-hidden className="size-4 text-muted" />
      </button>

      <div
        id={menuId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-2 w-64 border border-rule bg-paper py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="border-b border-rule px-4 pb-3 pt-1">
          <p className="truncate font-semibold text-ink">{name}</p>
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
        <SignOutButton className="w-full px-4 py-2.5 text-left text-[0.95rem] text-ink hover:bg-canvas" />
      </div>
    </div>
  );
}

function Avatar({ name, image }: { name: string; image: string | null }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (image) {
    // User avatars can come from any provider, so a plain img avoids remote image config.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt="" className="size-8 rounded-full object-cover" />;
  }

  return (
    <span
      aria-hidden
      className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white"
    >
      {initials || "?"}
    </span>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut();
          router.refresh();
        })
      }
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
