"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, ChevronDown, Copy, Lock, QrCode } from "lucide-react";
import { onlineGiving } from "@/content/give";

type Tab = "online" | "crypto";

/**
 * The giving card at the top of /give: one focused tool, like the giving pages people know.
 * Online: a big amount you can type or pick, the currency, once or monthly, which fund, and one
 * button. Crypto: the coin, its network, a QR code and the address. No payment provider or
 * wallet is connected yet, so giving says it's coming soon.
 */
export function GiveWidget() {
  const [tab, setTab] = useState<Tab>("online");
  return (
    <div className="rounded-squircle-md bg-paper p-5 text-ink shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] sm:p-7 dark:ring-1 dark:ring-white/10">
      <Segmented
        label="How to give"
        value={tab}
        onChange={setTab}
        options={[
          { value: "online", label: "Give online" },
          { value: "crypto", label: "Crypto" },
        ]}
      />
      {/* Both tabs share one space, so the card is always the taller one's height and nothing
          around it moves when switching. The hidden one is invisible and can't be reached. */}
      <div className="mt-7 grid">
        <div inert={tab !== "online"} className={`[grid-area:1/1] ${tab === "online" ? "" : "invisible"}`}>
          <Online />
        </div>
        <div inert={tab !== "crypto"} className={`flex flex-col [grid-area:1/1] ${tab === "crypto" ? "" : "invisible"}`}>
          <Crypto />
        </div>
      </div>
    </div>
  );
}

function Online() {
  const { currencies, funds, methods } = onlineGiving;
  const [code, setCode] = useState(currencies[0].code);
  const currency = currencies.find((c) => c.code === code) ?? currencies[0];
  const [amount, setAmount] = useState(String(currency.presets[1]));
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [fund, setFund] = useState(funds[0]);
  const [notice, setNotice] = useState(false);
  const ids = { amount: useId(), currency: useId(), fund: useId() };

  const value = Number(amount);
  const valid = amount !== "" && Number.isFinite(value) && value > 0;
  const formatted = valid ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "0";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) setNotice(true);
      }}
      className="flex flex-col gap-6"
    >
      {/* The amount, large, typed straight in; the currency beneath it */}
      <div className="flex flex-col items-center">
        <label htmlFor={ids.amount} className="sr-only">
          Amount in {currency.code}
        </label>
        <div className="flex max-w-full items-start justify-center">
          <span aria-hidden className="mt-2 text-[1.75rem] font-medium leading-none text-muted">
            {currency.symbol}
          </span>
          <input
            id={ids.amount}
            inputMode="decimal"
            autoComplete="off"
            value={amount}
            placeholder="0"
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1"))}
            // As wide as what's typed, so the amount stays centred
            style={{ width: `${Math.max(1, amount.length || 1) + 0.25}ch` }}
            className="min-w-0 bg-transparent text-center text-[clamp(3rem,2.5rem+2vw,4rem)] font-medium leading-none tracking-[-0.03em] tabular-nums text-ink placeholder:text-rule-strong focus:outline-none"
          />
        </div>
        <div className="relative mt-3">
          <label htmlFor={ids.currency} className="sr-only">
            Currency
          </label>
          <select
            id={ids.currency}
            value={code}
            onChange={(e) => {
              const next = currencies.find((c) => c.code === e.target.value) ?? currencies[0];
              setCode(next.code);
              setAmount(String(next.presets[1]));
            }}
            className="h-8 cursor-pointer appearance-none rounded-full bg-ink/[0.06] pl-3.5 pr-8 text-sm font-semibold text-ink transition-colors hover:bg-ink/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Quick amounts (the currency is shown with the amount above) */}
      <div role="group" aria-label={`Quick amounts in ${currency.code}`} className="grid grid-cols-4 gap-2">
        {currency.presets.map((preset) => {
          const active = value === preset;
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => setAmount(String(preset))}
              className={`h-11 cursor-pointer rounded-squircle-xs text-[0.95rem] font-semibold tabular-nums transition-colors ${
                active ? "bg-ink text-paper" : "bg-ink/[0.06] text-ink hover:bg-ink/10"
              }`}
            >
              {preset.toLocaleString("en-US")}
            </button>
          );
        })}
      </div>

      <Segmented
        label="How often"
        value={frequency}
        onChange={setFrequency}
        options={[
          { value: "once", label: "One time" },
          { value: "monthly", label: "Monthly" },
        ]}
      />

      <div className="relative">
        <label htmlFor={ids.fund} className="pointer-events-none absolute left-4 top-2 text-xs font-medium text-muted">
          Give to
        </label>
        <select
          id={ids.fund}
          value={fund}
          onChange={(e) => setFund(e.target.value)}
          className="h-14 w-full cursor-pointer appearance-none rounded-squircle-xs border border-rule bg-paper pb-1.5 pl-4 pr-10 pt-5 text-[1rem] font-medium text-ink transition-colors hover:border-rule-strong focus:border-ink focus:outline-none"
        >
          {funds.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
      </div>

      <div>
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex h-13 w-full cursor-pointer items-center justify-center rounded-squircle-xs bg-ink px-5 text-[1.0625rem] font-semibold text-paper transition-[background-color,scale] duration-200 hover:bg-ink/85 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {valid ? `Give ${currency.symbol}${formatted}${frequency === "monthly" ? " monthly" : ""}` : "Enter an amount"}
        </button>
        <p aria-live="polite" className={`text-center text-[0.95rem] leading-relaxed text-ink ${notice ? "mt-4" : "sr-only"}`}>
          {notice && "Online giving opens soon. For now, please give by mobile money or bank transfer below. Thank you!"}
        </p>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.8125rem] text-muted">
          <Lock aria-hidden className="size-3.5" />
          Secure checkout · {methods}
        </p>
      </div>
    </form>
  );
}

function Crypto() {
  const { crypto } = onlineGiving;
  const [coin, setCoin] = useState(crypto[0].coin);
  const [copied, setCopied] = useState(false);
  const selected = crypto.find((c) => c.coin === coin) ?? crypto[0];
  const ready = Boolean(selected.address);

  return (
    <div className="flex flex-1 flex-col justify-between gap-6">
      <div role="radiogroup" aria-label="Coin" className="grid grid-cols-4 gap-2">
        {crypto.map((c) => (
          <button
            key={c.coin}
            type="button"
            role="radio"
            aria-checked={c.coin === coin}
            onClick={() => setCoin(c.coin)}
            className={`h-11 cursor-pointer rounded-squircle-xs text-[0.95rem] font-semibold transition-colors ${
              c.coin === coin ? "bg-ink text-paper" : "bg-ink/[0.06] text-ink hover:bg-ink/10"
            }`}
          >
            {c.coin}
          </button>
        ))}
      </div>

      {/* The QR code for the address goes here once there is one */}
      <div className="flex flex-col items-center text-center">
        <div className="flex size-44 items-center justify-center rounded-squircle-sm bg-ink/[0.04] text-ink/20">
          <QrCode aria-hidden className="size-20" strokeWidth={1} />
        </div>
        <p className="mt-5 text-title text-ink">{selected.name}</p>
        <p className="mt-1 text-sm text-muted">on {selected.network}</p>
      </div>

      <div className="flex items-center gap-2 rounded-squircle-xs border border-rule py-2 pl-4 pr-2">
        <code className={`min-w-0 flex-1 truncate font-mono text-[0.9rem] ${ready ? "text-ink" : "text-muted"}`}>
          {ready ? selected.address : "Wallet address coming soon"}
        </code>
        <button
          type="button"
          disabled={!ready}
          aria-label={`Copy ${selected.coin} address`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(selected.address);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // Copying isn't allowed here; the address is on screen.
            }
          }}
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
        </button>
      </div>

      <p className="text-center text-[0.8125rem] leading-relaxed text-muted">
        Send only {selected.coin} on {selected.network}. Other coins or networks can’t be recovered.
      </p>
    </div>
  );
}

/** A row of choices where one is picked, like the menu's Appearance switch. */
function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-squircle-xs bg-ink/[0.06] p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          // Inside the 12px squircle, 4px in: 8px corners so the curves nest
          className={`h-10 flex-1 cursor-pointer rounded-[3px] px-3 text-sm font-semibold transition-colors supports-[corner-shape:squircle]:rounded-[8px] supports-[corner-shape:squircle]:[corner-shape:squircle] ${
            option.value === value ? "bg-paper text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-muted hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
