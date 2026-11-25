import Link from "next/link";
import { UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/session";

/**
 * The two buttons at the foot of the menu drawer, styled like the site's buttons on dark
 * (the hero's): Give is solid white, the main action; Sign in / Sign out is frosted glass.
 */
const drawerButton =
  "inline-flex h-11 items-center justify-center rounded-squircle-xs px-4 text-[0.95rem] font-semibold transition-[background-color,scale] duration-200 active:scale-[0.98]";
export const drawerButtonPrimary = `${drawerButton} bg-white text-coal hover:bg-white/90`;
export const drawerButtonSecondary = `${drawerButton} bg-white/12 text-white backdrop-blur-md hover:bg-white/20`;

/** "Sign in" for visitors, "Your account" once signed in. Render inside <Suspense>. */
export async function AccountButton() {
  const session = await getSession();

  return session ? (
    <Link href="/account" className={drawerButtonSecondary}>
      Your account
    </Link>
  ) : (
    <Link href="#sign-in" className={drawerButtonSecondary}>
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

/** The empty picture: a figure on a soft circle, the same size as someone's avatar. */
function AvatarPlaceholder() {
  return (
    <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-ink/[0.08] text-muted transition-colors group-hover:bg-ink/[0.12] group-hover:text-ink">
      <UserRound className="size-[1.125rem]" strokeWidth={2} />
    </span>
  );
}

const headerAvatar = "group inline-flex size-10 items-center justify-center rounded-full";

/** Holds the avatar's place in the header while the session is checked. */
export function HeaderAccountPlaceholder() {
  return (
    <span className={headerAvatar}>
      <AvatarPlaceholder />
    </span>
  );
}

/**
 * In the header: the signed-in person's picture (or initials), opening their account; for
 * visitors, an empty picture that opens the sign-in modal. Render inside <Suspense>.
 */
export async function HeaderAccount() {
  const session = await getSession();
  if (!session) {
    return (
      <Link href="#sign-in" aria-label="Sign in" title="Sign in" className={headerAvatar}>
        <AvatarPlaceholder />
      </Link>
    );
  }
  const { id, name, email, image } = session.user;
  return (
    <Link href="/account" aria-label="Your account" title={name || email} className={`${headerAvatar} transition-opacity hover:opacity-80`}>
      <Avatar id={id} image={image} size={32} />
    </Link>
  );
}
