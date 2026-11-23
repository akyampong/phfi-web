/**
 * About page content.
 *
 * SAMPLE CONTENT: the words below are a first draft, written to show the layout. Replace them
 * with PHFI's own mission, story, values and beliefs before launch. The photos are free-licence
 * stand-ins from Unsplash: swap in your own (put the files in public/about/ and use
 * { src: "/about/group.jpg", alt: "…" }).
 */
import type { Photo } from "@/components/art/cover";
import { unsplash } from "@/content/home";

export const intro = {
  headline: "A family of faith,\ngathered from everywhere",
  text: "Purpose House Fellowship International is a community of believers who meet online every Tuesday and Thursday to worship, pray and open the Bible together, and who carry one another through the rest of the week.",
};

/** The group picture: the whole fellowship together. Use a wide (landscape) photo. */
export const groupPhoto: { photo: Photo; caption: string } = {
  photo: unsplash(
    "1569292567777-e5d61a759322",
    "The fellowship together on the steps of a church, smiling and waving",
    "standing-and-sitting-of-people-taking-group-photo-O9Ogddfvl-U",
  ),
  caption: "Some of the Purpose House family, together in person.",
};

export const mission = {
  statement: "We exist to raise a people rooted in Christ, built up together, and sent out with purpose.",
  /** Two short pieces beside the statement. */
  more: [
    {
      title: "Our vision",
      text: "A fellowship without borders: wherever you are, a place to belong, to grow in the Word and in prayer, and to discover what God made you for.",
    },
    {
      title: "Why “Purpose House”",
      text: "Because no one is here by accident. A house is where a family lives, and every person in this one has a God-given purpose we want to help them find and live out.",
    },
  ],
};

export type Value = { icon: "word" | "prayer" | "family" | "purpose"; title: string; text: string };

export const values: Value[] = [
  {
    icon: "word",
    title: "Rooted in the Word",
    text: "The Bible is where we start. We read it together, book by book, and let it shape how we live.",
  },
  {
    icon: "prayer",
    title: "Prayer first",
    text: "We pray before we plan. Every meeting, every need and every month ends in prayer.",
  },
  {
    icon: "family",
    title: "Family, not an audience",
    text: "Online doesn’t mean anonymous. We know each other by name and show up for one another.",
  },
  {
    icon: "purpose",
    title: "Everyone has a purpose",
    text: "Each person has gifts to bring. We help one another find them and put them to use.",
  },
];

export const story = {
  paragraphs: [
    "Purpose House began with a few friends praying together on a weeknight call, scattered across different cities and time zones but hungry for the same thing: real fellowship around God’s Word.",
    "Word spread, and the call grew. Tuesday became a night for teaching through Scripture, Thursday a lighter gathering to share and pray for one another, and once a month we started staying up late for Jericho Hour, two hours of prayer to close the month.",
    "Today the fellowship reaches people in many countries. The screen is how we gather; the family is what we’ve become.",
  ],
  photo: unsplash(
    "1697490251788-21888514f669",
    "Friends standing close with their arms around one another, praying",
    "a-group-of-people-standing-around-each-other-sHd-Daj27V0",
  ),
  /** Figures beside the story. Keep them true and current. */
  stats: [
    { value: "2", label: "meetings every week" },
    { value: "1", label: "night of prayer a month" },
    { value: "12+", label: "countries joining in" },
  ],
};

export const community = {
  title: "Life together",
  text: "Faith grows best in company. Beyond the meetings themselves, this is a fellowship that prays for each other, checks in during the week and celebrates together when we can meet in person.",
  photos: [
    unsplash(
      "1717278088202-29e884213558",
      "Two women praying together during a worship night",
      "a-group-of-people-standing-next-to-each-other-2L4-O4Qxiyo",
    ),
    unsplash(
      "1764174861943-a7914825311f",
      "Friends talking around a table in a sunny café",
      "group-of-friends-sitting-around-a-table-indoors-plAbojmGv5c",
    ),
  ],
  /** Ways to take part, beside the photos. */
  ways: [
    { title: "Pray with us", text: "Send a request and our prayer team will carry it with you.", href: "/prayer" },
    { title: "Say hello", text: "New here? We’d love to meet you and help you find your place.", href: "/new" },
    { title: "Serve", text: "From prayer to production, there’s a place for your gifts.", href: "/connect" },
  ],
};

/** A short summary of what we believe. (Sample wording: replace with PHFI’s statement of faith.) */
export const beliefs: { title: string; text: string }[] = [
  { title: "The Bible", text: "Scripture is the inspired, trustworthy Word of God, our final authority for faith and life." },
  { title: "God", text: "There is one God, eternally existing as Father, Son and Holy Spirit." },
  { title: "Jesus Christ", text: "Jesus is the Son of God, who lived without sin, died for our sins, rose again and is Lord of all." },
  { title: "Salvation", text: "We are saved by grace through faith in Jesus alone, not by our own works." },
  { title: "The Holy Spirit", text: "The Spirit lives in every believer, giving power, gifts and a life that grows to look like Jesus." },
  { title: "The Church", text: "The church is God’s family on earth, called to worship, love one another and make disciples." },
];

export type BoardMember = {
  name: string;
  role: string;
  /** A sentence about them, optional. */
  bio?: string;
  /** A portrait, upright (4:5). Without one, a placeholder is shown. */
  photo?: Photo;
};

/** PLACEHOLDERS: add each board member's name, role and portrait. */
export const board: BoardMember[] = [
  { name: "Name to come", role: "President" },
  { name: "Name to come", role: "Vice president" },
  { name: "Name to come", role: "Secretary" },
  { name: "Name to come", role: "Treasurer" },
  { name: "Name to come", role: "Board member" },
  { name: "Name to come", role: "Board member" },
];

/** The invitation at the bottom of the page. */
export const closing = {
  headline: "Come as you are",
  text: "Join us on Tuesday or Thursday evening. There’s a place for you in this family.",
  photo: unsplash(
    "1531844251246-9a1bfaae09fc",
    "A large group of friends standing together outdoors among pine trees",
    "group-of-people-taking-photo-near-brown-wooden-tree-1qfy-jDc_jo",
  ),
};
