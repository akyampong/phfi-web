import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { footerNav, siteConfig, socialLinks } from "@/config/site";
import { hoverUnderline } from "@/components/ui/styles";

/** White footer: logo and description, the site's link columns, then copyright and legal links. */
export function SiteFooter() {
  return (
    <footer className="bg-paper text-body">
      <div className="container-page py-14 lg:py-20">
        {/* Lined up with the page sections above (the 1440px reading column) */}
        <div className="content-width">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div className="flex max-w-sm flex-col gap-5">
              <Link href="/" aria-label="Purpose House Fellowship International, home" className="self-start">
                <Logo />
              </Link>
              <p className="text-[0.95rem] leading-relaxed text-muted">{siteConfig.description}</p>
            </div>

            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
              {footerNav.map((group) => (
                <div key={group.title}>
                  <h2 className="label-caps text-ink">{group.title}</h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`text-[0.95rem] text-body transition-colors hover:text-ink ${hoverUnderline}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-16 flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © <CopyrightYear /> {siteConfig.name}
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {socialLinks.map((social) => (
                <li key={social.href}>
                  <a href={social.href} className="hover:text-ink" target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/privacy" className="hover:text-ink">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ink">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}
