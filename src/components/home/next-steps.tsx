import Image from "next/image";
import Link from "next/link";
import type { nextSteps as NextStepsData } from "@/content/home";
import { Reveal } from "@/components/ui/reveal";

/** Photo tiles for the main ways to take a next step, with the words set over a dark fade. */
export function NextSteps({ steps }: { steps: typeof NextStepsData }) {
  return (
    <section aria-labelledby="next-steps-title">
      <Reveal>
        <h2 id="next-steps-title" className="max-w-[18ch] text-headline text-ink text-balance">
          Take your next step with us
        </h2>
      </Reveal>

      <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:mt-14 lg:gap-6">
        {steps.map((step, i) => (
          <Reveal as="li" key={step.href} order={i}>
            <Link
              href={step.href}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-squircle-md bg-ink p-6 text-white md:aspect-[4/5] lg:p-8"
            >
              <Image
                src={step.photo.src}
                alt=""
                fill
                sizes="(min-width: 1504px) 470px, (min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              {/* Darken the lower part so the white type reads on any photo */}
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/0" />
              <span className="relative">
                <span className="block text-sm font-medium text-white/85">{step.label}</span>
                <span className="mt-3 block max-w-[16ch] text-[clamp(1.5rem,1.25rem+0.8vw,1.875rem)] font-bold leading-[1.12] tracking-[-0.02em]">
                  {step.title}
                </span>
                <span className="mt-6 inline-flex h-9 items-center rounded-squircle-xs bg-white px-4 text-sm font-semibold text-ink transition-colors group-hover:bg-white/90">
                  {step.action}
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
