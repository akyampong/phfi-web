import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

/** Outlined button style for the row at the foot of the menu drawer. */
export const drawerButtonClass =
  "label-caps inline-flex h-11 items-center justify-center rounded-squircle-xs text-[0.68rem] text-night-text ring-1 ring-white/25 ring-inset transition-colors hover:bg-white/10 hover:text-white";

/** "Sign in" for visitors, "Sign out" for members. Render inside <Suspense>. */
export async function AccountButton() {
  const session = await getSession();

  return session ? (
    <SignOutButton className={drawerButtonClass} />
  ) : (
    <Link href="/sign-in" className={drawerButtonClass}>
      Sign in
    </Link>
  );
}

/** Holds the space while the session is checked, so the row does not shift. */
export function AccountButtonPlaceholder() {
  return <span aria-hidden className={`${drawerButtonClass} opacity-50`} />;
}

/** "Signed in as …" above the button row, for members only. Render inside <Suspense>. */
export async function SignedInAs() {
  const session = await getSession();
  if (!session) return null;
  return (
    <p className="mb-3 truncate text-sm text-night-muted">
      Signed in as <span className="text-night-text">{session.user.name}</span>
    </p>
  );
}
