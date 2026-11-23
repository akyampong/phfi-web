export type NavItem = {
  label: string;
  href: string;
  /** Other path prefixes that should mark this item as active. */
  match?: string[];
  /** Show the red live indicator on this item while a meeting is streaming. */
  showsLive?: boolean;
};

export const siteConfig = {
  name: "Purpose House Fellowship International",
  shortName: "PHFI",
  description:
    "Live fellowship every Tuesday and Thursday, and teaching to keep with you all week.",
};

export const mainNav: NavItem[] = [
  { label: "Watch", href: "/watch", match: ["/live", "/podcast"], showsLive: true },
  { label: "Read", href: "/read", match: ["/topics", "/scripture"] },
  { label: "Connect", href: "/connect", match: ["/new", "/prayer", "/events"] },
  { label: "Give", href: "/give" },
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
/** The label shown to visitors, e.g. "Times are GMT". */
export const meetingTimeZone = "GMT";
/** The same zone as an IANA name, used to convert meeting times into each visitor's own time zone. */
export const meetingTimeZoneId = "Etc/GMT";

/** Abstract artwork shown beside a meeting in the menu (see meeting-art.tsx). */
export type MeetingArt = "sunset" | "together" | "midnight";

export type Meeting = {
  name: string;
  /** Day of the week: 0 is Sunday, 1 Monday … 6 Saturday. */
  weekday: number;
  /** "weekly" meets every week; "last" meets on the last such weekday of the month. */
  frequency: "weekly" | "last";
  /** Short description shown under the name, e.g. "Tuesdays, 7:00 PM". */
  summary: string;
  /** Start time in the meeting time zone, 24-hour "HH:MM". Leave out when there is no fixed start. */
  startTime?: string;
  /** How long it runs, for calendar entries. */
  durationMinutes: number;
  /** One or two sentences about the meeting, for the home page. */
  description: string;
  art: MeetingArt;
};

export const meetingSchedule: Meeting[] = [
  {
    name: "Tuesday Fellowship",
    weekday: 2,
    frequency: "weekly",
    summary: "Tuesdays, 7:00 PM",
    startTime: "19:00",
    durationMinutes: 90, // TODO: confirm
    description: "Worship, prayer and teaching through a series, book by book. The heart of our week.",
    art: "sunset",
  },
  {
    name: "Thursday Fellowship",
    weekday: 4,
    frequency: "weekly",
    summary: "Thursdays, 7:00 PM",
    startTime: "19:00",
    durationMinutes: 90, // TODO: confirm
    description: "A lighter midweek gathering: a short word, open conversation and praying for one another.",
    art: "together",
  },
  {
    name: "Jericho Hour",
    weekday: 3,
    frequency: "last",
    summary: "Last Wednesday of the month, into Thursday",
    durationMinutes: 120,
    description: "Our end-of-month prayer meeting: two hours of prayer together.",
    art: "midnight",
  },
];

/** Add each account as it is confirmed. Only links listed here are shown. */
export const socialLinks: { label: string; href: string }[] = [];
