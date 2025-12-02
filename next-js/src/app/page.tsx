"use client";
import dynamic from "next/dynamic";
import * as React from "react";
import { useSotData } from "./context/SotDataContext";
import Link from "next/link";

const DynamicComponentWithNoSSR = dynamic(() => import("./ui/Backround"), {
  ssr: false,
  loading: () => (
    <p className="font-title text-xl absolute top-1/4 left-1/2 transform -translate-x-1/2 +translate-y-3/4 text-tgs-dark-purple">
      Loading That Good Sh*t...
    </p>
  ),
});

let sotdata = { artist: "artist", name: "name" };

const Clear = dynamic(() => import("./ui/Clear"), {
  ssr: false,
  loading: () => <p>clearing...</p>,
});

function catchClick() {
  let audio = document.getElementById("myAudio") as HTMLAudioElement;
  if (audio.paused) {
    document.getElementById("disc")!.className = "cd-disc-going animate-spin";
    audio.play();
  } else {
    document.getElementById("disc")!.className = "cd-disc";
    audio.pause();
  }
}

export default function Page() {
  const sotdata = useSotData();
  const todayDate = new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    month: "long",
    day: "numeric",
  });
  return (
    <div>
      <div>
        {/* Graphic */}
        <DynamicComponentWithNoSSR />
      </div>

      <Link className="" href={"/"} scroll={false}>
        <div className="absolute left-0 top-0">
          <img
            className="h-10 md:h-16 md:m-10 m-2 "
            src="https://cdn.sanity.io/images/fnvy29id/tgs/6e0d6fefaf95cf0e570f958d10c13cf66265735a-1266x750.png?h=200"
            alt=""
          />
        </div>
      </Link>
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
      <Link className="" href={"https://www.patreon.com/thatgoodshit"} scroll={false}>
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
      {/* Disc */}
      <div onClick={catchClick}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-60 md:size-96">
          <img
            id="disc"
            className=""
            src="https://cdn.sanity.io/images/fnvy29id/tgs/15c6bd4e378be982f1db27707caf618c07fd5a39-2048x2048.png?h=1000"
            alt=""
          />
        </div>
      </div>
      {/* Song Title and Artist */}
      <div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2  translate-y-44 md:translate-y-52 lg:translate-y-64  text-center  rounded-md font-title flex max-w-72 md:max-w-96 lg:max-w-fit

          bg-tgs-dark-purple
          ring ring-white
          text-white"
        >
          <div
            className="py-2 px-7 md:py-3 md:px-9
            min-w-0 truncate
            md:text-4xl text-xl"
          >
            <div
              className="
              md:text-xl text-sm"
            >
              {`${todayDate}`}
            </div>
            {`"${sotdata.name}"`}
            <div
              className="
              md:text-3xl text-lg"
            >
              {`${sotdata.artist}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
