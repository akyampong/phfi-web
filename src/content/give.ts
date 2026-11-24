/**
 * Give page content: the ways to give and what giving makes possible.
 * Check every number against the bank and MTN after changing it: people copy them as they are.
 */

export type PaymentDetail = {
  /** What the number is, e.g. "Cedi account". */
  label: string;
  /** Shown as written. */
  value: string;
  /** What's copied, when it differs from what's shown (e.g. without spaces). */
  copy?: string;
  /** A short note under it, e.g. the currency. */
  note?: string;
};

export type PaymentMethod = {
  id: string;
  /** e.g. "MTN Mobile Money". */
  name: string;
  /** One line on when to use it. */
  description: string;
  /** The name on the account, as the sender will see it. */
  accountName: string;
  icon: "mobile" | "bank";
  details: PaymentDetail[];
  /** Steps or advice shown under the numbers. */
  notes?: string[];
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "momo",
    name: "MTN Mobile Money",
    description: "The quickest way to give from Ghana.",
    accountName: "Purpose House Chapel Int",
    icon: "mobile",
    details: [
      { label: "MoMo number", value: "054 420 7706", copy: "0544207706", note: "Send money to this number" },
      { label: "Merchant ID", value: "793677", note: "Or pay with MoMoPay using this ID" },
    ],
  },
  {
    id: "bank",
    name: "GT Bank Ghana",
    description: "Bank transfer in cedis, dollars, euros or pounds.",
    accountName: "Purpose House Chapel Int",
    icon: "bank",
    details: [
      { label: "Cedi account", value: "301137416140", note: "GHS" },
      { label: "Dollar account", value: "301137416220", note: "USD" },
      { label: "Euro account", value: "301137416420", note: "EUR" },
      { label: "Pound account", value: "301137416320", note: "GBP" },
    ],
    notes: [
      "Giving from outside Ghana? Use the account in your currency. Your bank may ask for GT Bank Ghana’s branch and SWIFT code: get in touch and we’ll send them.",
    ],
  },
];

/** A verse to give in the spirit of. NKJV, as on Bible.com. */
export const giveVerse = {
  text: "So let each one give as he purposes in his heart, not grudgingly or of necessity; for God loves a cheerful giver.",
  reference: "2 Corinthians 9:7",
  passage: "2CO.9.7",
};

/** What giving makes possible. (Sample wording: adjust to what PHFI's giving really supports.) */
export const givingSupports: { title: string; text: string }[] = [
  {
    title: "Gathering every week",
    text: "The streaming, equipment and tools that bring us together every Tuesday, Thursday and Jericho Hour.",
  },
  {
    title: "Caring for people",
    text: "Prayer, pastoral care and practical help for members of the fellowship going through hard times.",
  },
  {
    title: "Reaching further",
    text: "Teaching, outreach and partnerships that carry the gospel to more people, in more places.",
  },
];
