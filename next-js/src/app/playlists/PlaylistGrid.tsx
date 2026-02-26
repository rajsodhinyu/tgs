"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PlatformSwitcher, { usePlatform } from "../components/PlatformSwitcher";
import ChevronDots from "../components/ChevronDots";
import PlaylistEmbedBlock from "../blog/PlaylistEmbedBlock";
import CrateView from "./CrateView";

type Playlist = {
  _id: string;
  name: string;
  description: string;
  playlistURL: string;
  appleMusicURL?: string;
  coverUrl: string;
};

type ViewMode = "grid" | "list" | "crate";

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

function CrateIcon({ active }: { active: boolean }) {
  const c = active ? "black" : "white";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* Back records peeking out */}
      <rect x="3" y="1" width="10" height="2" rx="0.5" fill={c} opacity={0.4} />
      <rect x="2" y="4" width="12" height="2" rx="0.5" fill={c} opacity={0.6} />
      {/* Front cover */}
      <rect x="1" y="7" width="14" height="8" rx="1" fill={c} />
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
  const [view, setView] = useState<ViewMode>("crate");

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
              onClick={() => setView("crate")}
              className={`p-2 rounded-full transition-colors ${
                view === "crate" ? "bg-white" : "hover:bg-white/20"
              }`}
            >
              <CrateIcon active={view === "crate"} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-full transition-colors ${
                view === "list" ? "bg-white" : "hover:bg-white/20"
              }`}
            >
              <ListIcon active={view === "list"} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-full transition-colors ${
                view === "grid" ? "bg-white" : "hover:bg-white/20"
              }`}
            >
              <GridIcon active={view === "grid"} />
            </button>
          </div>
        </div>
        <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold font-title text-white uppercase flex items-center justify-center">
          Playlists
        </h1>
        <div className="flex items-center justify-end scale-[0.65] mr-1 origin-right">
          <PlatformSwitcher platform={platform} setPlatform={setPlatform} />
        </div>
      </div>

      {view === "crate" ? (
        <CrateView playlists={playlists} platform={platform} />
      ) : (
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
                  opacity:
                    platform === "apple" && !playlist.appleMusicURL ? 0.3 : 1,
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
                {view === "grid" ? (
                  <Link href={resolveUrl(playlist)}>
                    <Image
                      className="rounded-lg border-white border-0 group-hover:border-4 group-hover:scale-[98%] transition-all"
                      src={playlist.coverUrl}
                      width={400}
                      height={400}
                      alt={`${playlist.name} Cover`}
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={100}
                    />
                    <div className="pt-3 text-white text-lg font-bold font-bit group-hover:font-title leading-5 lg:text-2xl">
                      {playlist.name}
                    </div>
                    <div className="w-11/12 place-self-center text-white/80 text-xs lg:text-base font-semibold font-roc leading-none pt-1">
                      {playlist.description}
                    </div>
                  </Link>
                ) : (
                  <PlaylistEmbedBlock
                    name={playlist.name}
                    description={playlist.description}
                    coverUrl={playlist.coverUrl}
                    spotifyUrl={playlist.playlistURL}
                    appleMusicUrl={playlist.appleMusicURL}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
