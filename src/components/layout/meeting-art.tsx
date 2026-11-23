import { TonalArtwork } from "@/components/art/artwork";
import { meetingLook, type MeetingArt as MeetingArtName } from "@/config/site";

type MeetingArtProps = {
  art: MeetingArtName;
  /** Unique on the page, e.g. "drawer-tuesday". */
  uid: string;
  className?: string;
};

/**
 * A meeting's artwork, cropped to whatever box it is given: the same flat colour and
 * tone-on-tone shape as the meeting's bento tile (both read meetingLook in config/site.ts).
 */
export function MeetingArt({ art, uid, className = "" }: MeetingArtProps) {
  const { colour, motif } = meetingLook[art];
  // Centred, as thumbnails are small squares (the bento tiles set the shape off to the side)
  return <TonalArtwork motif={motif} colour={colour} uid={uid} centred className={className} />;
}
