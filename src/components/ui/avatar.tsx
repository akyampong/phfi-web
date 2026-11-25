import Image from "next/image";
import { Avatar as DiceBear, Style } from "@dicebear/core";
import blobs from "@dicebear/styles/blobs.json" with { type: "json" };

const blobStyle = new Style(blobs as ConstructorParameters<typeof Style>[0]);

/**
 * Someone's picture (from Google, say), or when there isn't one, a DiceBear "Blobs" avatar
 * (CC0): made here on the server from their account ID, so the same person always gets the
 * same blob and nothing about them is sent anywhere. Decorative: their name is always shown
 * or announced beside it.
 */
export function Avatar({ id, image, size }: { id: string; image?: string | null; size: number }) {
  const src = image || new DiceBear(blobStyle, { seed: id }).toDataUri();
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      // Generated blobs are tiny SVGs already; Google's pictures go through the resizer
      unoptimized={!image}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}
