/**
 * Watch page content: series, extra details for particular videos, and the sample library
 * shown until the YouTube channel is connected.
 *
 * Every public video on the channel appears on /watch by itself. Most details come from
 * YouTube, so they can be set in YouTube Studio without touching the site. In a video's
 * description, lines like these are read and then hidden from the page:
 *
 *   Scripture: Habakkuk 2:1–4
 *   Series: Building Capacity
 *   Speaker: Pastor Name
 *   Meeting: Tuesday Fellowship
 *
 * and timestamps ("0:00 Worship", "24:10 The message") become chapters you can jump to.
 * The meeting is also worked out from when a live stream ran; a Bible reference in the title
 * is picked up too. Anything here, by video ID, takes priority over all of that.
 */
import type { ArtSpec } from "@/components/art/artwork";
import type { Photo } from "@/components/art/cover";
import { featured, recent } from "@/content/home";

/** The shapes a series poster can carry (drawn large, tone on tone, like the home page's bento tiles). */
export type PosterMotif = "sunset" | "orbits" | "moon" | "rays" | "rings";

export type SeriesDetails = {
  /** Its address: /watch/series/{slug}. */
  slug: string;
  title: string;
  description: string;
  /** The series' poster: one dark colour (white text must read on it) with a large shape. */
  colour: string;
  motif: PosterMotif;
  /** The series' own artwork, when there is some; shown instead of the colour and shape. */
  photo?: Photo;
  /**
   * A YouTube playlist (its ID, starting "PL") whose videos make up the series, in the
   * playlist's order. Optional: videos can also join with a "Series:" line in their description.
   */
  playlistId?: string;
};

export const seriesDetails: SeriesDetails[] = [
  {
    slug: "building-capacity",
    title: "Building Capacity",
    description:
      "Our series for November: making room for all God wants to do in us, and becoming people who can carry it.",
    colour: "#1e6447",
    motif: "rings",
  },
  // SAMPLE SERIES, for the sample library below. Replace with real ones (or delete them:
  // a series with no videos isn't shown).
  {
    slug: "ruth",
    title: "Ruth: Grace in the Ordinary",
    description:
      "Four weeks in the book of Ruth: loyalty, kindness and the quiet ways God redeems ordinary lives.",
    colour: "#8a4b12",
    motif: "rays",
  },
  {
    slug: "the-lords-prayer",
    title: "The Lord’s Prayer",
    description: "Line by line through the prayer Jesus taught us, and how it shapes the way we pray every day.",
    colour: "#5b2150",
    motif: "orbits",
  },
  {
    slug: "psalms-of-ascent",
    title: "Psalms of Ascent",
    description: "The songs pilgrims sang on the road up to Jerusalem: a summer of walking with God, one step at a time.",
    colour: "#18505e",
    motif: "sunset",
  },
];

/**
 * Series for a particular channel, by its channel ID: used only while the Watch pages show
 * that channel (WATCH_CHANNEL_ID). For a presentation, the Desiring God channel's playlists
 * stand in for PHFI's series. Delete these when WATCH_CHANNEL_ID is no longer set.
 */
export const channelSeries: Record<string, SeriesDetails[]> = {
  // Desiring God (youtube.com/@desiringGod)
  UCnrFlpro0xfYjz6s5Xa8WWw: [
    {
      slug: "look-at-the-book-1-corinthians",
      title: "Look at the Book: 1 Corinthians",
      description: "Walking slowly through 1 Corinthians, a passage at a time, learning to see what’s really there.",
      colour: "#1e6447",
      motif: "rings",
      playlistId: "PLAcB0f-21Xj3RbXYhQKE8AMTKZ8eMDmnz",
    },
    {
      slug: "solid-joys",
      title: "Solid Joys",
      description: "A short, substantive daily devotional to feed your joy in Jesus every day of the year.",
      colour: "#8a4b12",
      motif: "sunset",
      playlistId: "PLAcB0f-21Xj00jrr64syLntNzSUHyDpPc",
    },
    {
      slug: "light-and-truth",
      title: "Light + Truth",
      description: "Classic sermons from John Piper, to help you see Christ clearly and treasure him truly.",
      colour: "#18505e",
      motif: "rays",
      playlistId: "PLAcB0f-21Xj1iDbRld7wz03727YR8DiDi",
    },
  ],
};

export type VideoDetails = {
  /** A different address from the one made from the title. Keep it once shared: old links rely on it. */
  slug?: string;
  title?: string;
  /** One or two sentences for cards, instead of the description's first paragraph. */
  summary?: string;
  /** A meeting's name, as in meetingSchedule. */
  meeting?: string;
  /** A Bible reference, e.g. "Mark 2:21–22". */
  scripture?: string;
  speaker?: string;
  /** A series' slug from seriesDetails. */
  series?: string;
  /** Its place in the series, when it isn't simply the order they were recorded in. */
  part?: number;
  kind?: "message" | "clip";
  /** Leave it off the site (a test stream, say), though it stays on YouTube. */
  hidden?: boolean;
};

/** Extra details for particular videos, by YouTube video ID (the part after watch?v=). */
export const videoDetails: Record<string, VideoDetails> = {
  // "abc123XYZ00": { scripture: "Psalm 1", series: "building-capacity" },
};

/** A message in the sample library: the shape of a real one, without a video. */
export type SampleMessage = {
  slug: string;
  kind: "message" | "clip";
  title: string;
  date: string;
  /** Length in seconds. */
  seconds: number;
  meeting: string;
  scripture?: string;
  series?: string;
  summary: string;
  art: ArtSpec;
  photo?: Photo;
  chapters?: [string, string][];
};

const TUE = "Tuesday Fellowship";
const THU = "Thursday Fellowship";
const JERICHO = "Jericho Hour";
const min = (m: number) => m * 60;

// The home page's recaps keep their addresses, dates and pictures here, so its links work.
const fromHome = Object.fromEntries([featured, ...recent].map((item) => [item.slug, item]));
const home = (slug: string) => ({ summary: fromHome[slug].excerpt, art: fromHome[slug].art, photo: fromHome[slug].photo });

/** A typical Tuesday evening, for the sample chapters. */
const tuesdayChapters = (message: string): [string, string][] => [
  ["0:00", "Welcome"],
  ["4:30", "Worship"],
  ["21:10", "Prayer"],
  ["29:45", message],
  ["1:02:20", "Responding together"],
];

/**
 * SAMPLE CONTENT, shown while no YouTube channel is set up (or it has no videos yet), or in
 * development with WATCH_PREVIEW_SAMPLES=1, so the pages can be seen full. Four Tuesday series,
 * the Thursday words, the Jericho Hour nights and a handful of clips, from August to November.
 */
export const sampleMessages: SampleMessage[] = [
  // ——— Building Capacity (November, Tuesdays) ———
  {
    slug: "planted-by-streams-of-water",
    kind: "message",
    title: "Planted by Streams of Water",
    date: "2026-11-03",
    seconds: min(50),
    meeting: TUE,
    scripture: "Psalm 1",
    series: "building-capacity",
    ...home("planted-by-streams-of-water"),
    chapters: tuesdayChapters("Planted by streams of water"),
  },
  {
    slug: "roots-before-fruit",
    kind: "message",
    title: "Roots Before Fruit",
    date: "2026-11-10",
    seconds: min(48),
    meeting: TUE,
    scripture: "Colossians 2:6–7",
    series: "building-capacity",
    ...home("roots-before-fruit"),
    chapters: tuesdayChapters("Roots before fruit"),
  },
  {
    slug: "new-wine-new-wineskins",
    kind: "message",
    title: "New Wine, New Wineskins",
    date: "2026-11-17",
    seconds: min(49),
    meeting: TUE,
    scripture: "Mark 2:21–22",
    series: "building-capacity",
    summary: "New wine needs new wineskins. Growing capacity means letting God renew the shape of our lives, not just fill them.",
    art: { motif: "waves", palette: "forest" },
    chapters: tuesdayChapters("New wine, new wineskins"),
  },

  // ——— Ruth: Grace in the Ordinary (October, Tuesdays) ———
  {
    slug: "a-famine-and-a-choice",
    kind: "message",
    title: "A Famine and a Choice",
    date: "2026-10-06",
    seconds: min(52),
    meeting: TUE,
    scripture: "Ruth 1:1–18",
    series: "ruth",
    summary: "Naomi has lost everything and Ruth chooses to stay anyway. Loyal love, when leaving would be easier.",
    art: { motif: "sunset", palette: "sand" },
  },
  {
    slug: "gleaning-in-the-field",
    kind: "message",
    title: "Gleaning in the Field",
    date: "2026-10-13",
    seconds: min(47),
    meeting: TUE,
    scripture: "Ruth 2:1–12",
    series: "ruth",
    summary: "An ordinary day of work becomes the place God’s kindness finds her. Nothing about our days is too small for him.",
    art: { motif: "rays", palette: "sand" },
  },
  {
    slug: "at-the-threshing-floor",
    kind: "message",
    title: "At the Threshing Floor",
    date: "2026-10-20",
    seconds: min(50),
    meeting: TUE,
    scripture: "Ruth 3:1–13",
    series: "ruth",
    summary: "Ruth asks Boaz to spread his covering over her. Courage, humility and asking for what only grace can give.",
    art: { motif: "moon", palette: "ember" },
  },
  {
    slug: "the-redeemer",
    kind: "message",
    title: "The Redeemer",
    date: "2026-10-27",
    seconds: min(55),
    meeting: TUE,
    scripture: "Ruth 4:9–17",
    series: "ruth",
    summary: "Boaz redeems what was lost, and a quiet family story turns out to lead to David, and to Jesus.",
    art: { motif: "arch", palette: "ember" },
  },

  // ——— The Lord’s Prayer (September, Tuesdays) ———
  {
    slug: "our-father",
    kind: "message",
    title: "Our Father",
    date: "2026-09-01",
    seconds: min(46),
    meeting: TUE,
    scripture: "Matthew 6:9",
    series: "the-lords-prayer",
    summary: "Prayer begins with who God is to us: not a distant power, but a Father who is near and who hears.",
    art: { motif: "arch", palette: "dusk" },
  },
  {
    slug: "your-kingdom-come",
    kind: "message",
    title: "Your Kingdom Come",
    date: "2026-09-08",
    seconds: min(49),
    meeting: TUE,
    scripture: "Matthew 6:10",
    series: "the-lords-prayer",
    summary: "Before we ask for anything for ourselves, we ask for his will to be done here, as it is in heaven.",
    art: { motif: "orbits", palette: "dusk" },
  },
  {
    slug: "our-daily-bread",
    kind: "message",
    title: "Our Daily Bread",
    date: "2026-09-15",
    seconds: min(44),
    meeting: TUE,
    scripture: "Matthew 6:11",
    series: "the-lords-prayer",
    summary: "Enough for today. Learning to trust God for what we need, one day at a time.",
    art: { motif: "sunset", palette: "blush" },
  },
  {
    slug: "forgive-us-our-debts",
    kind: "message",
    title: "Forgive Us Our Debts",
    date: "2026-09-22",
    seconds: min(51),
    meeting: TUE,
    scripture: "Matthew 6:12",
    series: "the-lords-prayer",
    summary: "The forgiveness we receive and the forgiveness we give are bound together. What it costs, and what it frees.",
    art: { motif: "waves", palette: "blush" },
  },
  {
    slug: "deliver-us-from-evil",
    kind: "message",
    title: "Deliver Us from Evil",
    date: "2026-09-29",
    seconds: min(48),
    meeting: TUE,
    scripture: "Matthew 6:13",
    series: "the-lords-prayer",
    summary: "A prayer for the battles we can see and the ones we can’t, from people who know they need a deliverer.",
    art: { motif: "moon", palette: "dusk" },
  },

  // ——— Psalms of Ascent (August, Tuesdays) ———
  {
    slug: "i-lift-my-eyes",
    kind: "message",
    title: "I Lift My Eyes",
    date: "2026-08-04",
    seconds: min(45),
    meeting: TUE,
    scripture: "Psalm 121",
    series: "psalms-of-ascent",
    summary: "The hills can’t help us, but the one who made them can. A psalm for every journey.",
    art: { motif: "sunset", palette: "ink" },
  },
  {
    slug: "the-house-of-the-lord",
    kind: "message",
    title: "The House of the Lord",
    date: "2026-08-11",
    seconds: min(47),
    meeting: TUE,
    scripture: "Psalm 122",
    series: "psalms-of-ascent",
    summary: "“I was glad when they said to me…” The joy of gathering with God’s people, wherever we meet.",
    art: { motif: "arch", palette: "ink" },
  },
  {
    slug: "unless-the-lord-builds-the-house",
    kind: "message",
    title: "Unless the Lord Builds the House",
    date: "2026-08-18",
    seconds: min(50),
    meeting: TUE,
    scripture: "Psalm 127",
    series: "psalms-of-ascent",
    summary: "All our work is in vain without him. Rest, family and the things only God can build.",
    art: { motif: "rings", palette: "sand" },
  },
  {
    slug: "how-good-and-pleasant",
    kind: "message",
    title: "How Good and Pleasant",
    date: "2026-08-25",
    seconds: min(43),
    meeting: TUE,
    scripture: "Psalm 133",
    series: "psalms-of-ascent",
    summary: "When brothers and sisters live in unity, God commands a blessing. What unity is, and what it isn’t.",
    art: { motif: "orbits", palette: "blush" },
  },

  // ——— Thursday Fellowship: a short word ———
  {
    slug: "strength-for-today",
    kind: "message",
    title: "Strength for Today",
    date: "2026-11-19",
    seconds: min(34),
    meeting: THU,
    scripture: "Isaiah 40:29–31",
    summary: "For anyone running on empty this week: he gives power to the weak, and those who wait on him will run again.",
    art: { motif: "rays", palette: "ember" },
  },
  {
    slug: "faith-that-waits",
    kind: "message",
    title: "Faith That Waits",
    date: "2026-11-12",
    seconds: min(52),
    meeting: THU,
    scripture: "Habakkuk 2:1–4",
    ...home("faith-that-waits"),
  },
  {
    slug: "light-for-the-next-step",
    kind: "message",
    title: "Light for the Next Step",
    date: "2026-11-05",
    seconds: min(47),
    meeting: THU,
    scripture: "Psalm 119:105",
    ...home("light-for-the-next-step"),
  },
  {
    slug: "when-you-pass-through-the-waters",
    kind: "message",
    title: "When You Pass Through the Waters",
    date: "2026-10-29",
    seconds: min(36),
    meeting: THU,
    scripture: "Isaiah 43:1–3",
    summary: "Not if, but when. God doesn’t promise a life without deep waters; he promises to be in them with us.",
    art: { motif: "waves", palette: "dusk" },
  },
  {
    slug: "come-to-me",
    kind: "message",
    title: "Come to Me",
    date: "2026-10-22",
    seconds: min(31),
    meeting: THU,
    scripture: "Matthew 11:28–30",
    summary: "An invitation for the weary: his yoke is easy and his burden is light.",
    art: { motif: "arch", palette: "sand" },
  },
  {
    slug: "the-lord-is-my-shepherd",
    kind: "message",
    title: "The Lord Is My Shepherd",
    date: "2026-10-15",
    seconds: min(38),
    meeting: THU,
    scripture: "Psalm 23",
    summary: "The best-known psalm, read slowly: green pastures, dark valleys, and goodness that follows us home.",
    art: { motif: "sunset", palette: "forest" },
  },
  {
    slug: "do-not-be-anxious",
    kind: "message",
    title: "Do Not Be Anxious",
    date: "2026-10-08",
    seconds: min(33),
    meeting: THU,
    scripture: "Philippians 4:6–7",
    summary: "Prayer with thanksgiving, and a peace that guards our hearts when nothing around us has changed yet.",
    art: { motif: "orbits", palette: "ink" },
  },
  {
    slug: "bear-one-anothers-burdens",
    kind: "message",
    title: "Bear One Another’s Burdens",
    date: "2026-10-01",
    seconds: min(35),
    meeting: THU,
    scripture: "Galatians 6:2",
    summary: "Fellowship is more than meeting. It’s carrying each other, especially when someone can’t carry themselves.",
    art: { motif: "rings", palette: "blush" },
  },
  {
    slug: "his-mercies-are-new",
    kind: "message",
    title: "His Mercies Are New",
    date: "2026-09-24",
    seconds: min(32),
    meeting: THU,
    scripture: "Lamentations 3:22–23",
    summary: "Written from the rubble of Jerusalem, and still true: his compassions never fail. They are new every morning.",
    art: { motif: "sunset", palette: "blush" },
  },
  {
    slug: "be-still",
    kind: "message",
    title: "Be Still",
    date: "2026-09-17",
    seconds: min(30),
    meeting: THU,
    scripture: "Psalm 46:10",
    summary: "In a loud week, an invitation to stop, and to know that he is God.",
    art: { motif: "moon", palette: "ink" },
  },

  // ——— Jericho Hour: the end-of-month prayer nights ———
  {
    slug: "the-god-who-sees",
    kind: "message",
    title: "The God Who Sees",
    date: "2026-10-28",
    seconds: min(94),
    meeting: JERICHO,
    scripture: "Genesis 16:7–13",
    ...home("the-god-who-sees"),
  },
  {
    slug: "the-walls-came-down",
    kind: "message",
    title: "The Walls Came Down",
    date: "2026-09-30",
    seconds: min(118),
    meeting: JERICHO,
    scripture: "Joshua 6:1–5",
    summary: "The night our prayer meeting is named for: marching, waiting and shouting, and walls that fall at God’s word.",
    art: { motif: "rays", palette: "dusk" },
    chapters: [
      ["0:00", "Gathering"],
      ["12:00", "Worship"],
      ["38:30", "The word: Joshua 6"],
      ["58:15", "Praying for our families"],
      ["1:21:40", "Praying for the nations"],
      ["1:49:00", "Closing"],
    ],
  },
  {
    slug: "ask-seek-knock",
    kind: "message",
    title: "Ask, Seek, Knock",
    date: "2026-08-26",
    seconds: min(107),
    meeting: JERICHO,
    scripture: "Matthew 7:7–8",
    summary: "Two hours of persistent prayer: the promise that everyone who asks receives.",
    art: { motif: "moon", palette: "ember" },
  },

  // ——— Clips ———
  clip("stay-long-enough-to-listen", "Stay long enough to listen", "2026-11-12", 58, THU, { motif: "waves", palette: "dusk" }),
  clip("new-wine-needs-new-wineskins", "New wine needs new wineskins", "2026-11-17", 64, TUE, { motif: "waves", palette: "forest" }),
  clip("the-hidden-work-of-roots", "The hidden work of roots", "2026-11-10", 49, TUE, { motif: "rings", palette: "forest" }),
  clip("strength-when-youre-running-on-empty", "Strength when you’re running on empty", "2026-11-19", 55, THU, { motif: "rays", palette: "ember" }),
  clip("seen-and-named", "Seen and named", "2026-10-28", 71, JERICHO, { motif: "moon", palette: "dusk" }),
  clip("loyal-love", "Loyal love", "2026-10-06", 46, TUE, { motif: "sunset", palette: "sand" }),
  clip("not-if-but-when", "Not if, but when", "2026-10-29", 52, THU, { motif: "waves", palette: "ink" }),
  clip("a-father-who-hears", "A Father who hears", "2026-09-01", 60, TUE, { motif: "arch", palette: "dusk" }),
];

function clip(slug: string, title: string, date: string, seconds: number, meeting: string, art: ArtSpec): SampleMessage {
  return { slug, kind: "clip", title, date, seconds, meeting, summary: `A moment from ${meeting}.`, art };
}
