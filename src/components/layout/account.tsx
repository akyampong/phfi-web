import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

/**
 * The two buttons at the foot of the menu drawer, styled like the site's buttons on dark
 * (the hero's): Give is solid white, the main action; Sign in / Sign out is frosted glass.
 */
const drawerButton =
  "inline-flex h-12 items-center justify-center rounded-squircle-xs px-5 text-[0.95rem] font-semibold transition-[background-color,scale] duration-200 active:scale-[0.98]";
export const drawerButtonPrimary = `${drawerButton} bg-white text-ink hover:bg-white/90`;
export const drawerButtonSecondary = `${drawerButton} bg-white/12 text-white backdrop-blur-md hover:bg-white/20`;

/** "Sign in" for visitors, "Sign out" for members. Render inside <Suspense>. */
export async function AccountButton() {
  const session = await getSession();

  return session ? (
    <SignOutButton className={drawerButtonSecondary} />
  ) : (
    <Link href="/sign-in" className={drawerButtonSecondary}>
      Sign in
    </Link>
  );
}

/** Holds the space while the session is checked, so the row does not shift. */
export function AccountButtonPlaceholder() {
  return <span aria-hidden className={`${drawerButtonSecondary} opacity-50`} />;
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
