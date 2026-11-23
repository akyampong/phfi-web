/**
 * Abstract poster artwork for series, recaps, articles and meetings.
 *
 * The site itself is neutral; artwork is the one place colour is used.
 * Every motif is drawn on a 160 × 120 canvas and centred, so it crops cleanly
 * to squares, 16:10 cards and 4:3 posters (preserveAspectRatio "slice").
 */

import type { ReactNode } from "react";

export type Motif = "sunset" | "orbits" | "moon" | "arch" | "rays" | "rings" | "waves";
export type Palette = "ember" | "blush" | "dusk" | "forest" | "sand" | "ink";

export type ArtSpec = { motif: Motif; palette: Palette };

type Colours = {
  /** Background gradient, top to bottom. */
  sky: [string, string];
  a: string;
  b: string;
  c: string;
  /** Solid bands for the waves motif, top to bottom. */
  bands: [string, string, string, string, string];
  /** Whether text set on the bottom colour (sky[1]) should be light or dark. */
  text: "light" | "dark";
};

const palettes: Record<Palette, Colours> = {
  ember: {
    sky: ["#ff8a3d", "#c2185b"],
    a: "#ffd23f",
    b: "#fff1cc",
    c: "#7a0f3a",
    bands: ["#ffc75f", "#ff9a4d", "#f2545b", "#c2185b", "#7a0f3a"],
    text: "light",
  },
  blush: {
    sky: ["#f9c9d2", "#f2a3b3"],
    a: "#e63946",
    b: "#f4a03a",
    c: "#b3202c",
    bands: ["#ffe1e6", "#f7b0bf", "#ef7f96", "#e63946", "#b3202c"],
    text: "dark",
  },
  dusk: {
    sky: ["#1c0f33", "#4a2272"],
    a: "#ffd23f",
    b: "#ffffff",
    c: "#8a4fc0",
    bands: ["#f7c6e0", "#de8fcf", "#ad5fcb", "#7639aa", "#3f1b6b"],
    text: "light",
  },
  forest: {
    sky: ["#0d3a2b", "#1e6447"],
    a: "#f3e9d2",
    b: "#9bd17c",
    c: "#e8a33d",
    bands: ["#d6ecb9", "#9bd17c", "#5fa96b", "#2f7d58", "#14523b"],
    text: "light",
  },
  sand: {
    sky: ["#f4e7d0", "#e8d2ad"],
    a: "#d1495b",
    b: "#2a1e2e",
    c: "#e8a33d",
    bands: ["#f6c69c", "#e8a33d", "#d1495b", "#8c2f4a", "#2a1e2e"],
    text: "dark",
  },
  ink: {
    sky: ["#141416", "#2b2b30"],
    a: "#f2f2f2",
    b: "#ff8a3d",
    c: "#6b6b70",
    bands: ["#6e6e74", "#55555b", "#404045", "#2e2e33", "#1d1d20"],
    text: "light",
  },
};

/** The colour an artwork ends on at the bottom, and the text tone that reads on it. */
export function artworkBase(palette: Palette): { background: string; text: "light" | "dark" } {
  return { background: palettes[palette].sky[1], text: palettes[palette].text };
}

type ArtworkProps = ArtSpec & {
  /** Unique on the page; used to name the SVG gradients. */
  uid: string;
  className?: string;
};

export function Artwork({ motif, palette, uid, className = "" }: ArtworkProps) {
  const p = palettes[palette];
  const sky = `${uid}-sky`;
  const Motif = motifs[motif];

  return (
    <svg
      viewBox="0 0 160 120"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill={`url(#${sky})`} />
      <Motif p={p} sky={`url(#${sky})`} uid={uid} />
    </svg>
  );
}

/**
 * One colour with its motif drawn large in a slightly lighter tone of the same colour,
 * set right of centre so it bleeds off the edge. Quiet enough to set white type over.
 */
export function TonalArtwork({
  motif,
  colour,
  uid,
  centred = false,
  className = "",
}: {
  motif: Exclude<Motif, "waves" | "arch">;
  colour: string;
  uid: string;
  /** Sit the shape in the middle, a little larger (for small squares like thumbnails), instead of off to the right. */
  centred?: boolean;
  className?: string;
}) {
  const tone = "rgba(255,255,255,0.11)";
  const p: Colours = {
    sky: [colour, colour],
    a: tone,
    b: tone,
    c: tone,
    bands: [tone, tone, tone, tone, tone],
    text: "light",
  };
  const Motif = motifs[motif];
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <rect width="160" height="120" fill={colour} />
      {/* Off to the right: 1.5 times larger, its centre moved from (80, 60) to (112, 60).
          Centred: 1.2 times larger, staying in the middle. */}
      <g
        transform={
          centred ? "translate(80 60) scale(1.2) translate(-80 -60)" : "translate(112 60) scale(1.5) translate(-80 -60)"
        }
      >
        <Motif p={p} sky={colour} uid={uid} />
      </g>
    </svg>
  );
}

type MotifProps = { p: Colours; sky: string; uid: string };

const motifs: Record<Motif, (props: MotifProps) => ReactNode> = {
  /** A sun setting behind stripes that thicken towards the horizon. */
  sunset: ({ p, sky }) => (
    <>
      <circle cx="80" cy="72" r="33" fill={p.a} />
      <rect y="62" width="160" height="1.6" fill={sky} />
      <rect y="68.5" width="160" height="2.4" fill={sky} />
      <rect y="75.5" width="160" height="3.4" fill={sky} />
      <rect y="83.5" width="160" height="4.6" fill={sky} />
      <rect y="93" width="160" height="27" fill={sky} />
    </>
  ),

  /** Two circles overlapping, deeper where they meet. They cross at (80, 38.65) and (80, 81.35). */
  orbits: ({ p }) => (
    <>
      <circle cx="67" cy="60" r="25" fill={p.a} />
      <circle cx="93" cy="60" r="25" fill={p.b} />
      <path d="M80 38.65 A25 25 0 0 1 80 81.35 A25 25 0 0 1 80 38.65 Z" fill={p.c} />
    </>
  ),

  /**
   * A crescent moon and stars. The crescent is a circle (78,60 r27) minus an offset
   * circle (91,50 r24); they cross at (102.67, 70.97) and (73.72, 33.34).
   */
  moon: ({ p }) => (
    <>
      <path d="M102.67 70.97 A27 27 0 1 1 73.72 33.34 A24 24 0 0 0 102.67 70.97 Z" fill={p.a} />
      {[
        [36, 28, 1.3],
        [118, 34, 1],
        [126, 88, 1.2],
        [44, 92, 0.9],
        [108, 18, 0.8],
        [28, 60, 0.8],
      ].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={p.b} />
      ))}
    </>
  ),

  /** An arched doorway with light coming through. */
  arch: ({ p, uid }) => (
    <>
      <defs>
        <linearGradient id={`${uid}-light`} x1="0" y1="30" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.b} />
          <stop offset="1" stopColor={p.a} />
        </linearGradient>
        {/* The light on the floor fades out before the bottom edge */}
        <linearGradient id={`${uid}-floor`} x1="0" y1="100" x2="0" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.a} stopOpacity="0.4" />
          <stop offset="1" stopColor={p.a} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M60 100 V54 A20 20 0 0 1 100 54 V100 Z" fill={`url(#${uid}-light)`} />
      <path d="M52 100 H108 L124 120 H36 Z" fill={`url(#${uid}-floor)`} />
    </>
  ),

  /** Light breaking out from a point. */
  rays: ({ p, sky }) => (
    <>
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const inner = 9;
        const outer = i % 2 === 0 ? 40 : 30;
        return (
          <line
            key={i}
            x1={80 + Math.cos(angle) * inner}
            y1={60 + Math.sin(angle) * inner}
            x2={80 + Math.cos(angle) * outer}
            y2={60 + Math.sin(angle) * outer}
            stroke={p.a}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="80" cy="60" r="5" fill={p.a} />
      <circle cx="80" cy="60" r="2" fill={sky} />
    </>
  ),

  /** Tree rings: uneven growth out from an off-centre heart, like a cut log. */
  rings: ({ p }) => (
    <>
      {[5, 11, 18, 26, 35, 45, 56].map((r, i) => (
        <ellipse
          key={r}
          cx={72 + i * 1.6}
          cy={66 - i * 1.1}
          rx={r * 1.06}
          ry={r}
          fill="none"
          stroke={i === 3 ? p.c : p.a}
          strokeWidth={i < 3 ? 1.1 : 1.5}
          opacity={i === 6 ? 0.55 : 1}
        />
      ))}
      <circle cx="72" cy="66" r="1.8" fill={p.c} />
    </>
  ),

  /** Bands of water in solid colours, light at the horizon and deepening towards the front. */
  waves: ({ p }) => (
    <>
      {p.bands.map((colour, i) => {
        const y = 44 + i * 13;
        const d = `M0 ${y} C 26 ${y - 8}, 54 ${y + 8}, 80 ${y} S 134 ${y - 8}, 160 ${y} V120 H0 Z`;
        return <path key={colour} d={d} fill={colour} />;
      })}
    </>
  ),
};
