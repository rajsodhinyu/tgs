import Image from "next/image"
import Card from "./blogCard";

export default function Page() {
  return (
  <div className="w-full items-start gap-2.5 inline-flex"> 
  {/* Whole Site */}
    <div className="grow"> {/* Right Side, Carousel + */}
      <div className="basis-full place-items-center gap-2.5">
        <div><img src="https://cdn.sanity.io/images/fnvy29id/tgs/a72fd5d0c723e3344aab5aeb213cde41dd4b5d38-1440x1080.jpg" alt="" /></div>
      </div>
    </div>
    <div className="-mt-4">
      <div className="text-center tracking-wide  font-bold hover:underline decoration-indigo-700 text-[#212121] text-4xl font-bit leading-10"><a href="/blog/archive">Latest Stories</a></div>
      <img className="w-96 m-1 hover:scale-95 border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/a69917951e63fb28e469139c00a97aa638d315a9-1440x1439.jpg" />
      <img className="w-96 m-1 hover:scale-95 border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/296b48575ba1d7b059ebbfb1a7e6c800f8f19692-720x720.png" />
      <img className="w-96 m-1 hover:scale-95 border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/a69917951e63fb28e469139c00a97aa638d315a9-1440x1439.jpg" />
      <img className="w-96 m-1 hover:scale-95 border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/296b48575ba1d7b059ebbfb1a7e6c800f8f19692-720x720.png" />

    </div>
    
  </div>
  )
}


