import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton, UserMenu } from "./user-menu";

/** Sign-in link or the signed-in user's menu. Render inside <Suspense>. */
export async function Account({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const session = await getSession();

  if (!session) {
    return variant === "desktop" ? (
      <Link
        href="/sign-in"
        className="inline-flex h-10 items-center px-3 text-[0.95rem] font-semibold text-ink hover:text-brand"
      >
        Sign in
      </Link>
    ) : (
      <Link
        href="/sign-in"
        className="inline-flex h-12 items-center justify-center rounded-md border border-rule-strong text-base font-semibold text-ink"
      >
        Sign in
      </Link>
    );
  }

  const { name, email, image } = session.user;

  if (variant === "mobile") {
    return (
      <div className="flex items-center justify-between gap-4 border-t border-rule pt-6">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{name}</p>
          <p className="truncate text-sm text-muted">{email}</p>
        </div>
        <SignOutButton className="h-10 shrink-0 rounded-md border border-rule-strong px-4 text-sm font-semibold text-ink" />
      </div>
    );
  }

  return <UserMenu name={name} email={email} image={image ?? null} />;
}

/** Same footprint as the desktop "Sign in" link, so the header does not shift. */
export function AccountPlaceholder() {
  return <span aria-hidden className="inline-block h-10 w-[4.25rem]" />;
}
