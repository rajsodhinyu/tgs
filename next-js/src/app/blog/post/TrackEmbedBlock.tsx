"use client";

import Image from "next/image";
import { usePlatform } from "../../components/PlatformSwitcher";

interface TrackEmbedProps {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  title?: string;
  blurb?: string;
  alignment?: "left" | "right";
}

export default function TrackEmbedBlock({
  spotifyUrl,
  appleMusicUrl,
  trackName,
  artistName,
  albumArt,
  title,
  blurb,
  alignment = "left",
}: TrackEmbedProps) {
  const [platform] = usePlatform();
  const isRight = alignment === "right";

  const href =
    platform === "apple" && appleMusicUrl
      ? appleMusicUrl
      : spotifyUrl || appleMusicUrl;

  return (
    <div className="my-6" style={{ textIndent: 0, textWrap: "wrap" }}>
      <div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${isRight ? "float-right ml-4" : "float-left mr-4"} mb-2 w-[180px] lg:w-[280px] block`}
        >
          {title && (
            <div className={`font-bit text-tgs-pink text-xl lg:text-2xl mb-2 uppercase tracking-wider ${isRight ? "text-right" : "text-left"}`}>
              {title}
            </div>
          )}
          {albumArt && (
            <Image
              src={albumArt}
              alt={trackName || "Album art"}
              width={180}
              height={180}
              className="rounded-lg w-[180px] h-[180px] lg:w-[280px] lg:h-[280px] object-cover"
              unoptimized
            />
          )}
          <div className={`font-bit text-white ${isRight ? "text-right" : "text-left"} mt-2 text-sm lg:text-base leading-tight truncate`}>
            <div className="truncate">{trackName}</div>
            <div className="text-white/60 truncate">{artistName}</div>
          </div>
        </a>
        {blurb && (
          <p className={`text-white font-roc text-base ${isRight ? "text-left" : "text-right"} leading-normal`} style={{ textIndent: 0 }}>
            {blurb}
          </p>
        )}
        <div className="clear-both" />
      </div>
    </div>
  );
}
