"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { setThemeChoice, useThemeChoice, type ThemeChoice } from "@/lib/theme";

const options: { value: ThemeChoice; label: string; Icon: LucideIcon }[] = [
  { value: "auto", label: "Auto", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Light / Dark / Auto, for the menu drawer (which is dark in both modes). Auto follows the
 * device; the choice is remembered on this device.
 */
export function ThemeSwitch() {
  const choice = useThemeChoice();
  return (
    <div className="flex items-center justify-between gap-4">
      <span id="theme-label" className="text-[0.92rem] text-night-text">
        Appearance
      </span>
      <div role="radiogroup" aria-labelledby="theme-label" className="flex gap-1 rounded-squircle-xs bg-white/[0.06] p-1">
        {options.map(({ value, label, Icon }) => {
          const on = choice === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setThemeChoice(value)}
              // Squircle corners sized to sit evenly inside the group's (12px squircle, 4px padding)
              className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[3px] px-2.5 supports-[corner-shape:squircle]:rounded-[8px] supports-[corner-shape:squircle]:[corner-shape:squircle] text-[0.8rem] font-semibold transition-colors ${
                on ? "bg-white text-coal" : "text-night-text hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon aria-hidden className="size-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
