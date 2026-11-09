export type NavItem = {
  label: string;
  href: string;
  /** Other path prefixes that should mark this item as active. */
  match?: string[];
};

export const siteConfig = {
  name: "Purpose House Fellowship International",
  shortName: "PHFI",
  description:
    "Live fellowship every Tuesday and Thursday, and teaching to keep with you all week.",
};

export const mainNav: NavItem[] = [
  { label: "Live", href: "/live" },
  { label: "Watch", href: "/watch", match: ["/podcast"] },
  { label: "Read", href: "/read", match: ["/topics", "/scripture"] },
  { label: "Connect", href: "/connect", match: ["/new", "/prayer", "/events"] },
  { label: "About", href: "/about", match: ["/contact"] },
];

export const footerNav: { title: string; links: NavItem[] }[] = [
  {
    title: "Watch",
    links: [
      { label: "Live", href: "/live" },
      { label: "Recaps", href: "/watch" },
      { label: "Series", href: "/watch/series" },
      { label: "Clips", href: "/watch/clips" },
    ],
  },
  {
    title: "Read",
    links: [
      { label: "Articles", href: "/read" },
      { label: "Topics", href: "/topics" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "New here?", href: "/new" },
      { label: "Prayer request", href: "/prayer" },
      { label: "Events", href: "/events" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our story", href: "/about" },
      { label: "What we believe", href: "/about/beliefs" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "Give", href: "/give" },
    ],
  },
];

// TODO: confirm meeting start times and time zone. These are placeholders.
export const meetingTimeZone = "GMT";

export const meetingSchedule: { name: string; when: string; time: string }[] = [
  { name: "Tuesday Fellowship", when: "Every Tuesday", time: "7:00 PM" },
  { name: "Thursday Fellowship", when: "Every Thursday", time: "7:00 PM" },
  { name: "Midnight Fellowship", when: "Last Wednesday of the month", time: "Into Thursday" },
];

/** Add each account as it is confirmed. Only links listed here are shown. */
export const socialLinks: { label: string; href: string }[] = [];
