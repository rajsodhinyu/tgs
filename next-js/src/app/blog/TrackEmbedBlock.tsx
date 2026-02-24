"use client";

import Image from "next/image";
import { PortableText } from "next-sanity";
import { usePlatform } from "../components/PlatformSwitcher";

interface TrackEmbedProps {
  spotifyUrl?: string;
  appleMusicUrl?: string;
  trackName?: string;
  artistName?: string;
  albumArt?: string;
  heading?: string;
  subheading?: string;
  blurb?: any;
  alignment?: "left" | "right";
}

export default function TrackEmbedBlock({
  spotifyUrl,
  appleMusicUrl,
  trackName,
  artistName,
  albumArt,
  heading,
  subheading,
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
          <div
            className={`font-title text-white ${isRight ? "text-right" : "text-left"} mt-2 leading-tight truncate`}
          >
            <div className="truncate text-sm lg:text-2xl">{heading || trackName}</div>
            <div className="text-white/80 text-sm lg:text-xl truncate">
              {subheading || artistName}
            </div>
          </div>
        </a>
        {blurb && (
          <div
            className={`text-white font-roc text-left text-balance text-base md:text-lg lg:text-xl leading-normal [&_a]:underline [&_a]:underline-offset-2`}
            style={{ textIndent: 0 }}
          >
            <PortableText value={blurb} />
          </div>
        )}
        <div className="clear-both" />
      </div>
    </div>
  );
}
