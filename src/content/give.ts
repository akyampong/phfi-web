/**
 * Give page content: the accounts to give to, online giving, and what giving makes possible.
 * Check every number against the bank and MTN after changing it: people copy them as they are.
 */

export type PaymentDetail = {
  /** What the number is, e.g. "Cedi (GHS)". */
  label: string;
  /** Shown as written. */
  value: string;
  /** What's copied, when it differs from what's shown (e.g. without spaces). */
  copy?: string;
};

export type PaymentMethod = {
  id: string;
  /** e.g. "MTN Mobile Money". */
  name: string;
  /** One or two sentences on how to give this way. */
  description: string;
  /** The name on the account, as the sender will see it. */
  accountName: string;
  /** The provider's logo, round (in public/give/). */
  logo: string;
  details: PaymentDetail[];
  /** A short note at the foot, when there's something more to know. */
  note?: string;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "momo",
    name: "MTN Mobile Money",
    description: "Send to our MoMo number, or pay with MoMoPay using our merchant ID.",
    accountName: "Purpose House Chapel Int",
    logo: "/give/mtn-momo.png",
    details: [
      { label: "MoMo number", value: "054 420 7706", copy: "0544207706" },
      { label: "MoMoPay merchant ID", value: "793677" },
    ],
    note: "Add your name as the reference, so we know who to thank.",
  },
  {
    id: "bank",
    name: "GT Bank Ghana",
    description: "Transfer to the account in your currency, from Ghana or abroad.",
    accountName: "Purpose House Chapel Int",
    logo: "/give/gtbank.png",
    details: [
      { label: "Cedi (GHS)", value: "301137416140" },
      { label: "US dollar (USD)", value: "301137416220" },
      { label: "Euro (EUR)", value: "301137416420" },
      { label: "Pound sterling (GBP)", value: "301137416320" },
    ],
    note: "From abroad, your bank may ask for the branch and SWIFT code: get in touch and we’ll send them.",
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

/**
 * Online giving: the choices the "Give online" panel offers. NOT CONNECTED YET: no payment
 * provider is set up, so the panel says online giving is coming soon when someone tries it.
 */
export const onlineGiving = {
  currencies: [
    { code: "GHS", symbol: "GH₵", presets: [50, 100, 200, 500] },
    { code: "USD", symbol: "$", presets: [10, 25, 50, 100] },
    { code: "EUR", symbol: "€", presets: [10, 25, 50, 100] },
    { code: "GBP", symbol: "£", presets: [10, 25, 50, 100] },
  ],
  /** Where a gift goes. The first is the default. */
  funds: ["Where it’s most needed", "Tithe", "Offering", "Outreach and missions", "Caring for members"],
  /** How card and mobile money payments are taken, shown under the button. */
  methods: "Card or mobile money",
  /**
   * Crypto. Leave an address empty until the wallet is set up: the panel then says it's coming
   * soon rather than showing anything people could send to.
   */
  crypto: [
    { coin: "USDT", name: "Tether", network: "Tron (TRC-20)", address: "" },
    { coin: "USDC", name: "USD Coin", network: "Ethereum (ERC-20)", address: "" },
    { coin: "BTC", name: "Bitcoin", network: "Bitcoin", address: "" },
    { coin: "ETH", name: "Ether", network: "Ethereum", address: "" },
  ],
};

/** Reassurances beside the giving form. Keep them true. */
export const givingPromises = [
  "Cedis, dollars, euros or pounds",
  "One time or every month",
  "Card, mobile money, bank or crypto",
];

/**
 * Questions people ask about giving. SAMPLE ANSWERS: check each one is true for PHFI before
 * launch (especially once online giving is connected).
 */
export const givingFaqs: { question: string; answer: string }[] = [
  {
    question: "Can I give from outside Ghana?",
    answer:
      "Yes. Give online by card, or transfer to our GT Bank account in dollars, euros or pounds. Your bank may ask for the branch and SWIFT code: get in touch and we’ll send them.",
  },
  {
    question: "Is giving online safe?",
    answer:
      "Online gifts will be taken by a trusted payment provider over a secure connection. Your card details go straight to them and are never stored on our website.",
  },
  {
    question: "Can I give every month?",
    answer: "Yes. Choose Monthly when you give online, and your gift will repeat on the same day each month until you change it.",
  },
  {
    question: "What’s the difference between a tithe and an offering?",
    answer:
      "A tithe is a tenth of your income, given regularly as an act of worship. An offering is anything given beyond that, whenever you choose. Both are received with gratitude.",
  },
  {
    question: "Can I get a receipt?",
    answer: "Yes. Get in touch with the date and amount of your gift, and we’ll send you a receipt.",
  },
];
