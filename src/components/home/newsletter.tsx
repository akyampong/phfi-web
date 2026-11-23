/**
 * Sign-up for the weekly email: a dark closing panel with everything centred, so the page
 * ends on something solid before the white footer. The email field and the button sit
 * together in one bar.
 */
export function Newsletter() {
  return (
    <section
      aria-labelledby="newsletter-title"
      className="relative isolate overflow-hidden rounded-squircle-lg bg-night px-6 py-16 text-center sm:px-10 sm:py-20 lg:py-28"
    >
      {/* A soft light from above, so the dark isn't flat */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.09),rgba(255,255,255,0))]"
      />

      <h2
        id="newsletter-title"
        className="mx-auto max-w-[18ch] text-headline text-balance text-white"
      >
        Stay close through the week
      </h2>
      <p className="mx-auto mt-5 max-w-[46ch] text-lead text-night-text text-balance">
        One short email each week with the verse and prayer points, the latest message, and what’s coming up.
      </p>

      {/* TODO: connect to the email provider. There is no /newsletter handler yet. */}
      <form action="/newsletter" method="post" className="mx-auto mt-10 max-w-md">
        <div className="flex flex-col gap-2 rounded-squircle-sm bg-white/[0.08] p-1.5 ring-1 ring-white/15 transition-shadow ring-inset focus-within:ring-white/40 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Your email address"
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-[0.95rem] text-white placeholder:text-white/45 focus:outline-none"
          />
          <button
            type="submit"
            className="h-11 shrink-0 cursor-pointer rounded-squircle-xs bg-white px-5 text-[0.95rem] font-semibold text-coal transition-[background-color,scale] duration-200 hover:bg-white/90 active:scale-[0.98]"
          >
            Subscribe
          </button>
        </div>
        <p className="mt-4 text-sm text-night-muted">No spam. Unsubscribe any time.</p>
      </form>
    </section>
  );
}
