/** Where a visitor's Light / Dark choice is kept (no entry means Auto: follow the device). */
export const THEME_STORAGE_KEY = "phfi-theme";

/**
 * Applies a saved Light or Dark choice before the page is first drawn, so there's no flash of
 * the wrong mode. It only sets data-theme on <html>; the colours themselves are in globals.css
 * ("Dark mode"). With no saved choice it does nothing, and the device's setting decides.
 * Render it in the root layout's <head>.
 */
export function ThemeScript() {
  const script = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
