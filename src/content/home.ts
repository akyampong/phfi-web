/**
 * Home page content.
 *
 * SAMPLE CONTENT: these recaps, articles and the series are placeholders that show
 * the layout. Replace them with real content (from the database or a CMS) before launch.
 * Dates are ISO dates (YYYY-MM-DD).
 */
import type { ArtSpec } from "@/components/art/artwork";
import type { Photo } from "@/components/art/cover";
import { meetingLook, meetingSchedule } from "@/config/site";

/**
 * A free-licence Unsplash photo, by its ID and its page slug (kept for credit).
 * Asks Unsplash for a 2000px copy rather than the multi-megabyte original, so Next's
 * image resizing stays quick.
 */
export function unsplash(id: string, alt: string, page: string): Photo {
  return {
    src: `https://images.unsplash.com/photo-${id}?w=2000&q=80&fm=jpg&fit=max`,
    alt,
    credit: `https://unsplash.com/photos/${page}`,
  };
}

export type ContentItem = {
  slug: string;
  kind: "recap" | "article";
  title: string;
  /** Optional second line, e.g. the Bible passage. */
  subtitle?: string;
  href: string;
  date: string;
  /** Which meeting a recap is from. */
  meeting?: string;
  /** "52 min" for recaps, "6 min read" for articles. */
  length: string;
  excerpt: string;
  /** Shown when there is no photo, and for series artwork. */
  art: ArtSpec;
  photo?: Photo;
};

/** The newest message, shown large at the top of the page. */
export const featured: ContentItem = {
  slug: "faith-that-waits",
  kind: "recap",
  title: "Faith That Waits",
  subtitle: "Habakkuk 2:1–4",
  href: "/watch/faith-that-waits",
  date: "2026-11-12",
  meeting: "Thursday Fellowship",
  length: "52 min",
  excerpt:
    "Habakkuk climbs the watchtower with his questions and waits for God to answer. What it looks like to bring him our complaints, and stay long enough to listen.",
  art: { motif: "waves", palette: "dusk" },
  photo: unsplash(
    "1651611236767-f0cf6830a0bb",
    "A person standing on a dock at sunrise, looking out over still water",
    "a-person-standing-on-a-dock-looking-at-the-sunset-7AwQj_gNHOo",
  ),
};

export const recent: ContentItem[] = [
  {
    slug: "roots-before-fruit",
    kind: "recap",
    title: "Roots Before Fruit",
    subtitle: "Colossians 2:6–7",
    href: "/watch/roots-before-fruit",
    date: "2026-11-10",
    meeting: "Tuesday Fellowship",
    length: "48 min",
    excerpt: "Before God grows fruit in a life, he grows roots, and that hidden work can't be hurried.",
    art: { motif: "rings", palette: "forest" },
    photo: unsplash(
      "1584257274862-42aa4f6e5f55",
      "A large tree with roots spreading across the ground",
      "brown-tree-trunk-on-brown-soil-B645igbiKCw",
    ),
  },
  {
    slug: "praying-when-words-run-out",
    kind: "article",
    title: "Praying When Words Run Out",
    href: "/read/praying-when-words-run-out",
    date: "2026-11-11",
    length: "6 min read",
    excerpt: "Some seasons leave us with nothing to say. The Psalms give us words to borrow until our own come back.",
    art: { motif: "arch", palette: "ink" },
    photo: unsplash(
      "1437603568260-1950d3ca6eab",
      "Hands folded in prayer on an open Bible",
      "man-holding-his-hands-on-open-book-b_SHPU5M3nk",
    ),
  },
  {
    slug: "five-habits-for-a-steadier-week",
    kind: "article",
    title: "Five Habits for a Steadier Week",
    href: "/read/five-habits-for-a-steadier-week",
    date: "2026-11-09",
    length: "5 min read",
    excerpt: "Small, ordinary practices that keep us close to Christ between Tuesday and Thursday, and long after.",
    art: { motif: "rays", palette: "ember" },
    photo: unsplash(
      "1488381297039-d6ee94af777e",
      "An open Bible on a wooden table beside a coffee mug",
      "opened-book-beside-black-ceramic-mug-2KJjKrod2RA",
    ),
  },
  {
    slug: "light-for-the-next-step",
    kind: "recap",
    title: "Light for the Next Step",
    subtitle: "Psalm 119:105",
    href: "/watch/light-for-the-next-step",
    date: "2026-11-05",
    meeting: "Thursday Fellowship",
    length: "47 min",
    excerpt: "God rarely shows us the whole road. He gives enough light for the next faithful step, and then the next.",
    art: { motif: "arch", palette: "blush" },
    photo: unsplash(
      "1605810257524-b66f77c5066d",
      "Morning sunlight streaming through a forest",
      "brown-trees-on-forest-during-daytime-rtsOc4q65B4",
    ),
  },
  {
    slug: "why-we-gather-online",
    kind: "article",
    title: "Why We Gather Online",
    href: "/read/why-we-gather-online",
    date: "2026-11-04",
    length: "4 min read",
    excerpt: "A screen is not a sanctuary, but it can be a doorway. How real fellowship happens across cities and time zones.",
    art: { motif: "orbits", palette: "blush" },
    photo: unsplash(
      "1612831455359-970e23a1e4e9",
      "A video call with several people on a laptop screen",
      "person-in-blue-long-sleeve-shirt-using-black-surface-HJgaV1qjHS0",
    ),
  },
  {
    slug: "planted-by-streams-of-water",
    kind: "recap",
    title: "Planted by Streams of Water",
    subtitle: "Psalm 1",
    href: "/watch/planted-by-streams-of-water",
    date: "2026-11-03",
    meeting: "Tuesday Fellowship",
    length: "50 min",
    excerpt: "The blessed life in Psalm 1 starts with where we choose to put down roots.",
    art: { motif: "rings", palette: "forest" },
    photo: unsplash(
      "1722427690490-fb4013044ef4",
      "A river running through a green forest",
      "a-river-running-through-a-lush-green-forest-4Sr9TeXWTzE",
    ),
  },
  {
    slug: "reading-the-psalms-in-a-hard-season",
    kind: "article",
    title: "Reading the Psalms in a Hard Season",
    href: "/read/reading-the-psalms-in-a-hard-season",
    date: "2026-10-30",
    length: "7 min read",
    excerpt: "Lament is not a lack of faith. It is faith speaking honestly to the God who listens.",
    art: { motif: "waves", palette: "sand" },
    photo: unsplash(
      "1596904198288-e90ccfc05152",
      "A worn open Bible in warm light",
      "opened-book-on-brown-wooden-table--KmjnM4DzJY",
    ),
  },
  {
    slug: "the-god-who-sees",
    kind: "recap",
    title: "The God Who Sees",
    subtitle: "Genesis 16:7–13",
    href: "/watch/the-god-who-sees",
    date: "2026-10-28",
    meeting: "Jericho Hour",
    length: "1 hr 34 min",
    excerpt: "Hagar in the wilderness, seen and named by God. A late night of worship, prayer and testimony.",
    art: { motif: "moon", palette: "dusk" },
    photo: unsplash(
      "1713970752944-90dfa4444217",
      "The night sky full of stars over a desert",
      "the-night-sky-is-filled-with-stars-and-clouds-h9Z0iQ1zdIk",
    ),
  },
];

export const nextSteps: {
  label: string;
  title: string;
  action: string;
  href: string;
  art: ArtSpec;
  photo: Photo;
}[] = [
  {
    label: "New here?",
    title: "Start by getting to know us.",
    action: "About us",
    href: "/about",
    art: { motif: "sunset", palette: "ember" },
    photo: unsplash(
      "1640037984424-ac1a02cb742a",
      "Two people holding cups of coffee across a wooden table",
      "two-people-holding-cups-of-coffee-on-top-of-a-wooden-table-4HI77_VE1Nk",
    ),
  },
  {
    label: "Prayer",
    title: "Share it, and we’ll pray with you.",
    action: "Send a request",
    // Opens the prayer request drawer
    href: "#pray",
    art: { motif: "arch", palette: "dusk" },
    photo: unsplash(
      "1778784534336-ef8e8ec6ad7c",
      "Two hands held open in prayer",
      "two-hands-held-open-in-a-gesture-of-prayer-0DMKV7-otWE",
    ),
  },
  {
    label: "Give",
    title: "Help the fellowship reach further.",
    action: "Give online",
    href: "/give",
    art: { motif: "orbits", palette: "sand" },
    photo: unsplash(
      "1438232992991-995b7058bbb3",
      "A raised hand in a crowd during worship",
      "shallow-focus-photography-of-hand-and-people-RAZQiZOX3mU",
    ),
  },
];

/** A slide in the hero carousel at the top of the home page. */
export type HeroSlide = {
  id: string;
  /** Small label above the headline, e.g. "New series". */
  eyebrow: string;
  /**
   * The headline, in two lines: put a line break (\n) where the second line starts. On wide
   * screens each slide shows exactly these two lines, so the slides line up as they change;
   * on narrow screens the break is ignored and the words wrap naturally.
   */
  headline: string;
  /**
   * One or two sentences beside the headline, also in two lines split by \n. Keep each line
   * to about 45 characters so it fits the column on wide screens.
   */
  text: string;
  /**
   * The main button. With `liveOnly`, it shows only while a stream is on (with a pulsing red
   * dot); the rest of the time the secondary button takes its place.
   */
  primary: { label: string; href: string; liveOnly?: boolean };
  secondary?: { label: string; href: string };
  photo: Photo;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "welcome",
    eyebrow: "Purpose House Fellowship International",
    headline: "A home for your faith,\nwherever you are",
    text: "Live fellowship every Tuesday and Thursday:\nworship, prayer and the Bible, together online.",
    primary: { label: "Join us live", href: "/live", liveOnly: true },
    secondary: { label: "New here?", href: "/about" },
    photo: {
      src: "/assets/bg.avif",
      alt: "Hands raised in worship under blue stage light",
    },
  },
  {
    id: "building-capacity",
    eyebrow: "This month’s series",
    headline: "Building\nCapacity",
    text: "Our series for November. Catch up on every\nmessage, then join us live for the rest.",
    primary: { label: "Watch the series", href: "/watch/series/building-capacity" },
    secondary: { label: "Latest message", href: "/watch/faith-that-waits" },
    // TODO: swap for the series artwork when there is one.
    photo: unsplash(
      "1488381297039-d6ee94af777e",
      "An open Bible on a wooden table beside a coffee mug",
      "opened-book-beside-black-ceramic-mug-2KJjKrod2RA",
    ),
  },
  {
    id: "jericho-hour",
    eyebrow: "End of the month",
    headline: "Jericho\nHour",
    text: "Our end-of-month prayer meeting: two hours\nof prayer together, to close the month well.",
    primary: { label: "See meeting times", href: "/#meeting-times" },
    // Opens the prayer request drawer
    secondary: { label: "Send a prayer request", href: "#pray" },
    photo: {
      src: "/assets/bg-2.avif",
      alt: "Deep blue paint in thick brushstrokes",
    },
  },
];

/** The ways into the fellowship, in a row of four under the hero. */
export type Way = {
  icon: "live" | "watch" | "read" | "connect";
  title: string;
  /** Marks the live way: a red broadcast icon appears beside its title while a stream is on. */
  live?: boolean;
  text: string;
  action: string;
  href: string;
  /** For the live way: the link to show instead while a stream is on. */
  liveAction?: { label: string; href: string };
};

export const ways: Way[] = [
  {
    icon: "live",
    title: "Live Fellowship",
    live: true,
    text: "Worship, pray and open the Bible together online every Tuesday and Thursday evening.",
    action: "Find a time",
    href: "/#meeting-times",
    liveAction: { label: "Join us live", href: "/live" },
  },
  {
    icon: "watch",
    title: "Watch Anytime",
    text: "Missed a meeting? Every message and series is here to watch whenever suits you.",
    action: "Browse messages",
    href: "/watch",
  },
  {
    icon: "read",
    title: "Read",
    text: "Articles and short devotionals to keep you close to Christ through the week.",
    action: "Start reading",
    href: "/read",
  },
  {
    icon: "connect",
    title: "Get Connected",
    text: "Questions, ideas or just hello: get in touch with the people behind the screens.",
    action: "Get in touch",
    // Opens the contact drawer
    href: "#contact",
  },
];

/**
 * Bento tiles: flat colour with one large, tone-on-tone motif. Two wide tiles on top,
 * three below. Colours are dark enough for white text to read at every size.
 */
export type BentoTile = {
  label: string;
  title: string;
  /** Optional small line under the title, such as when it meets. */
  detail?: string;
  action: string;
  href: string;
  motif: "sunset" | "orbits" | "moon" | "rays" | "rings";
  colour: string;
  /** Show the meeting calendar (with an add-to-calendar button) instead of the usual tile. */
  calendar?: boolean;
  /** For a meeting's tile: the meeting's name in meetingSchedule (config/site.ts). */
  meeting?: string;
};

const meetingSummary = (name: string) => meetingSchedule.find((m) => m.name === name)?.summary ?? "";

export const bentoTiles: BentoTile[] = [
  {
    label: "This month’s series",
    title: "Building Capacity.",
    detail: "Our series for November",
    action: "Watch the series",
    href: "/watch/series/building-capacity",
    motif: "rings",
    colour: "#1e6447",
  },
  // The three meetings. On the page, whichever meets next moves up beside the series as
  // the wide "Next up" tile; this order (the schedule's) is only the starting point.
  {
    label: "Tuesday Fellowship",
    meeting: "Tuesday Fellowship",
    title: "Teaching through a series, book by book.",
    detail: meetingSummary("Tuesday Fellowship"),
    action: "Learn more",
    href: "/#meeting-times",
    ...meetingLook.sunset,
  },
  {
    label: "Thursday Fellowship",
    meeting: "Thursday Fellowship",
    title: "A short word, open talk and prayer.",
    detail: meetingSummary("Thursday Fellowship"),
    action: "Learn more",
    href: "/#meeting-times",
    ...meetingLook.together,
  },
  {
    label: "Jericho Hour",
    meeting: "Jericho Hour",
    title: "Two hours of prayer to end the month.",
    detail: meetingSummary("Jericho Hour"),
    action: "Learn more",
    href: "/#meeting-times",
    ...meetingLook.midnight,
  },
  {
    label: "Meeting times",
    title: "See every meeting in your time zone.",
    action: "See the times",
    href: "/#meeting-times",
    motif: "rays",
    colour: "#141416",
    calendar: true,
  },
];

/**
 * This week's Bible verse and three prayer points, shown under the hero.
 *
 * SAMPLE PRAYER POINTS. Change them each week (later, from an editing page instead of this
 * file). The verse is always the New King James Version; check the wording against
 * Bible.com when you change it.
 */
export type ThisWeek = {
  verse: {
    text: string;
    /** As people read it, e.g. "Mark 2:21–22". */
    reference: string;
    /**
     * The passage in Bible.com's form (book code, chapter, verses), e.g. "MRK.2.21-22".
     * Used to link to the passage so people can read on.
     */
    passage: string;
  };
  /** Three each week. */
  prayerPoints: [string, string, string];
};

export const thisWeek: ThisWeek = {
  verse: {
    text: "No one sews a piece of unshrunk cloth on an old garment; or else the new piece pulls away from the old, and the tear is made worse. And no one puts new wine into old wineskins; or else the new wine bursts the wineskins, the wine is spilled, and the wineskins are ruined. But new wine must be put into new wineskins.",
    reference: "Mark 2:21–22",
    passage: "MRK.2.21-22",
  },
  prayerPoints: [
    "For our fellowship this month: hearts enlarged and ready for all God is building in us.",
    "For our families: peace in every home, wisdom for every decision, and provision for every need.",
    "For everyone who is unwell, grieving or carrying something heavy this week.",
  ],
};
