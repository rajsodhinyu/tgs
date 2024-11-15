import Image from "next/image"
import PlaylistCard from "./playlistCards";

export default function Page() {
  return (
  <div className="w-full items-start gap-2.5 md:inline-flex md:flex-nowrap sm:flex-wrap"> 
  {/* Whole Site */}
    <div className="md:w-10/12 lg:w-full"> {/* Right Side, Carousel + */}
      <div className="">
        <div><img src="https://cdn.sanity.io/images/fnvy29id/tgs/a72fd5d0c723e3344aab5aeb213cde41dd4b5d38-1440x1080.jpg" alt="" /></div>
      <div className="grid grid-cols-3 pt-4">
        <PlaylistCard title= 'good sh*t weekly' description='A weekly selection of our favorite tunes. Updated every Monday!' cover="https://cdn.sanity.io/images/fnvy29id/tgs/a5c239fe2ef43958f8169e9e461d61b97754e566-1179x1218.jpg" url="https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39"></PlaylistCard>
        <PlaylistCard title= 'new releases' description='Our picks of new releases. Updated weekly :)' cover="https://cdn.sanity.io/images/fnvy29id/tgs/a0d178e792cf32bc6bbdd2e295c41b6d020841cc-300x296.png" url="https://open.spotify.com/playlist/3pycLAhrd061WuEILO9ZWs"></PlaylistCard>
        <PlaylistCard title= 'small artists, big sounds' description='Our picks from the most innovative, authentic small artists of today! (The ultimate discovery playlist)' cover="https://cdn.sanity.io/images/fnvy29id/tgs/b7c19a042053ce442fbe79d8842dc91985a70d37-300x300.png" url="https://open.spotify.com/playlist/2fcJa0PacijlXcDRiUOH44"></PlaylistCard>
        <PlaylistCard title= 'JEFF-FREE' description='Quincy Davis picks for That Good Sh*t' cover="https://cdn.sanity.io/images/fnvy29id/tgs/589fcd2ca93c0859812109cd798d373cd22e8a84-895x895.jpg" url="https://open.spotify.com/playlist/3vWRR5lV6sVVIO3dsUi8vm"></PlaylistCard>
        <PlaylistCard title= 'Dahmin’s tgs picks' description='from my ears 2 urs <3' cover="https://cdn.sanity.io/images/fnvy29id/tgs/bd31047fcd5f6986e2cc6d5986007fdb4e51d6ec-3024x3024.png" url="https://open.spotify.com/playlist/7ayxABQLeNWJdq3aZrJ6lD"></PlaylistCard>
        <PlaylistCard title= 'Ria’s tgs picks' description='ria x tgs' cover="https://cdn.sanity.io/images/fnvy29id/tgs/6207346f3ceb54735277382e502980e889216ced-2171x2171.png" url="https://open.spotify.com/playlist/7lYECXbWFCVsbNS4bxisQ1"></PlaylistCard>
      </div>
        </div>
    </div>
    <div className="lg:w-2/6 -mr-3 place-items-center">
      <div className="text-center tracking-wide font-bold decoration-indigo-700 text-black text-5xl md:text-3xl xl:text-4xl font-bit leading-10">Latest Stories</div>
      <img className="w-96 m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/f62f2ccc359ee9466eb666880cafe92a3d61766d-1980x1980.png" />
      <img className="w-96 m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/a69917951e63fb28e469139c00a97aa638d315a9-1440x1439.jpg" />
      <img className="w-96 m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/096c2f3910068c5dbea80aaf6703ff688d8ac694-1170x1174.jpg" />
      <img className="w-96 m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-indigo-700" src="https://cdn.sanity.io/images/fnvy29id/tgs/517e85c98f4ae92a1287668e0a9731cbbe032ab7-1440x1440.png" />
      <div className="text-center tracking-wide font-bold hover:underline decoration-indigo-700 text-black text-5xl md:text-3xl xl:text-4xl font-bit leading-10 pb-4"><a href="/blog/archive">All Stories </a></div>
    </div>
  </div>
  )
}
