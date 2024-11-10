import Image from "next/image"
import Card from "./blogCard";

export default function Page() {
  return (
  <div className="bg-white justify-between items-start inline-flex"> {/* Whole Site */}
    <div className="grow shrink basis-0 self-stretch flex-col justify-start items-center gap-2.5 inline-flex"> {/* Right Side, Carousel + */}
      <div className="basis-0 py-96 justify-center items-center gap-2.5 inline-flex">
        <div><img src="https://via.placeholder.com/1920x1080" alt="" /></div>
      </div>
    </div>
    <div className=" ">
      <div className="text-center text-[#212121] text-3xl font-bit leading-10 tracking-widest">Latest Stories</div>
      <img className="w-80 h-96 p-2.5 shadow border border-[#6f5bc4]" src="https://via.placeholder.com/335x369" />
      <img className="w-80 h-96 p-2.5 shadow border border-[#6f5bc4]" src="https://via.placeholder.com/335x369" />
      <div className="w-80 h-96 p-2.5 bg-[#65b9e7] shadow border border-[#6f5bc4]"></div>
      <img className="w-80 h-96 p-2.5 shadow border border-[#6f5bc4]" src="https://via.placeholder.com/335x369" />
      <img className="w-80 h-96 p-2.5 shadow border border-[#6f5bc4]" src="https://via.placeholder.com/335x369" />
      <div className="w-80 h-96 p-2.5 bg-[#65b9e7] shadow border border-[#6f5bc4]"></div>
    </div>
  </div>
  )
}


