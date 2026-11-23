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
    <span className="flex items-center gap-1.5">
      <Image
        src={onDark ? "/brand/phfi-icon-white.svg" : "/brand/phfi-icon.svg"}
        alt=""
        width={574}
        height={450}
        preload={preload}
        unoptimized
        className="h-7 w-auto"
      />
      {/* Trim the line box to the capital letters, so the word centres on the icon. */}
      <span
        className={`text-[1.35rem] font-bold leading-none tracking-tight [text-box:trim-both_cap_alphabetic] ${
          onDark ? "text-white" : "text-ink"
        }`}
      >
        PHFI
      </span>
    </span>
  );
}
