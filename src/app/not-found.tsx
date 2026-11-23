import type { Metadata } from "next";
import Link from "next/link";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * The 404 page, in the site's own style. Having it also keeps Next's built-in 404 (and the
 * dark-mode styles that come with it) out of the site.
 */
export default function NotFound() {
  return (
    <div className="container-page">
      <div className="content-width flex min-h-[60svh] flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-muted">404</p>
        <h1 className="mt-4 max-w-[20ch] text-headline text-ink text-balance">We couldn’t find that page</h1>
        <p className="mt-5 max-w-[46ch] text-lead text-body text-balance">
          It may have moved, or it’s still being built. Here are some good places to start.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonPrimary}>
            Go home
          </Link>
          <Link href="/live" className={buttonSecondary}>
            Join us live
          </Link>
        </div>
      </div>
    </div>
  );
}
