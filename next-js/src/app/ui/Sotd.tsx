"use client";
import { useSotData } from "../context/SotDataContext";

function catchClick() {
  let audio = document.getElementById("myAudio") as HTMLAudioElement;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}
export default function Sotd() {
  const sotdata = useSotData();
  return (
    <div className="group" onClick={catchClick}>
      <div className="pt-3 md:pt-0 w-72 xl:w-72 md:ml-4 xl:flex-none rounded-xl inline-flex place-items-center align-center justify-around">
        <img
          src="https://cdn.sanity.io/images/fnvy29id/tgs/d57f341e73494edac6d2ef1a03574243adb21afb-2010x516.png"
          alt=""
        />
      </div>
      <div>
        <div
          className="invisible group-hover:visible absolute z-10 transform md:translate-x-4 text-center w-72 h-20 flex rounded-md font-title
          bg-tgs-dark-purple
          ring ring-white
          text-white"
        >
          <div
            className="w-full mt-2
            min-w-7 truncate
            text-2xl"
          >
            {`"${sotdata.name}"`}
            <div
              className="
              text-xl"
            >
              {`${sotdata.artist}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
