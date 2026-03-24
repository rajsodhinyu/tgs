"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlatform } from "../components/PlatformSwitcher";

interface PlaylistEmbedProps {
  name?: string;
  description?: string;
  coverUrl?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  hasSidebar?: boolean;
}

const STACK_OFFSET_SM = 24;
const STACK_OFFSET_LG = 32;
const THUMB_SM = 80;
const THUMB_LG = 120;

export default function PlaylistEmbedBlock({
  name,
  description,
  coverUrl,
  spotifyUrl,
  appleMusicUrl,
  hasSidebar = false,
}: PlaylistEmbedProps) {
  const [platform] = usePlatform();
  const [trackArt, setTrackArt] = useState<string[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rawHoverRef = useRef<number | null>(null);

  const debouncedSetHover = useCallback((idx: number | null) => {
    rawHoverRef.current = idx;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (idx === null) {
      // Leaving — clear immediately
      setHoveredIdx(null);
    } else {
      // Entering — small debounce to skip intermediate covers
      hoverTimerRef.current = setTimeout(() => {
        if (rawHoverRef.current === idx) setHoveredIdx(idx);
      }, 0);
    }
  }, []);
  const [maxVisible, setMaxVisible] = useState(3);
  const [offsetSm, setOffsetSm] = useState(STACK_OFFSET_SM);
  const [offsetLg, setOffsetLg] = useState(STACK_OFFSET_LG);
  const containerRef = useRef<HTMLAnchorElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const touchingRef = useRef(false);
  const artCountRef = useRef(0);
  const prevMaxRef = useRef(maxVisible);
  const [animatedIn, setAnimatedIn] = useState<Set<number>>(new Set());
  const [animatingOut, setAnimatingOut] = useState<Set<number>>(new Set());
  const [renderMax, setRenderMax] = useState(maxVisible);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Use viewport width minus sidebar (320px on md+) and padding to
    // proactively shrink before the sidebar gets pushed
    const vw = window.innerWidth;
    const isMd = vw >= 768;
    const sidebarWidth = hasSidebar && isMd ? 320 : 0;
    const padding = 36; // container padding + outer margins
    const w = Math.min(el.clientWidth, vw - sidebarWidth - padding) - 24;
    const isSm = vw < 640;
    const thumb = isSm ? THUMB_SM : THUMB_LG;
    const minOffset = isSm ? STACK_OFFSET_SM : STACK_OFFSET_LG;
    const max = Math.max(1, Math.floor((w - thumb) / minOffset) + 1);
    setMaxVisible(max);

    // If fewer covers than max, widen the offset to fill the space
    const count = artCountRef.current;
    if (count > 1 && count < max) {
      const dynamicOffset = Math.floor((w - thumb) / (count - 1));
      const cappedSm = Math.min(dynamicOffset, THUMB_SM);
      const cappedLg = Math.min(dynamicOffset, THUMB_LG);
      setOffsetSm(isSm ? Math.max(STACK_OFFSET_SM, cappedSm) : STACK_OFFSET_SM);
      setOffsetLg(isSm ? STACK_OFFSET_LG : Math.max(STACK_OFFSET_LG, cappedLg));
    } else {
      setOffsetSm(STACK_OFFSET_SM);
      setOffsetLg(STACK_OFFSET_LG);
    }
  }, [hasSidebar]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const prev = prevMaxRef.current;
    prevMaxRef.current = maxVisible;

    if (maxVisible > prev) {
      // Fold in new covers
      setRenderMax(maxVisible);
      const newSet = new Set<number>();
      for (let i = prev; i < maxVisible; i++) newSet.add(i);
      setAnimatedIn(newSet);
      const t = setTimeout(() => setAnimatedIn(new Set()), 300);
      return () => clearTimeout(t);
    } else if (maxVisible < prev) {
      // Keep outgoing covers rendered while they animate out
      setRenderMax(prev);
      const outSet = new Set<number>();
      for (let i = maxVisible; i < prev; i++) outSet.add(i);
      setAnimatingOut(outSet);
      const t = setTimeout(() => {
        setAnimatingOut(new Set());
        setRenderMax(maxVisible);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [maxVisible]);

  useEffect(() => {
    if (!spotifyUrl) return;
    fetch(`/api/spotify/playlist?url=${encodeURIComponent(spotifyUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.images) {
          setTrackArt(data.images);
          // Re-measure after art loads to adjust offset
          requestAnimationFrame(measure);
        }
      })
      .catch(() => {});
  }, [spotifyUrl]);

  const href =
    platform === "apple" && appleMusicUrl
      ? appleMusicUrl
      : spotifyUrl || appleMusicUrl;

  const allArt = coverUrl
    ? [coverUrl, ...trackArt.filter((u) => u !== coverUrl)]
    : trackArt;
  artCountRef.current = allArt.length;
  const visible = allArt.slice(0, renderMax);
  const extraCount = allArt.length - maxVisible; // badge based on actual max, not render max
  const hasArt = visible.length > 0;

  const hitTest = useCallback(
    (clientX: number) => {
      if (!stackRef.current) return;
      const rect = stackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const isSm = window.innerWidth < 640;
      const offset = isSm ? offsetSm : offsetLg;
      const thumb = isSm ? THUMB_SM : THUMB_LG;
      const count = Math.min(allArt.length, maxVisible);
      for (let i = count - 1; i >= 0; i--) {
        const left = i * offset;
        if (x >= left && x <= left + thumb) {
          setHoveredIdx(i);
          return;
        }
      }
      setHoveredIdx(null);
    },
    [allArt.length, maxVisible, offsetSm, offsetLg],
  );

  useEffect(() => {
    const el = stackRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      touchingRef.current = true;
      hitTest(e.touches[0].clientX);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      hitTest(e.touches[0].clientX);
    }
    function onTouchEnd() {
      touchingRef.current = false;
      setHoveredIdx(null);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [hitTest]);

  const stackedWidthSm = hasArt
    ? THUMB_SM + (visible.length - 1) * offsetSm
    : 0;
  const stackedWidthLg = hasArt
    ? THUMB_LG + (visible.length - 1) * offsetLg
    : 0;

  return (
    <div
      className="clear-both pb-2 w-full min-w-0 overflow-hidden select-none"
      style={{ WebkitTouchCallout: "none" }}
    >
      <a
        ref={containerRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex flex-col gap-3 rounded-md transition-all px-3 sm:px-5 py-3 group overflow-hidden mt-2 select-none"
        style={{ textIndent: 0, WebkitTouchCallout: "none" }}
        onClick={(e) => {
          if (touchingRef.current) e.preventDefault();
        }}
      >
        {coverUrl && (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover scale-110 blur-2xl opacity-100 pointer-events-none"
            unoptimized
            draggable={false}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {hasArt ? (
          <div
            ref={stackRef}
            className="relative z-10 flex-shrink-0 max-w-full w-[--w-sm] h-[80px] sm:w-[--w-lg] sm:h-[120px]"
            style={
              {
                "--w-sm": `${stackedWidthSm}px`,
                "--w-lg": `${stackedWidthLg}px`,
              } as React.CSSProperties
            }
            onMouseMove={(e) => hitTest(e.clientX)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {visible.map((src, i) => {
              // Playlist cover (i===0) on top by default; hovered cover pops above all
              const isHovered = hoveredIdx === i;
              const isNew = animatedIn.has(i);
              const isOut = animatingOut.has(i);
              const zBase = visible.length - i;
              const z = isOut
                ? visible.length + 2
                : isHovered
                  ? visible.length + 1
                  : zBase;

              let transitionClass = "transition-all duration-300 ease-in-out";
              if (isNew) transitionClass = "transition-none";
              else if (isOut)
                transitionClass = "transition-all duration-150 ease-in";

              return (
                <div
                  key={src}
                  className={`absolute top-0 rounded-md overflow-hidden w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] left-[--left-sm] sm:left-[--left-lg] ${transitionClass} pointer-events-none shadow-[4px_4px_8px_rgba(0,0,0,0.5)]`}
                  ref={(node) => {
                    if (isNew && node) {
                      node.style.transform = "rotateY(90deg) scale(0.8)";
                      node.style.opacity = "0";
                      requestAnimationFrame(() => {
                        node.style.transition = "all 300ms ease-out";
                        node.style.transform = isHovered
                          ? "scale(1.08)"
                          : "scale(1)";
                        node.style.opacity = "1";
                      });
                    }
                  }}
                  style={
                    {
                      "--left-sm": `${i * offsetSm}px`,
                      "--left-lg": `${i * offsetLg}px`,
                      zIndex: z,
                      transform: isOut
                        ? "rotateY(90deg) scale(0.8)"
                        : isNew
                          ? "rotateY(90deg) scale(0.8)"
                          : isHovered
                            ? "scale(1.08)"
                            : "scale(1)",
                      opacity: isOut ? 0 : isNew ? 0 : 1,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    width={120}
                    height={120}
                    className="object-cover w-full h-full"
                    unoptimized
                    draggable={false}
                  />
                </div>
              );
            })}
            {extraCount > 0 && (
              <span
                className="absolute top-1/2 -translate-y-1/2 text-white/60 text-xs font-roc left-[--badge-sm] sm:left-[--badge-lg]"
                style={
                  {
                    "--badge-sm": `${visible.length * offsetSm + 4}px`,
                    "--badge-lg": `${visible.length * offsetLg + 4}px`,
                  } as React.CSSProperties
                }
              >
                +{extraCount}
              </span>
            )}
          </div>
        ) : (
          coverUrl && (
            <Image
              src={coverUrl}
              alt={name || "Playlist cover"}
              width={120}
              height={120}
              className="relative z-10 rounded-md w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] object-cover flex-shrink-0"
              unoptimized
              draggable={false}
            />
          )
        )}

        {/* Title + description */}
        <div className="relative z-10 min-w-0">
          <div className="font-title text-white text-lg sm:text-3xl leading-tight truncate">
            {name}
          </div>
          {description && (
            <div className="text-white/70 text-base sm:text-md mt-1 line-clamp-2 font-roc">
              {description}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
