/** The verse of the week is always the New King James Version (Bible.com's version 114). */
export const TRANSLATION = "NKJV";

/** A passage on Bible.com, e.g. bibleComUrl("MRK.2.21-22"). */
export const bibleComUrl = (passage: string) => `https://www.bible.com/bible/114/${passage}.${TRANSLATION}`;
