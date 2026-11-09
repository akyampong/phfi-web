/**
 * Whether a meeting is streaming right now.
 * Placeholder until the streaming platform is connected.
 * Set LIVE_OVERRIDE=on in .env.local to preview the live state.
 */
export function getLiveStatus(): boolean {
  return process.env.LIVE_OVERRIDE === "on";
}
