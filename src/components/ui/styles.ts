/** Shared class names for buttons and small text styles. */

/** Solid black button, the main action in a section. */
export const buttonPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-squircle-xs bg-ink px-5 text-[0.95rem] font-semibold text-paper transition-[background-color,scale] duration-200 hover:bg-ink/85 active:scale-[0.98]";

/** Outlined button, the secondary action beside a primary one. */
export const buttonSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-squircle-xs px-5 text-[0.95rem] font-semibold text-ink ring-1 ring-rule-strong ring-inset transition-[box-shadow,scale] duration-200 hover:ring-ink active:scale-[0.98]";

/**
 * A hover underline that draws in from left to right, set a little below the text so it
 * clears the tails of letters like g and y. Put it on an inline element (a <span> around the
 * words): it follows the words onto a second line when they wrap.
 * - groupUnderline starts when the surrounding `group` is hovered or focused (a whole card)
 * - hoverUnderline starts when the element itself is hovered or focused
 */
const underlineBase =
  "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[position:0_100%] bg-[length:0%_1.5px] pb-[0.2em] box-decoration-clone transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
export const groupUnderline = `${underlineBase} group-hover:bg-[length:100%_1.5px] group-focus-visible:bg-[length:100%_1.5px]`;
export const hoverUnderline = `${underlineBase} hover:bg-[length:100%_1.5px] focus-visible:bg-[length:100%_1.5px]`;

/** Plain "View all →" style link. Wrap its words in a span with groupUnderline. */
export const textLink = "group inline-flex items-center gap-1.5 text-[0.95rem] font-semibold text-ink";

/**
 * Supporting text: the line under a section title, a message's description, the prayer
 * points. One size and colour everywhere, so they read as the same kind of text.
 */
// 19px on wide screens, easing down to 17px on phones
export const bodyText = "text-[clamp(1.0625rem,0.98rem+0.35vw,1.1875rem)] leading-[1.6] text-body";
