"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";
import type { HeroSlide } from "@/content/home";
import { useLiveStatus } from "@/lib/live-status";

const SLIDE_MS = 7000;

const solidButton =
  "inline-flex h-11 items-center justify-center rounded-squircle-xs bg-white px-5 text-[0.95rem] font-medium text-ink transition-[background-color,scale] duration-200 hover:bg-white/90 active:scale-[0.98]";
const glassButton =
  "inline-flex h-11 items-center justify-center rounded-squircle-xs bg-white/15 px-5 text-[0.95rem] font-medium text-white backdrop-blur-md transition-[background-color,scale] duration-200 hover:bg-white/25 active:scale-[0.98]";

type Side = "left" | "right" | null;

/**
 * Hero carousel: full-height photo slides with the words gathered at the bottom: a small
 * label and a large, light headline on the left; a line about it and two buttons on the right.
 *
 * A short loader bar bottom left fills while each slide shows; when it is full the
 * next slide comes in and it starts again from empty. Glass arrows fade in only when the mouse
 * nears a side.
 *
 * The hero fills the screen, so the mouse resting anywhere on it says nothing; it keeps
 * moving. It pauses only when the mouse comes close to the buttons or onto an arrow (someone
 * about to click), while a keyboard user is tabbing through it, when the tab is hidden, and
 * entirely for visitors who ask for reduced motion. Keyboard users also get a pause button
 * that appears when tabbed to, and the arrow keys; touch screens swipe.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** The mouse is near the buttons or on an arrow. */
  const [onControl, setOnControl] = useState(false);
  /** A keyboard user has focus somewhere in the hero. */
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [announce, setAnnounce] = useState(false);
  /** The slide fading out, kept moving until the cross-fade has finished. */
  const [leaving, setLeaving] = useState<number | null>(null);
  const [near, setNear] = useState<Side>(null);
  const reducedMotion = useReducedMotion();
  const tabVisible = useTabVisible();
  const { live } = useLiveStatus();
  const pointerStart = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback(
    (to: number, byHand = true) => {
      const next = ((to % count) + count) % count;
      if (next === index) return;
      setLeaving(index);
      setIndex(next);
      // Announce the new slide to screen readers only when the visitor moved it themselves.
      setAnnounce(byHand);
    },
    [count, index],
  );

  // The cross-fade takes 1.1s; after that the old photo can stop moving.
  useEffect(() => {
    if (leaving === null) return;
    const id = setTimeout(() => setLeaving(null), 1200);
    return () => clearTimeout(id);
  }, [leaving]);

  const autoplay = count > 1 && !reducedMotion;
  const running = autoplay && !paused && !onControl && !keyboardFocus && tabVisible;

  function onPointerDown(e: PointerEvent) {
    // Swipe on touch screens.
    if (e.pointerType !== "mouse") pointerStart.current = e.clientX;
  }
  function onPointerUp(e: PointerEvent) {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    // Show an arrow only while the mouse is in the outer fifth on its side (at most 280px).
    if (e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const zone = Math.min(box.width * 0.2, 280);
    setNear(x < zone ? "left" : x > box.width - zone ? "right" : null);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      // Only focus from the keyboard pauses: a mouse click on an arrow also focuses it,
      // and that shouldn't leave the slides stopped afterwards.
      onFocus={(e) => setKeyboardFocus(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setKeyboardFocus(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        className="relative overflow-hidden rounded-squircle-lg bg-night"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          setNear(null);
          setOnControl(false);
        }}
      >
        {/* Only visible when reached with the Tab key */}
        {autoplay && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="sr-only z-10 rounded-squircle-xs bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            {paused ? "Play slideshow" : "Pause slideshow"}
          </button>
        )}

        {/* The slides sit on top of one another and cross-fade (see "Hero carousel motion"
            in globals.css). The active one is raised to z-index 1, so the arrows, loader and
            pause button above it need z-10 to stay visible. */}
        <div aria-live={announce ? "polite" : "off"} className="grid">
          {slides.map((slide, i) => (
            <Slide
              key={slide.id}
              slide={slide}
              position={i + 1}
              count={count}
              active={i === index}
              state={i === index ? "active" : i === leaving ? "leaving" : "idle"}
              // Each slide in turn gets a different camera move (see .hero-slide[data-motion])
              motion={i % 3}
              preload={i === 0}
              live={live}
              onControl={setOnControl}
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <ArrowButton side="left" label="Previous slide" shown={near === "left"} onControl={setOnControl} onClick={() => go(index - 1)} />
            <ArrowButton side="right" label="Next slide" shown={near === "right"} onControl={setOnControl} onClick={() => go(index + 1)} />

            {/* The loader, bottom left under the headline: a short line that fills while the
                current slide shows; when it is full the next slide comes in and it starts again
                from empty. Kept quiet on purpose (a barely-there track and a solid, very
                translucent fill). Hidden from screen readers, who get the slide group labels.
                Left out for reduced motion, where the slides don't move on by themselves. */}
            {autoplay && (
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-8 left-6 z-10 h-[2px] w-16 overflow-hidden rounded-full bg-white/[0.12] sm:bottom-10 sm:left-10 sm:w-24 lg:bottom-12 lg:left-16"
              >
                <span
                  // A new key on every slide restarts the fill from empty.
                  key={index}
                  className="absolute inset-0 origin-left rounded-full bg-white/35"
                  style={{
                    animation: `fill-bar ${SLIDE_MS}ms linear forwards`,
                    animationPlayState: running ? "running" : "paused",
                  }}
                  onAnimationEnd={() => go(index + 1, false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Slide({
  slide,
  position,
  count,
  active,
  state,
  motion,
  preload,
  live,
  onControl,
}: {
  slide: HeroSlide;
  position: number;
  count: number;
  active: boolean;
  /** Whether its photo is drifting: while showing, and while fading out. */
  state: "active" | "leaving" | "idle";
  motion: number;
  preload: boolean;
  /** Whether a stream is on now, for buttons marked liveOnly. */
  live: boolean;
  /** Told when the mouse comes close to the buttons, and when it leaves. */
  onControl: (near: boolean) => void;
}) {
  const showPrimary = !slide.primary.liveOnly || live;
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${count}: ${slide.headline}`}
      aria-hidden={!active}
      inert={!active}
      data-active={active}
      data-state={state}
      data-motion={motion}
      // Fills the rest of the screen: the viewport less the navbar (56px, 64px from lg) and a
      // 12px margin at the bottom, matching the 12px at each side. Never shorter than 34rem.
      // All slides share one grid cell; .hero-slide fades the active one in over the others.
      className="hero-slide relative flex h-[calc(100svh-4.25rem)] min-h-[34rem] w-full flex-col overflow-hidden [grid-area:1/1] lg:h-[calc(100svh-4.75rem)]"
    >
      <Image
        src={slide.photo.src}
        alt=""
        fill
        sizes="(min-width: 1920px) 1896px, 100vw"
        preload={preload}
        // Drifts slowly and continuously, like video (see .hero-photo in globals.css)
        className="hero-photo object-cover"
      />
      {/* A light veil over the whole picture, deepening towards the bottom where the words sit */}
      <span aria-hidden className="absolute inset-0 bg-black/15" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/70 via-black/30 to-black/0" />

      {/* The words, gathered at the bottom: the headline on the left; the line about it and
          the two buttons on the right from lg up (stacked under it on smaller screens).
          The bottom padding leaves room for the loader. */}
      <div className="relative mt-auto flex flex-col gap-7 px-6 pb-20 text-white sm:px-10 sm:pb-24 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:px-16 lg:pb-28">
        {/* Each .hero-rise part fades up in turn when the slide comes in; --d is its delay in ms */}
        <div className="min-w-0">
          <p className="hero-rise text-sm font-medium text-white/75" style={{ "--d": 150 } as CSSProperties}>
            {slide.eyebrow}
          </p>
          <h2
            style={{ "--d": 260 } as CSSProperties}
            className="hero-rise mt-3 max-w-[15ch] text-[clamp(2.25rem,1.35rem+2.8vw,4.5rem)] font-normal text-white leading-[1.02] tracking-[-0.035em] text-balance">
            {slide.headline}
          </h2>
        </div>

        <div className="lg:max-w-[28rem] lg:shrink-0">
          <p className="hero-rise max-w-[38ch] text-[clamp(1.0625rem,0.98rem+0.3vw,1.25rem)] leading-relaxed text-white/85" style={{ "--d": 420 } as CSSProperties}>
            {slide.text}
          </p>
          {/* The padding widens the area that counts as "close to the buttons" by 32px on every
              side; the negative margin keeps the layout where it was. */}
          <div
            className="hero-rise -m-8 mt-[-0.5rem] flex flex-wrap gap-3 p-8"
            style={{ "--d": 540 } as CSSProperties}
            onPointerEnter={(e) => e.pointerType === "mouse" && onControl(true)}
            onPointerLeave={() => onControl(false)}
          >
            {showPrimary && (
              <Link
                href={slide.primary.href}
                className={`${solidButton} ${slide.primary.liveOnly ? "live-appear gap-2" : ""}`}
              >
                {/* The red broadcast icon, pulsing */}
                {slide.primary.liveOnly && (
                  <Radio aria-hidden className="animate-live size-[1.1rem] text-live" strokeWidth={2.25} />
                )}
                {slide.primary.label}
              </Link>
            )}
            {slide.secondary && (
              // With no main button showing, this one takes the solid style.
              <Link href={slide.secondary.href} className={showPrimary ? glassButton : solidButton}>
                {slide.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowButton({
  side,
  label,
  shown,
  onControl,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  shown: boolean;
  onControl: (near: boolean) => void;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerEnter={(e) => e.pointerType === "mouse" && onControl(true)}
      onPointerLeave={() => onControl(false)}
      // Frosted glass with no outline. Hidden on phones, where swiping does the job; elsewhere
      // it fades in as the mouse nears its side, or when reached with the Tab key.
      className={`absolute top-1/2 z-10 hidden size-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[opacity,background-color,translate] duration-300 ease-out hover:bg-white/20 focus-visible:pointer-events-auto focus-visible:translate-x-0 focus-visible:opacity-100 focus-visible:outline-white sm:flex ${
        side === "left" ? "left-5 lg:left-8" : "right-5 lg:right-8"
      } ${
        shown
          ? "pointer-events-auto translate-x-0 opacity-100"
          : `pointer-events-none opacity-0 ${side === "left" ? "-translate-x-2" : "translate-x-2"}`
      }`}
    >
      <Icon aria-hidden className="size-6" strokeWidth={1.75} />
    </button>
  );
}

/** True when the visitor's system asks for less motion. False during the server render. */
function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** False while the browser tab is in the background. */
function useTabVisible() {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    },
    () => document.visibilityState === "visible",
    () => true,
  );
}
