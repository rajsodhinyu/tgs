"use client";

import { useRouter } from "next/navigation";
import { useState, TouchEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface SwipeableAlbumProps {
  imageUrl: string;
  albumName: string;
  spotifyUrl: string;
  prevSlug: string | null;
  nextSlug: string | null;
  prevArtist: string | null;
  nextArtist: string | null;
}

export default function SwipeableAlbum({
  imageUrl,
  albumName,
  spotifyUrl,
  prevSlug,
  nextSlug,
  prevArtist,
  nextArtist,
}: SwipeableAlbumProps) {
  const router = useRouter();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && nextSlug) {
      navigateWithAnimation("left", nextSlug);
    } else if (isRightSwipe && prevSlug) {
      navigateWithAnimation("right", prevSlug);
    }
  };

  const navigateWithAnimation = (direction: "left" | "right", slug: string) => {
    if (swiping) return;
    setSwipeDirection(direction);
    setSwiping(true);
    setTimeout(() => {
      router.push(`/feature/2025/${slug}`);
    }, 200);
  };

  const handlePrevClick = () => {
    if (prevSlug) {
      navigateWithAnimation("right", prevSlug);
    }
  };

  const handleNextClick = () => {
    if (nextSlug) {
      navigateWithAnimation("left", nextSlug);
    }
  };

  return (
    <div className="flex justify-center">
      {/* Previous arrow - hidden on mobile */}
      {prevSlug ? (
        <button
          onClick={handlePrevClick}
          className="mx-2 md:mx-10 self-center justify-items-start font-title text-5xl max-md:hidden hover:opacity-70 transition-opacity"
        >
          &lt;
          <div className="text-sm font-bit hidden text-center">{prevArtist}</div>
        </button>
      ) : (
        <div className="mx-2 md:mx-10 self-center justify-items-start font-title text-5xl invisible max-md:hidden">
          &lt;
        </div>
      )}

      {/* Swipeable album image */}
      <motion.div
        className="rounded-md size-72 md:size-[400px] flex-none touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        animate={
          swiping
            ? {
                x: swipeDirection === "left" ? -100 : 100,
                opacity: 0,
              }
            : { x: 0, opacity: 1 }
        }
        transition={{ duration: 0.2 }}
      >
        <Link href={spotifyUrl}>
          <Image
            className="place-self-center rounded-md border-2 border-transparent hover:border-white"
            src={imageUrl}
            alt={albumName}
            priority={true}
            width={640}
            height={640}
            quality={100}
            sizes="(max-width: 400px) 100vw"
            draggable={false}
          />
        </Link>
      </motion.div>

      {/* Next arrow - hidden on mobile */}
      {nextSlug ? (
        <button
          onClick={handleNextClick}
          className="mx-2 md:mx-10 self-center justify-items-end font-title text-5xl max-md:hidden hover:opacity-70 transition-opacity"
        >
          &gt;
          <div className="text-sm font-bit hidden text-center place-self-end">{nextArtist}</div>
        </button>
      ) : (
        <div className="mx-2 md:mx-10 self-center justify-items-end font-title text-5xl invisible max-md:hidden">
          &gt;
        </div>
      )}
    </div>
  );
}
