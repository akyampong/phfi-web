import Image from "next/image";
import { Artwork, type ArtSpec } from "./artwork";

/** A photo from Unsplash: the image URL without a query string, a description, and its Unsplash page for credit. */
/** A photo: a remote URL or a path under public/. `credit` links to the source page, when there is one. */
export type Photo = { src: string; alt: string; credit?: string };

type CoverProps = {
  photo?: Photo;
  art: ArtSpec;
  /** Unique on the page; names the artwork's gradients. */
  uid: string;
  /** How wide the image is shown, for picking the right file size, e.g. "(min-width: 1024px) 25vw, 100vw". */
  sizes: string;
  /** Load straight away; for the first image on the page. */
  preload?: boolean;
  className?: string;
};

/**
 * Fills its (positioned) parent with a photo, or with artwork when there is no photo.
 * Photos are decorative here, so the alt text is empty: the title beside it says what it is.
 */
export function Cover({ photo, art, uid, sizes, preload = false, className = "" }: CoverProps) {
  if (photo) {
    return (
      <Image
        src={photo.src}
        alt=""
        fill
        sizes={sizes}
        preload={preload}
        className={`object-cover ${className}`}
      />
    );
  }
  return <Artwork {...art} uid={uid} className={`absolute inset-0 size-full ${className}`} />;
}
