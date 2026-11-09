import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  footerNav,
  meetingSchedule,
  meetingTimeZone,
  siteConfig,
  socialLinks,
} from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-night text-night-text">
      <div className="container-page py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="flex max-w-md flex-col gap-8">
            <Link href="/" aria-label="Purpose House Fellowship International, home" className="self-start">
              <Logo tone="onDark" />
            </Link>
            <p className="text-[0.95rem] leading-relaxed text-night-muted">{siteConfig.description}</p>

            <div>
              <h2 className="label-caps text-white">Meet with us online</h2>
              <ul className="mt-4 divide-y divide-night-rule border-y border-night-rule">
                {meetingSchedule.map((meeting) => (
                  <li key={meeting.name} className="flex items-baseline justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block font-semibold text-white">{meeting.name}</span>
                      <span className="block text-sm text-night-muted">{meeting.when}</span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">{meeting.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-night-muted">
                Times are {meetingTimeZone}.{" "}
                <Link href="/live" className="text-white underline-offset-4 hover:underline">
                  See them in your time zone
                </Link>
              </p>
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="label-caps text-white">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[0.95rem] text-night-text hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-night-rule pt-6 text-sm text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> {siteConfig.name}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {socialLinks.map((social) => (
              <li key={social.href}>
                <a href={social.href} className="hover:text-white" target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}
