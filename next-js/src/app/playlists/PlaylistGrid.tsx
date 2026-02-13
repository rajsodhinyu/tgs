"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PlatformSwitcher, { usePlatform } from "../components/PlatformSwitcher";
import ChevronDots from "../components/ChevronDots";

type Playlist = {
  _id: string;
  name: string;
  description: string;
  playlistURL: string;
  appleMusicURL?: string;
  coverUrl: string;
};

type ViewMode = "grid" | "list";

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1"
        fill={active ? "black" : "white"}
      />
      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1"
        fill={active ? "black" : "white"}
      />
      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1"
        fill={active ? "black" : "white"}
      />
      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1"
        fill={active ? "black" : "white"}
      />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  const c = active ? "black" : "white";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="3" rx="1" fill={c} />
      <rect x="1" y="6.5" width="14" height="3" rx="1" fill={c} />
      <rect x="1" y="12" width="14" height="3" rx="1" fill={c} />
    </svg>
  );
}

export default function PlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  const [platform, setPlatform] = usePlatform();
  const [view, setView] = useState<ViewMode>("grid");

  function resolveUrl(playlist: Playlist) {
    return platform === "apple" && playlist.appleMusicURL
      ? playlist.appleMusicURL
      : playlist.playlistURL;
  }

  return (
    <>
      <div className="grid grid-cols-3 items-center mx-3 sm:mx-6 mb-6">
        <div className="flex items-center justify-start">
          <div className="flex bg-white/10 rounded-full">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-full transition-colors ${
                view === "grid" ? "bg-white" : "hover:bg-white/20"
              }`}
            >
              <GridIcon active={view === "grid"} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-full transition-colors ${
                view === "list" ? "bg-white" : "hover:bg-white/20"
              }`}
            >
              <ListIcon active={view === "list"} />
            </button>
          </div>
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold font-title text-white uppercase text-center">
          Playlists
        </h1>
        <div className="flex items-center justify-end scale-[0.8] origin-right">
          <PlatformSwitcher platform={platform} setPlatform={setPlatform} />
        </div>
      </div>

      <div
        className={
          view === "grid"
            ? "grid md:grid-cols-4 grid-cols-2 gap-4 mx-3"
            : "flex flex-col mx-3"
        }
      >
        <AnimatePresence mode="popLayout">
          {playlists.map((playlist, i) => (
            <motion.div
              key={`${playlist._id}-${view}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: platform === "apple" && !playlist.appleMusicURL ? 0.3 : 1,
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              className={`${
                view === "grid" ? "group flex flex-col text-center" : "group"
              } ${platform === "apple" && !playlist.appleMusicURL ? "pointer-events-none" : ""}`}
            >

              <Link
                href={resolveUrl(playlist)}
                className={
                  view === "list"
                    ? "flex items-center gap-5 rounded-lg p-3"
                    : ""
                }
              >
                <Image
                  className={
                    view === "grid"
                      ? "rounded-lg border-white border-0 group-hover:border-4 group-hover:scale-[98%]"
                      : "rounded-lg w-28 h-28 md:w-36 md:h-36 object-cover shrink-0 border-white border-0 group-hover:border-4"
                  }
                  src={playlist.coverUrl}
                  width={view === "grid" ? 400 : 144}
                  height={view === "grid" ? 400 : 144}
                  alt={`${playlist.name} Cover`}
                  sizes={
                    view === "grid" ? "(max-width: 768px) 50vw, 25vw" : "144px"
                  }
                  quality={100}
                />
                {view === "grid" ? (
                  <>
                    <div className="pt-3 text-white text-lg font-bold font-bit group-hover:font-title leading-5 lg:text-2xl">
                      {playlist.name}
                    </div>
                    <div className="w-11/12 place-self-center text-white/80 text-xs lg:text-base font-semibold font-roc leading-none pt-1">
                      {playlist.description}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="text-white text-xl md:text-2xl font-bold font-bit group-hover:font-title leading-6 group-hover:underline decoration-white">
                      {playlist.name}
                    </div>
                    <div className="text-white/80 text-sm md:text-base font-semibold font-roc leading-tight pt-2">
                      {playlist.description}
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
