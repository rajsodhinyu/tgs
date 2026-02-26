"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Playlist = {
  _id: string;
  name: string;
  description: string;
  playlistURL: string;
  appleMusicURL?: string;
  coverUrl: string;
};

type Platform = "spotify" | "apple";

function DividerCard({
  playlist,
  platform,
}: {
  playlist: Playlist;
  platform: Platform;
}) {
  const href =
    platform === "apple" && playlist.appleMusicURL
      ? playlist.appleMusicURL
      : playlist.playlistURL;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/10 backdrop-blur-sm border border-white/20 rounded-md px-3 py-2 mb-1 hover:bg-white/20 transition-colors"
    >
      <div className="font-title text-white text-sm leading-tight truncate">
        {playlist.name}
      </div>
      {playlist.description && (
        <div className="text-white/60 text-xs font-roc leading-tight mt-0.5 line-clamp-2">
          {playlist.description}
        </div>
      )}
    </a>
  );
}

function SkeletonStack() {
  return (
    <div className="relative w-full aspect-square">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-md bg-white/10 animate-pulse"
          style={{
            top: i * -4,
            left: i * 2,
            right: i * 2,
            zIndex: i,
          }}
        />
      ))}
    </div>
  );
}

const MIN_PEEK = 20;
const MAX_STACK = 10;

function CrateBin({
  playlist,
  platform,
  dimmed,
  maxCount,
}: {
  playlist: Playlist;
  platform: Platform;
  dimmed: boolean;
  maxCount: number;
}) {
  const [trackArt, setTrackArt] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const touchingRef = useRef(false);

  useEffect(() => {
    if (!playlist.playlistURL) {
      setLoading(false);
      return;
    }
    fetch(
      `/api/spotify/playlist?url=${encodeURIComponent(playlist.playlistURL)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.images) {
          setTrackArt(data.images);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [playlist.playlistURL]);

  // Track art on bottom, playlist cover on top (front)
  const stack = [
    ...trackArt.filter((u) => u !== playlist.coverUrl).slice(0, 12),
    ...(playlist.coverUrl ? [playlist.coverUrl] : []),
  ];

  // Total peek area = (maxCount - 1) * MIN_PEEK — same for every crate
  // Distribute across this crate's actual covers
  const totalPeekArea = (maxCount - 1) * MIN_PEEK;
  const peek =
    stack.length > 1
      ? Math.max(MIN_PEEK, totalPeekArea / (stack.length - 1))
      : MIN_PEEK;

  const hitTestY = useCallback(
    (clientY: number) => {
      const el = stackRef.current;
      if (!el || stack.length === 0) return;
      const rect = el.getBoundingClientRect();
      const y = clientY - rect.top;
      for (let i = 0; i < stack.length; i++) {
        const fromFront = stack.length - 1 - i;
        const topEdge = i * peek;
        const bottomEdge = fromFront === 0 ? rect.height : topEdge + peek;
        if (y >= topEdge && y < bottomEdge) {
          setHoveredIndex(i);
          return;
        }
      }
      setHoveredIndex(null);
    },
    [stack.length, peek],
  );

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const lockedAxis = useRef<"vertical" | "horizontal" | null>(null);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      startPos.current = { x: t.clientX, y: t.clientY };
      lockedAxis.current = null;
      touchingRef.current = false;
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!startPos.current) return;

      if (!lockedAxis.current) {
        const dx = Math.abs(t.clientX - startPos.current.x);
        const dy = Math.abs(t.clientY - startPos.current.y);
        if (dx < 8 && dy < 8) return; // wait for clear intent
        lockedAxis.current = dy > dx ? "vertical" : "horizontal";
        if (lockedAxis.current === "vertical") {
          touchingRef.current = true;
        }
      }

      if (lockedAxis.current === "vertical") {
        e.preventDefault();
        hitTestY(t.clientY);
      }
      // horizontal: do nothing, let snap-scroll handle it
    }
    function onTouchEnd() {
      touchingRef.current = false;
      startPos.current = null;
      lockedAxis.current = null;
      setHoveredIndex(null);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [hitTestY]);

  return (
    <div
      className={`w-[80vw] flex-shrink-0 snap-center md:w-[calc(33.3%-8px)] xl:w-[calc(25%-12px)] transition-opacity h-full md:h-[600px] xl:h-[700px] ${
        dimmed ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      <div className="bg-white/5 rounded-lg p-2 h-full flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {loading ? (
            <SkeletonStack />
          ) : stack.length > 0 ? (
            <div
              ref={stackRef}
              className="absolute inset-0 select-none"
              style={{ WebkitTouchCallout: "none" }}
            >
              {stack.map((src, i) => {
                // i=0 is deepest (back), last is front (playlist cover)
                const fromFront = stack.length - 1 - i;
                const isHovered = hoveredIndex === i;
                return (
                  <div
                    key={src}
                    className="absolute left-0 right-0 aspect-square rounded-md overflow-hidden transition-shadow duration-200 ease-out cursor-pointer"
                    style={{
                      bottom: fromFront * peek,
                      marginLeft: fromFront * 2,
                      marginRight: fromFront * 2,
                      zIndex: isHovered
                        ? stack.length + 1
                        : stack.length - fromFront,
                      boxShadow: isHovered
                        ? "0 8px 20px rgba(0,0,0,0.6)"
                        : "0 2px 6px rgba(0,0,0,0.4)",
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() =>
                      setHoveredIndex((prev) => (prev === i ? null : i))
                    }
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
                );
              })}
            </div>
          ) : (
            <div className="text-white/40 text-xs font-roc text-center py-4">
              No tracks found
            </div>
          )}
        </div>

        <div className="mt-1 flex-shrink-0">
          <DividerCard playlist={playlist} platform={platform} />
        </div>
      </div>
    </div>
  );
}

export default function CrateView({
  playlists,
  platform,
}: {
  playlists: Playlist[];
  platform: Platform;
}) {
  // Lock body scroll on mobile while crate view is mounted
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden h-[calc(100dvh-130px)] -mb-[82px] md:h-auto md:mb-0"
    >
      <div
        className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar mx-3 h-full md:h-auto md:items-start items-end"
        style={{ perspective: "1200px" }}
      >
        {playlists.map((playlist) => (
          <CrateBin
            key={playlist._id}
            playlist={playlist}
            platform={platform}
            dimmed={platform === "apple" && !playlist.appleMusicURL}
            maxCount={MAX_STACK + 1}
          />
        ))}
      </div>

      {/* Shelf edge */}
      <div className="mx-3 h-2 rounded-b-md " />
    </div>
  );
}
