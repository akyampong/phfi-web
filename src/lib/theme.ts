"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/components/layout/theme-script";

/** A visitor's choice: follow the device, or always light, or always dark. */
export type ThemeChoice = "auto" | "light" | "dark";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readChoice(): ThemeChoice {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "auto";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // The device switching between light and dark matters while the choice is Auto
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
  };
}

/** Saves the choice on this device and applies it straight away. */
export function setThemeChoice(choice: ThemeChoice) {
  const root = document.documentElement;
  try {
    if (choice === "auto") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage is blocked (private browsing): the choice still applies for this visit.
  }
  if (choice === "auto") delete root.dataset.theme;
  else root.dataset.theme = choice;
  notify();
}

/** The visitor's choice. "auto" during the server render. */
export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, readChoice, () => "auto");
}

/** Whether the page is showing dark right now, by choice or by device. False on the server. */
export function useIsDark(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      const choice = readChoice();
      return choice === "dark" || (choice === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    },
    () => false,
  );
}
