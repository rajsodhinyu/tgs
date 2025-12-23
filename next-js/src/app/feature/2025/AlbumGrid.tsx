"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import imageUrlBuilder from "@sanity/image-url";

const projectId = "fnvy29id";
const dataset = "tgs";

const urlFor = (source: any) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

function linkResolver(slug: any) {
  if (slug?.current == undefined) {
    return "/feature/2025";
  }
  return `/feature/2025/${slug.current}`;
}

type SortType = "date" | "title" | "random";

interface Album {
  _id: string;
  name: string;
  artist: string;
  thumb: any;
  datetime: string;
  slug: any;
}

interface AlbumGridProps {
  albums: Album[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  const [sortType, setSortType] = useState<SortType>("random");
  const [randomSeed, setRandomSeed] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  const sortedAlbums = useMemo(() => {
    const albumsCopy = [...albums];

    switch (sortType) {
      case "date":
        return albumsCopy.sort(
          (a, b) =>
            new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        );
      case "title":
        return albumsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case "random":
        // Fisher-Yates shuffle with seed for consistent random order until reshuffled
        for (let i = albumsCopy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [albumsCopy[i], albumsCopy[j]] = [albumsCopy[j], albumsCopy[i]];
        }
        return albumsCopy;
      default:
        return albumsCopy;
    }
  }, [albums, sortType, randomSeed]);

  const handleSortChange = (type: SortType) => {
    if (type === "random") {
      setShowDialog(true);
      return;
    }
    setSortType(type);
  };

  const handleRandomConfirm = () => {
    setRandomSeed((prev) => prev + 1);
    setSortType("random");
    setShowDialog(false);
  };

  return (
    <>
      {/* Dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setShowDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black border-2 border-white rounded-lg p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl md:text-3xl font-title text-white mb-6">
                Let God Sort Em Out?
              </h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDialog(false)}
                  className="px-6 py-2 font-bit text-lg bg-transparent text-white border border-white rounded-md hover:bg-white/20 transition-all"
                >
                  No
                </button>
                <button
                  onClick={handleRandomConfirm}
                  className="px-6 py-2 font-bit text-lg bg-white text-black rounded-md hover:bg-gray-200 transition-all"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center gap-4 mx-3 mb-6">
        <button
          onClick={() => handleSortChange("random")}
          className={`px-4 py-2 font-bit text-sm md:text-base rounded-md transition-all ${
            sortType === "random"
              ? "bg-white text-black"
              : "bg-transparent text-white border border-white hover:bg-white/20"
          }`}
        >
          Random
        </button>

        <button
          onClick={() => handleSortChange("title")}
          className={`px-4 py-2 font-bit text-sm md:text-base rounded-md transition-all ${
            sortType === "title"
              ? "bg-white text-black"
              : "bg-transparent text-white border border-white hover:bg-white/20"
          }`}
        >
          Title
        </button>
        <button
          onClick={() => handleSortChange("date")}
          className={`px-4 py-2 font-bit text-sm md:text-base rounded-md transition-all ${
            sortType === "date"
              ? "bg-white text-black"
              : "bg-transparent text-white border border-white hover:bg-white/20"
          }`}
        >
          Date
        </button>
      </div>
      <div className="grid md:grid-cols-5 mx-3 gap-2 grid-cols-2">
        <AnimatePresence mode="popLayout">
          {sortedAlbums.map((blog) => (
            <motion.div
              key={blog._id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 30 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
              className="group flex flex-col text-center justify-around"
            >
              <div className="text-white flex flex-col">
                <div className="relative">
                  <Link
                    className="hover:underline decoration-tgs-purple"
                    href={linkResolver(blog.slug)}
                  >
                    <Image
                      className="object-contain rounded-md border-tgs-purple border-0 hover:border-4 hover:scale-[98%]"
                      src={`${eventImage(blog)}?h=300&w=300&fit=crop&crop=center`}
                      width={300}
                      height={300}
                      alt={`${blog.name} Cover`}
                      sizes="(max-width: 400px) 100vw"
                      quality={100}
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
