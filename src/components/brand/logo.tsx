import Image from "next/image";

type LogoProps = {
  /** "onLight" for white backgrounds, "onDark" for the footer and video areas. */
  tone?: "onLight" | "onDark";
  preload?: boolean;
};

/**
 * Logo icon with a text wordmark.
 * Temporary: replace the wordmark with the official horizontal logo when it arrives.
 */
export function Logo({ tone = "onLight", preload = false }: LogoProps) {
  const onDark = tone === "onDark";

  return (
    <span className="flex items-center gap-2.5">
      <Image
        src={onDark ? "/brand/phfi-icon-white.svg" : "/brand/phfi-icon.svg"}
        alt=""
        width={46}
        height={36}
        preload={preload}
        unoptimized
        className="h-9 w-auto"
      />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-[1.15rem] font-semibold tracking-tight ${
            onDark ? "text-white" : "text-ink"
          }`}
        >
          Purpose House
        </span>
        <span
          className={`mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${
            onDark ? "text-night-muted" : "text-muted"
          }`}
        >
          Fellowship International
        </span>
      </span>
    </span>
  );
}
