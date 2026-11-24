import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, HandHeart, Sprout, UserRound, UsersRound } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Reveal } from "@/components/ui/reveal";
import {
  bodyText,
  buttonPrimary,
  buttonSecondary,
  groupUnderline,
  onImageButton,
  onImageGlassButton,
} from "@/components/ui/styles";
import {
  beliefs,
  board,
  closing,
  community,
  groupPhoto,
  intro,
  mission,
  story,
  values,
  type BoardMember,
  type Value,
} from "@/content/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Purpose House Fellowship International: a family of believers who worship, pray and open the Bible together online, wherever we are.",
  alternates: { canonical: "/about" },
};

/** Small grey line above a section's title. */
const eyebrow = "text-sm font-medium text-muted";

/**
 * The About page, about the community first: who we are and a picture of us together, then
 * what we're here for, what we value, how we began, what life together looks like, what we
 * believe and who serves on the board, ending with an invitation. Words and photos are in
 * content/about.ts.
 */
export default function AboutPage() {
  return (
    <PageTransition>
      {/* Spacing as on the home page: space between sections, no lines */}
      <div className="container-page pb-12 md:pb-16 lg:pb-20">
        <div className="content-width flex flex-col gap-24 md:gap-32 lg:gap-40">
          <div className="flex flex-col gap-12 pt-12 md:gap-16 md:pt-16 lg:pt-20">
            <Intro />
            <GroupPhoto />
          </div>
          <Mission />
          <Values />
          <Story />
          <LifeTogether />
          <Beliefs />
          <Board />
          <Reveal>
            <Closing />
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}

function Intro() {
  return (
    <header className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
      <div className="lg:col-span-7">
        <p className={eyebrow}>About us</p>
        <h1 className="mt-4 max-w-[16ch] text-display text-ink lg:max-w-none lg:whitespace-pre-line">{intro.headline}</h1>
      </div>
      <div className="lg:col-span-5">
        <p className={`max-w-[46ch] ${bodyText}`}>{intro.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#meeting-times" className={buttonPrimary}>
            Meeting times
          </Link>
          <Link href="/watch" className={buttonSecondary}>
            Watch a message
          </Link>
        </div>
      </div>
    </header>
  );
}

/** The whole fellowship in one picture, as wide as the page. */
function GroupPhoto() {
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden rounded-squircle-lg bg-canvas sm:aspect-[16/9] lg:aspect-[21/9]">
        <Image
          src={groupPhoto.photo.src}
          alt={groupPhoto.photo.alt}
          fill
          preload
          sizes="(min-width: 1504px) 1440px, 100vw"
          className="object-cover"
        />
      </div>
      <figcaption className="mt-4 text-sm text-muted">{groupPhoto.caption}</figcaption>
    </figure>
  );
}

function Mission() {
  return (
    <Reveal as="div">
      <section aria-labelledby="mission-title">
        <h2 id="mission-title" className={eyebrow}>
          Our mission
        </h2>
        <p className="mt-6 max-w-[26ch] text-[clamp(2rem,1.3rem+2.4vw,3.5rem)] font-normal leading-[1.1] tracking-[-0.03em] text-balance text-ink">
          {mission.statement}
        </p>
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12 lg:mt-16 lg:max-w-[64rem] lg:gap-16">
          {mission.more.map((item) => (
            <div key={item.title}>
              <h3 className="text-title text-ink">{item.title}</h3>
              <p className={`mt-3 ${bodyText}`}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

const valueIcons: Record<Value["icon"], typeof BookOpen> = {
  word: BookOpen,
  prayer: HandHeart,
  family: UsersRound,
  purpose: Sprout,
};

function Values() {
  return (
    <section aria-labelledby="values-title">
      <Reveal>
        <h2 id="values-title" className="text-headline text-ink">
          What we value
        </h2>
      </Reveal>
      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {values.map((value, i) => {
          const Icon = valueIcons[value.icon];
          return (
            <Reveal as="li" key={value.title} order={i}>
              <span className="flex size-12 items-center justify-center rounded-squircle-xs bg-ink/[0.06] text-ink">
                <Icon aria-hidden className="size-[1.35rem]" strokeWidth={1.75} />
              </span>
              <h3 className="mt-6 text-title text-ink">{value.title}</h3>
              <p className="mt-2.5 text-[1rem] leading-relaxed text-body">{value.text}</p>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

/** How we began, beside a photo, with a few figures underneath. */
function Story() {
  return (
    <section id="story" aria-labelledby="story-title" className="grid scroll-mt-24 items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <Reveal className="relative aspect-[4/5] overflow-hidden rounded-squircle-lg bg-canvas lg:col-span-5">
        <Image src={story.photo.src} alt={story.photo.alt} fill sizes="(min-width: 1504px) 580px, (min-width: 1024px) 40vw, 100vw" className="object-cover" />
      </Reveal>
      <Reveal className="lg:col-span-7 lg:pl-4">
        <h2 id="story-title" className="text-headline text-ink">
          Our story
        </h2>
        <div className={`mt-6 flex max-w-[60ch] flex-col gap-5 ${bodyText}`}>
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
        <dl className="mt-12 grid grid-cols-3 gap-6 lg:mt-16">
          {story.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2">
              <dt className="text-sm leading-snug text-muted">{stat.label}</dt>
              <dd className="text-[clamp(2.25rem,1.6rem+2vw,3.5rem)] font-normal leading-none tracking-[-0.03em] text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}

/** What community looks like here: photos of it, and the ways to take part. */
function LifeTogether() {
  return (
    <section aria-labelledby="community-title">
      <Reveal className="max-w-[48rem]">
        <h2 id="community-title" className="text-headline text-ink">
          {community.title}
        </h2>
        <p className={`mt-5 ${bodyText}`}>{community.text}</p>
      </Reveal>
      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-16">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7">
          {community.photos.map((photo, i) => (
            <Reveal key={photo.src} order={i} className={`relative aspect-[4/5] overflow-hidden rounded-squircle-md bg-canvas ${i === 1 ? "mt-10 sm:mt-16" : ""}`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1504px) 420px, (min-width: 1024px) 29vw, 50vw" className="object-cover" />
            </Reveal>
          ))}
        </div>
        <ul className="flex flex-col justify-center gap-10 lg:col-span-5">
          {community.ways.map((way, i) => (
            <Reveal as="li" key={way.title} order={i}>
              <Link href={way.href} className="group block">
                <span className="flex items-center gap-2 text-title text-ink">
                  <span className={groupUnderline}>{way.title}</span>
                  <ArrowRight aria-hidden className="size-[1.1rem] transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className={`mt-2 block max-w-[40ch] ${bodyText}`}>{way.text}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Beliefs() {
  return (
    <section id="beliefs" aria-labelledby="beliefs-title" className="scroll-mt-24">
      <Reveal className="max-w-[48rem]">
        <h2 id="beliefs-title" className="text-headline text-ink">
          What we believe
        </h2>
        <p className={`mt-5 ${bodyText}`}>
          We hold to the historic Christian faith. In short, these are the things we stand on together.
        </p>
      </Reveal>
      <ol className="mt-10 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
        {beliefs.map((belief, i) => (
          <Reveal as="li" key={belief.title} order={i % 3}>
            <span aria-hidden className="text-sm font-semibold tabular-nums text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-title text-ink">{belief.title}</h3>
            <p className="mt-2.5 text-[1rem] leading-relaxed text-body">{belief.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

function Board() {
  return (
    <section id="leadership" aria-labelledby="board-title" className="scroll-mt-24">
      <Reveal className="max-w-[48rem]">
        <h2 id="board-title" className="text-headline text-ink">
          Our board
        </h2>
        <p className={`mt-5 ${bodyText}`}>
          The board serves the fellowship: caring for its direction, its people and its resources, and keeping us faithful
          to our mission.
        </p>
      </Reveal>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:mt-14 lg:gap-x-8 lg:gap-y-14">
        {board.map((member, i) => (
          <Reveal as="li" key={`${member.role}-${i}`} order={i % 3}>
            <Member member={member} />
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

function Member({ member }: { member: BoardMember }) {
  return (
    <figure>
      <div className="relative aspect-[4/5] overflow-hidden rounded-squircle-md bg-canvas">
        {member.photo ? (
          <Image
            src={member.photo.src}
            alt={member.photo.alt || member.name}
            fill
            sizes="(min-width: 1504px) 460px, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          // Until there's a portrait: an outline of a person, so the grid keeps its shape
          <div className="absolute inset-0 flex items-center justify-center bg-ink/[0.04]">
            <UserRound aria-hidden className="size-1/3 text-ink/15" strokeWidth={1} />
          </div>
        )}
      </div>
      <figcaption className="mt-4">
        <span className="block text-title text-ink">{member.name}</span>
        <span className="mt-1 block text-[0.95rem] text-muted">{member.role}</span>
        {member.bio && <span className="mt-3 block text-[0.95rem] leading-relaxed text-body">{member.bio}</span>}
      </figcaption>
    </figure>
  );
}

/** The invitation to end on, over a photo of the fellowship. */
function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative flex min-h-[30rem] flex-col overflow-hidden rounded-squircle-lg bg-night lg:min-h-[36rem]">
      <Image src={closing.photo.src} alt="" fill sizes="(min-width: 1504px) 1440px, 100vw" className="object-cover" />
      <span aria-hidden className="absolute inset-0 bg-black/20" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/75 via-black/30 to-black/0" />
      <div className="relative mt-auto px-6 pb-8 sm:px-10 sm:pb-10 lg:px-14 lg:pb-14">
        <h2 id="closing-title" className="max-w-[14ch] text-[clamp(2.25rem,1.35rem+2.8vw,4.5rem)] font-normal leading-[1.02] tracking-[-0.035em] text-balance text-white">
          {closing.headline}
        </h2>
        <p className="mt-4 max-w-[44ch] text-[clamp(1.0625rem,0.98rem+0.3vw,1.1875rem)] leading-relaxed text-white/85">{closing.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/#meeting-times" className={onImageButton}>
            See meeting times
          </Link>
          {/* Opens the prayer request drawer */}
          <Link href="#pray" className={onImageGlassButton}>
            Send a prayer request
          </Link>
        </div>
      </div>
    </section>
  );
}
