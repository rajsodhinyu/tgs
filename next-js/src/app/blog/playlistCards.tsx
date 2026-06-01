"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// How far each album art peeks above the one in front is set responsively via
// the `--peek` CSS var (20px mobile, 45px desktop) on the stack container.

export default function PlaylistCard({
  title,
  description,
  cover,
  url,
  playlistURL,
  disabled,
}: {
  title: string;
  description: string;
  cover: string;
  url: string;
  /** Spotify playlist URL — used to fetch the album art that sits behind the cover. */
  playlistURL?: string;
  disabled?: boolean;
}) {
  const [art, setArt] = useState<string[]>([]);

  useEffect(() => {
    if (!playlistURL) return;
    let cancelled = false;
    fetch(`/api/spotify/playlist?url=${encodeURIComponent(playlistURL)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.images)) {
          setArt(d.images.filter((u: string) => u !== cover));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [playlistURL, cover]);

  // Four album arts behind the cover, like records peeking out of a crate.
  const behind = art.slice(0, 4);
  const count = behind.length;

  return (
    <div
      className={`align-middle pb-3 group max-w-[360px] mx-auto ${disabled ? "opacity-30 pointer-events-none" : ""}`}
    >
      <Link href={url}>
        {/* Crate-style stack: album arts peek above the front playlist cover. */}
        <div
          className="relative [--peek:20px] lg:[--peek:30px]"
          style={{ paddingTop: `calc(var(--peek) * ${count})` }}
        >
          {behind.map((src, i) => (
            <div
              key={src}
              className="absolute left-0 right-0 aspect-square rounded-lg overflow-hidden shadow-md pointer-events-none"
              style={{
                top: `calc(var(--peek) * ${i})`,
                marginLeft: (count - i) * 2,
                marginRight: (count - i) * 2,
                zIndex: i,
              }}
            >
              <Image
                src={src}
                alt=""
                width={300}
                height={300}
                className="w-full h-full object-cover"
                unoptimized
                draggable={false}
              />
            </div>
          ))}
          <Image
            className="relative w-full h-auto rounded-lg border-white border-0 group-hover:border-2 md:group-hover:border-6 group-hover:scale-[98%] transition-all"
            src={cover}
            alt=""
            width={400}
            height={400}
            style={{ zIndex: count + 1 }}
          />
        </div>
        <div className="flex-col justify-between ">
          <div className="pt-3 text-center text-pretty text-white text-xl font-bold font-bit group-hover:font-title leading-4 lg:text-3xl">
            {title}
          </div>
          <div className="w-11/12 place-self-center text-center align-center text-white/80 group-hover:text-white text-balance text-[10px] font- font-roc leading-none pt-2">
            {description}
          </div>
        </div>
      </Link>
    </div>
  );
}
