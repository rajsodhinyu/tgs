"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  imageUrl: string;
  dateLabel: string;
  link: string;
  embedSrc: string | null;
};

export default function EventCard({
  name,
  imageUrl,
  dateLabel,
  link,
  embedSrc,
}: Props) {
  const [open, setOpen] = useState(false);

  // Close on Escape + lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const card = (
    <>
      <div className="text-white">
        <div className="relative w-full aspect-[4/5]">
          <Image
            className="object-contain rounded-md border-white border-0 group-hover:border-4 group-hover:scale-[98%] transition-all"
            src={imageUrl}
            fill={true}
            alt={name}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            quality={100}
          />
        </div>
      </div>
      <p className="text-center text-md sm:text-xl font-bit font-black text-balance pt-1 leading-tight text-white group-hover:underline group-hover:text-white transition-all">
        {name}
      </p>
      <p className="text-gray-300 text-center text-xs sm:text-base font-roc py-2 -m-2 group-hover:text-white transition-all">
        {dateLabel}
      </p>
    </>
  );

  return (
    <div className="group rounded-lg">
      {embedSrc ? (
        <button
          onClick={() => setOpen(true)}
          className="block w-full text-left decoration-tgs-purple"
          aria-label={`Buy tickets for ${name}`}
        >
          {card}
        </button>
      ) : (
        <Link className="decoration-tgs-purple" href={link}>
          {card}
        </Link>
      )}

      {embedSrc && open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Tickets for ${name}`}
        >
          <div
            className="relative flex w-full max-w-4xl h-[85vh] md:h-[640px] overflow-hidden rounded-xl bg-tgs-dark-purple shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white text-lg leading-none hover:bg-black/80 transition-colors"
            >
              ✕
            </button>

            {/* Left pane — flyer (desktop only) */}
            <div className="hidden md:flex md:w-1/2 items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full rounded-md object-contain"
              />
            </div>

            {/* Right pane — checkout embed */}
            <div className="flex flex-1 flex-col bg-white md:w-1/2">
              <div className="md:hidden px-4 pt-4 pb-2">
                <p className="font-bit font-black text-black text-lg leading-tight">
                  {name}
                </p>
                <p className="font-roc text-gray-500 text-sm">{dateLabel}</p>
              </div>
              <iframe
                src={embedSrc}
                title={`Buy tickets for ${name}`}
                className="w-full flex-1 min-h-[500px]"
                allow="payment"
                style={{ border: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
