import { ViewTransition, type ReactNode } from "react";

/**
 * Wrap each page's content in this so moving between pages cross-fades: the old page fades
 * out quickly and the new one fades up into place (CSS under "Page changes" in globals.css).
 * It belongs in each page, not the layout: layouts stay mounted between pages, so they never
 * enter or exit. Other updates, such as the live page refreshing itself, don't animate.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}
