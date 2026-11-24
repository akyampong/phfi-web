import Image from "next/image";
import { CopyButton } from "@/components/ui/copy-button";
import type { PaymentMethod } from "@/content/give";

/**
 * One way to give by transfer: the provider's logo and name, a line on how, who it's paid to,
 * then each number in a calm list (its label above, the number large, a small copy button).
 * Separated by space alone, no boxes or lines.
 */
export function AccountCard({ method }: { method: PaymentMethod }) {
  return (
    <article aria-labelledby={`${method.id}-title`} className="flex w-full flex-col rounded-squircle-lg p-6 ring-1 ring-rule ring-inset sm:p-8 dark:bg-canvas">
      <div className="flex items-center gap-3.5">
        <Image src={method.logo} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full" />
        <h3 id={`${method.id}-title`} className="text-title text-ink">
          {method.name}
        </h3>
      </div>
      <p className="mt-4 max-w-[40ch] text-[1rem] leading-relaxed text-body">{method.description}</p>

      <dl className="mt-8 flex flex-col gap-6">
        <div>
          <dt className="text-sm text-muted">Account name</dt>
          <dd className="mt-1 text-[1.0625rem] font-semibold text-ink">{method.accountName}</dd>
        </div>
        {method.details.map((detail) => (
          <div key={detail.label} className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <dt className="text-sm text-muted">{detail.label}</dt>
              <dd className="mt-1 whitespace-nowrap text-[clamp(1.375rem,1.25rem+0.4vw,1.625rem)] font-medium leading-none tracking-[-0.01em] tabular-nums text-ink">
                {detail.value}
              </dd>
            </div>
            <CopyButton value={detail.copy ?? detail.value} label={`Copy ${detail.label}`} iconOnly className="-mb-2 -mr-2" />
          </div>
        ))}
      </dl>

      {method.note && <p className="mt-auto pt-8 text-[0.9rem] leading-relaxed text-muted">{method.note}</p>}
    </article>
  );
}
