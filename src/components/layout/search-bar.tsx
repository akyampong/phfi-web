import Form from "next/form";
import { Search } from "lucide-react";
import { SearchShortcutHint } from "./search-shortcut";

type SearchBarProps = {
  id: string;
  className?: string;
  /** "onLight" for the header, "onDark" for the menu drawer. */
  tone?: "onLight" | "onDark";
};

/**
 * Site search field. Submits to /search?q=… with client-side navigation. ⌘/ (Ctrl+/) jumps
 * here from anywhere on the site.
 */
export function SearchBar({ id, className = "", tone = "onLight" }: SearchBarProps) {
  const onDark = tone === "onDark";
  return (
    <Form action="/search" role="search" className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <Search
        aria-hidden
        className={`pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 ${onDark ? "text-night-muted" : "text-muted"}`}
      />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search"
        autoComplete="off"
        className={`peer h-10 w-full rounded-squircle-xs border pl-10 text-[0.95rem] focus:outline-none ${
          onDark
            ? "border-transparent bg-white/10 pr-4 text-white placeholder:text-night-muted focus:border-white/40 focus:bg-white/15"
            : "border-rule bg-paper pr-16 text-ink placeholder:text-muted focus:border-ink"
        }`}
      />
      {/* The ⌘/ shortcut (see search-shortcut.tsx), hidden while typing. Header only: the
          menu's field is reached by the same shortcut, but has no room for the hint. */}
      {!onDark && (
        // 6px from the bar's top, bottom and right edges alike (a 28px key in a 40px bar)
        <SearchShortcutHint className="absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity peer-focus:opacity-0" />
      )}
    </Form>
  );
}
