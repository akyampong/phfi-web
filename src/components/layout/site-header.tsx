import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { mainNav, meetingSchedule, siteConfig } from "@/config/site";
import { AccountButton, AccountButtonPlaceholder, SignedInAs, drawerButtonPrimary } from "./account";
import { LiveIndicator } from "./live-indicator";
import { LiveNav } from "./live-nav";
import { NavLinks } from "./nav-links";
import { NavList } from "./nav-list";
import { SearchBar } from "./search-bar";
import { MenuMeetings } from "./menu-meetings";
import { DrawerSection, SiteMenu } from "./site-menu";

// Give has its own button at the foot of the drawer, so the drawer's link list leaves it out.
const drawerNav = mainNav.filter((item) => item.href !== "/give");

export function SiteHeader() {
  return (
    // Named so it stays still while pages cross-fade beneath it
    <header className="sticky top-0 z-40 bg-paper" style={{ viewTransitionName: "site-header" }}>
      {/* Three columns on desktop: the equal outer columns keep the nav exactly centred. */}
      <div className="container-page grid h-14 grid-cols-[1fr_auto] lg:h-16 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-4 self-center justify-self-start lg:gap-5">
          <Link href="/" aria-label="Purpose House Fellowship International, home">
            <Logo preload />
          </Link>
          {/* While the channel is streaming: a red "Live" tag that opens /live */}
          <Suspense fallback={null}>
            <LiveIndicator />
          </Suspense>
        </div>

        {/* The Live tag beside the logo signals a stream, so the menu itself stays plain. */}
        <nav aria-label="Main" className="hidden lg:block">
          <Suspense fallback={<NavList items={mainNav} isLive={false} />}>
            <NavLinks items={mainNav} isLive={false} />
          </Suspense>
        </nav>

        <div className="flex items-center gap-2 self-center justify-self-end">
          <SearchBar id="header-search" className="hidden w-52 lg:block xl:w-64" />

          <SiteMenu>
            <DrawerSection className="flex flex-col gap-8">
              {/* On desktop the search bar is already in the header. */}
              <SearchBar id="menu-search" tone="onDark" className="lg:hidden" />
              <nav aria-label="Main">
                <Suspense fallback={<NavList items={drawerNav} isLive={false} variant="drawer" />}>
                  <LiveNav items={drawerNav} variant="drawer" />
                </Suspense>
              </nav>
            </DrawerSection>

            <DrawerSection>
              <MenuMeetings meetings={meetingSchedule} />
            </DrawerSection>

            <DrawerSection className="flex flex-col gap-8">
              <p className="text-[0.92rem] leading-[1.75] text-night-text">{siteConfig.description}</p>
              <div>
                <Suspense fallback={null}>
                  <SignedInAs />
                </Suspense>
                <div className="grid grid-cols-2 gap-2">
                  <Suspense fallback={<AccountButtonPlaceholder />}>
                    <AccountButton />
                  </Suspense>
                  <Link href="/give" className={drawerButtonPrimary}>
                    Give
                  </Link>
                </div>
              </div>
            </DrawerSection>
          </SiteMenu>
        </div>
      </div>
    </header>
  );
}
