import { Artwork, type ArtSpec } from "@/components/art/artwork";
import type { MeetingArt as MeetingArtName } from "@/config/site";

/** Which artwork each meeting uses. */
export const meetingArtwork: Record<MeetingArtName, ArtSpec> = {
  sunset: { motif: "sunset", palette: "ember" },
  together: { motif: "orbits", palette: "blush" },
  midnight: { motif: "moon", palette: "dusk" },
};

type MeetingArtProps = {
  art: MeetingArtName;
  /** Unique on the page, e.g. "drawer-tuesday". */
  uid: string;
  className?: string;
};

/** A meeting's artwork, cropped to whatever box it is given. */
export function MeetingArt({ art, uid, className = "" }: MeetingArtProps) {
  return <Artwork {...meetingArtwork[art]} uid={uid} className={className} />;
}
