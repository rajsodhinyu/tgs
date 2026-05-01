"use client";
import dynamic from "next/dynamic";
import * as React from "react";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSotData } from "./context/SotDataContext";
import Link from "next/link";

const DynamicComponentWithNoSSR = dynamic(
  () => import("./ui/ShinyNotesBackground"),
  {
    ssr: false,
    loading: () => (
      <p className="font-title text-xl absolute top-1/4 left-1/2 transform -translate-x-1/2 +translate-y-3/4 text-tgs-dark-purple">
        Loading That Good Sh*t...
      </p>
    ),
  },
);

const DiagnosticOverlay = dynamic(() => import("./ui/DiagnosticOverlay"), {
  ssr: false,
});

let pendingPlay: Promise<void> | null = null;
async function catchClick() {
  const audio = document.getElementById("myAudio") as HTMLAudioElement & {
    __tgsAudioTap?: { ctx: AudioContext };
  };
  // If the waveform sketch has tapped the element, its AudioContext starts
  // suspended and audio will be silent until resumed. Resume synchronously
  // inside the user gesture before calling play().
  const ctx = audio.__tgsAudioTap?.ctx;
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  if (audio.paused) {
    try {
      pendingPlay = audio.play();
      await pendingPlay;
    } catch {
      // Pending play() was interrupted by a pause — expected.
    } finally {
      pendingPlay = null;
    }
  } else {
    if (pendingPlay) await pendingPlay.catch(() => {});
    audio.pause();
  }
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}

function PageInner() {
  const sotdata = useSotData();
  const discRef = useRef<HTMLImageElement>(null);
  const searchParams = useSearchParams();
  const isCapture = searchParams.get("capture") === "1";
  const hideTitleCard = searchParams.get("clean") === "1";
  const showLogo = searchParams.get("logo") === "1";
  const hideDisc = searchParams.get("disc") === "0";

  useEffect(() => {
    const audio = document.getElementById("myAudio") as HTMLAudioElement;
    if (!audio) return;

    const syncDisc = () => {
      if (!discRef.current) return;
      const actuallyPlaying =
        !audio.paused && audio.readyState >= 3 && !audio.seeking;
      discRef.current.className = actuallyPlaying
        ? "cd-disc-going animate-spin"
        : "cd-disc";
    };

    syncDisc();
    const events = [
      "playing",
      "waiting",
      "pause",
      "ended",
      "stalled",
      "seeking",
      "seeked",
    ];
    events.forEach((ev) => audio.addEventListener(ev, syncDisc));
    return () => {
      events.forEach((ev) => audio.removeEventListener(ev, syncDisc));
    };
  }, []);

  useEffect(() => {
    if (!isCapture) return;
    const audio = document.getElementById("myAudio") as HTMLAudioElement | null;
    audio?.play().catch(() => {});
  }, [isCapture]);

  const todayDate = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
  });
  return (
    <div>
      {/*{process.env.NODE_ENV === "development" && <DiagnosticOverlay />}*/}
      <div>
        {/* Graphic */}
        <DynamicComponentWithNoSSR />
      </div>

      {(!isCapture || showLogo) && (
        <Link className="" href={"/"} scroll={false}>
          <div className="absolute left-0 top-0">
            <img
              className={isCapture ? "h-32 m-12" : "h-10 md:h-16 md:m-10 m-2 "}
              src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
              alt=""
            />
          </div>
        </Link>
      )}
      {!isCapture && (
        <>
          {/* Blog */}
          <Link className="" href={"/blog"} scroll={false}>
            <div className="absolute top-0 right-0">
              <img
                className="h-10 md:h-16 md:m-10 m-2"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/9a5244d1c770d1e667006b7f54f5738745847917-1533x846.png?h=200"
                alt=""
              />
            </div>
          </Link>
          {/* Events */}
          <Link
            className=""
            href={"https://www.patreon.com/thatgoodshit"}
            scroll={false}
          >
            <div className="absolute bottom-0 left-0">
              <img
                className="h-10 md:h-16 md:m-10 m-2"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/aaadb16ce9553cad7741d97aa957f4f9d1a9e830-4809x1503.png?h=200"
                alt=""
              />
            </div>
          </Link>
          {/* Shop */}
          <Link className="" href={"/shop"} scroll={false}>
            <div className="absolute bottom-0 right-0">
              <img
                className="h-10 md:h-16 md:m-10 m-2"
                src="https://cdn.sanity.io/images/fnvy29id/tgs/7162c809beb7a870dfbb0127b72fc6359218b456-1874x954.png?h=200"
                alt=""
              />
            </div>
          </Link>
        </>
      )}
      {/* Disc */}
      {!hideDisc && (
        <div onClick={catchClick} data-disc>
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isCapture ? "size-[640px]" : "size-60 md:size-96"}`}
          >
            <img
              ref={discRef}
              className="cd-disc"
              src="https://cdn.sanity.io/images/fnvy29id/tgs/15c6bd4e378be982f1db27707caf618c07fd5a39-2048x2048.png?h=1000"
              alt=""
            />
          </div>
        </div>
      )}
      {/* Song Title and Artist */}
      {!hideTitleCard && (
        <div>
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 ${isCapture ? "translate-y-[500px] max-w-fit" : "translate-y-44 md:translate-y-52 lg:translate-y-64 max-w-72 md:max-w-96 lg:max-w-fit"} text-center rounded-md font-title flex bg-tgs-background ring ring-white text-white`}
          >
            <div
              className={`min-w-0 truncate ${isCapture ? "py-5 px-12 text-6xl" : "py-2 px-7 md:py-3 md:px-9 md:text-4xl text-xl"}`}
            >
              <div className={isCapture ? "text-3xl" : "md:text-xl text-sm"}>
                {`${todayDate}`}
              </div>
              {sotdata.name}
              <div className={isCapture ? "text-5xl" : "md:text-3xl text-lg"}>
                {`${sotdata.artist}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
