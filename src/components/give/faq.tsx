import { Plus } from "lucide-react";

/**
 * Questions and answers that open one at a time. Native <details>, so they work without
 * JavaScript and with the keyboard. Each sits on a faint tile; space separates them.
 */
export function Faq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <details key={item.question} className="group rounded-squircle-sm bg-ink/[0.035] transition-colors open:bg-ink/[0.05]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-[1.0625rem] font-semibold leading-snug text-ink sm:px-6 [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus aria-hidden className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <p className="max-w-[62ch] px-5 pb-6 text-[1rem] leading-relaxed text-body sm:px-6">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
