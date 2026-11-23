/** The verse of the week is always the New King James Version (Bible.com's version 114). */
export const TRANSLATION = "NKJV";

/** A passage on Bible.com, e.g. bibleComUrl("MRK.2.21-22"). */
export const bibleComUrl = (passage: string) => `https://www.bible.com/bible/114/${passage}.${TRANSLATION}`;

/**
 * The books of the Bible: Bible.com's code for each, then its name and the other ways people
 * write it (lower case, without full stops). Numbered books accept "1", "I" and "First".
 */
const BOOKS: [code: string, ...names: string[]][] = [
  ["GEN", "genesis", "gen"],
  ["EXO", "exodus", "exod", "ex"],
  ["LEV", "leviticus", "lev"],
  ["NUM", "numbers", "num"],
  ["DEU", "deuteronomy", "deut"],
  ["JOS", "joshua", "josh"],
  ["JDG", "judges", "judg"],
  ["RUT", "ruth"],
  ["1SA", "1 samuel", "1 sam"],
  ["2SA", "2 samuel", "2 sam"],
  ["1KI", "1 kings", "1 kgs"],
  ["2KI", "2 kings", "2 kgs"],
  ["1CH", "1 chronicles", "1 chron", "1 chr"],
  ["2CH", "2 chronicles", "2 chron", "2 chr"],
  ["EZR", "ezra"],
  ["NEH", "nehemiah", "neh"],
  ["EST", "esther", "esth"],
  ["JOB", "job"],
  ["PSA", "psalm", "psalms", "ps", "psa"],
  ["PRO", "proverbs", "prov"],
  ["ECC", "ecclesiastes", "eccl", "eccles"],
  ["SNG", "song of songs", "song of solomon", "song"],
  ["ISA", "isaiah", "isa"],
  ["JER", "jeremiah", "jer"],
  ["LAM", "lamentations", "lam"],
  ["EZK", "ezekiel", "ezek"],
  ["DAN", "daniel", "dan"],
  ["HOS", "hosea", "hos"],
  ["JOL", "joel"],
  ["AMO", "amos"],
  ["OBA", "obadiah", "obad"],
  ["JON", "jonah"],
  ["MIC", "micah", "mic"],
  ["NAM", "nahum", "nah"],
  ["HAB", "habakkuk", "hab"],
  ["ZEP", "zephaniah", "zeph"],
  ["HAG", "haggai", "hag"],
  ["ZEC", "zechariah", "zech"],
  ["MAL", "malachi", "mal"],
  ["MAT", "matthew", "matt"],
  ["MRK", "mark"],
  ["LUK", "luke"],
  ["JHN", "john"],
  ["ACT", "acts"],
  ["ROM", "romans", "rom"],
  ["1CO", "1 corinthians", "1 cor"],
  ["2CO", "2 corinthians", "2 cor"],
  ["GAL", "galatians", "gal"],
  ["EPH", "ephesians", "eph"],
  ["PHP", "philippians", "phil"],
  ["COL", "colossians", "col"],
  ["1TH", "1 thessalonians", "1 thess"],
  ["2TH", "2 thessalonians", "2 thess"],
  ["1TI", "1 timothy", "1 tim"],
  ["2TI", "2 timothy", "2 tim"],
  ["TIT", "titus"],
  ["PHM", "philemon", "philem"],
  ["HEB", "hebrews", "heb"],
  ["JAS", "james", "jas"],
  ["1PE", "1 peter", "1 pet"],
  ["2PE", "2 peter", "2 pet"],
  ["1JN", "1 john"],
  ["2JN", "2 john"],
  ["3JN", "3 john"],
  ["JUD", "jude"],
  ["REV", "revelation", "revelations", "rev"],
];

const NUMBER_WORDS: Record<string, string> = { i: "1", ii: "2", iii: "3", first: "1", second: "2", third: "3" };
const NUMBER_FORMS: Record<string, string> = { "1": "1|i|first", "2": "2|ii|second", "3": "3|iii|third" };

/** Every accepted name for a book, and the book's full name (used to judge vaguer matches). */
const bookByName = new Map<string, { code: string; fullName: string }>();
for (const [code, ...names] of BOOKS) for (const name of names) bookByName.set(name, { code, fullName: names[0] });

// Longest names first, so "song of songs" wins over "song" and "1 john" over "john".
const bookPattern = [...bookByName.keys()]
  .sort((a, b) => b.length - a.length)
  .map((name) => {
    const numbered = /^([123]) (.+)$/.exec(name);
    const words = (numbered ? numbered[2] : name).replace(/ /g, "\\s+");
    return numbered ? `(?:${NUMBER_FORMS[numbered[1]]})\\s*${words}` : words;
  })
  .join("|");

/**
 * A Bible reference: a book, a chapter and, optionally, verses. "Psalm 1", "Mark 2:21–22",
 * "1 Cor. 13:4-7", "Habakkuk 2:1–4". Numbered books may start "1", "I" or "First".
 */
const referencePattern = new RegExp(
  String.raw`\b(${bookPattern})\.?\s+(\d{1,3})(?::(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?)?\b`,
  "i",
);

export type Scripture = {
  /** As people read it, e.g. "Habakkuk 2:1–4". */
  reference: string;
  /** Bible.com's form, e.g. "HAB.2.1-4", for linking to the passage. */
  passage: string;
};

/**
 * The first Bible reference in some text, e.g. a video's title or a "Scripture:" line, with
 * its Bible.com passage. Undefined when there isn't one. A chapter on its own ("Psalm 1")
 * counts only with the book's full name, so "Numbers 5" in a sentence isn't mistaken for one.
 */
export function findScripture(text: string): Scripture | undefined {
  const match = referencePattern.exec(text);
  if (!match) return undefined;
  const [, rawBook, chapter, verse, toVerse] = match;
  const words = rawBook.toLowerCase().replace(/\./g, "").replace(/^(\d)(?=[a-z])/, "$1 ").split(/\s+/);
  if (words.length > 1 && NUMBER_WORDS[words[0]]) words[0] = NUMBER_WORDS[words[0]];
  const book = bookByName.get(words.join(" "));
  if (!book) return undefined;
  const name = words.join(" ");
  if (!verse && name !== book.fullName && name !== `${book.fullName}s`) return undefined;

  const verses = verse ? `:${verse}${toVerse ? `–${toVerse}` : ""}` : "";
  return {
    reference: `${titleCase(book.fullName)} ${chapter}${verses}`,
    passage: `${book.code}.${chapter}${verse ? `.${verse}${toVerse ? `-${toVerse}` : ""}` : ""}`,
  };
}

/** "song of songs" → "Song of Songs", "1 corinthians" → "1 Corinthians". */
function titleCase(text: string) {
  return text.replace(/\b[a-z]/g, (letter, offset) => (text.slice(offset, offset + 3) === "of " ? letter : letter.toUpperCase()));
}
