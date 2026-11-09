import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { mainNav } from "@/config/site";
import { getLiveStatus } from "@/lib/live";
import { Account, AccountPlaceholder } from "./account";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { NavList } from "./nav-list";

export function SiteHeader() {
  const isLive = getLiveStatus();

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      <div className="container-page flex h-16 items-center lg:h-[76px]">
        <Link href="/" aria-label="Purpose House Fellowship International, home" className="shrink-0">
          <Logo preload />
        </Link>

        <nav aria-label="Main" className="ml-12 hidden self-stretch lg:block">
          <Suspense fallback={<NavList items={mainNav} isLive={isLive} />}>
            <NavLinks items={mainNav} isLive={isLive} />
          </Suspense>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex size-10 items-center justify-center rounded-md text-ink hover:bg-canvas hover:text-brand"
          >
            <Search className="size-5" />
          </Link>

          <div className="hidden lg:block">
            <Suspense fallback={<AccountPlaceholder />}>
              <Account />
            </Suspense>
          </div>

          <Link
            href="/give"
            className="ml-1 hidden h-10 items-center rounded-md bg-brand px-5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-brand-strong sm:inline-flex"
          >
            Give
          </Link>

          <MobileMenu>
            <nav aria-label="Main">
              <Suspense fallback={<NavList items={mainNav} isLive={isLive} variant="mobile" />}>
                <NavLinks items={mainNav} isLive={isLive} variant="mobile" />
              </Suspense>
            </nav>
            <div className="flex flex-col gap-3">
              <Link
                href="/give"
                className="inline-flex h-12 items-center justify-center rounded-md bg-brand text-base font-semibold text-white"
              >
                Give
              </Link>
              <Suspense fallback={null}>
                <Account variant="mobile" />
              </Suspense>
            </div>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
