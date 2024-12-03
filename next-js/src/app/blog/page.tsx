import Image from "next/image"
import PlaylistCard from "./playlistCards";
import Sidebar from "./sidebar";





export default function Page() {
  return (
  <div className="-mt-10 px-3 sm:flex-wrap gap-2.5 md:-mt-20 md:flex-nowrap md:inline-flex md:flex-row md:justify-around w-auto xl:w-screen
  pt-12"> 
  {/* Whole Site */}
    <div className=""> {/* Right Side, Carousel + */} 
      <div className="">
        <a href="blog/post/welcome-to-the-blog">
          <div><img src="https://cdn.sanity.io/images/fnvy29id/tgs/6f55436753924ff94fa5359d65eadc4084ec898f-1440x1080.png" alt="" /></div>
        </a>
      <div className="grid grid-cols-3 pt-4 gap-4">
        <PlaylistCard title= 'GOOD SH*T WEEKLY' description='A weekly selection of our favorite tunes. Updated every Monday!' cover="https://cdn.sanity.io/images/fnvy29id/tgs/0444701d722139f1e6cfb9afc65427cc8a151ff0-2159x2159.jpg" url="https://open.spotify.com/playlist/67OMv1NpyxUTmUetPeTJ39"></PlaylistCard>
        <PlaylistCard title= 'NEW RELEASES' description='Our pack of new releases. Updated weekly :)' cover="https://cdn.sanity.io/images/fnvy29id/tgs/a0d178e792cf32bc6bbdd2e295c41b6d020841cc-300x296.png" url="https://open.spotify.com/playlist/3pycLAhrd061WuEILO9ZWs"></PlaylistCard>
        <PlaylistCard title= 'SMALL ARTISTS BIG SOUNDS' description='Our picks from the most innovative, authentic small artists of today!' cover="https://cdn.sanity.io/images/fnvy29id/tgs/b7c19a042053ce442fbe79d8842dc91985a70d37-300x300.png" url="https://open.spotify.com/playlist/2fcJa0PacijlXcDRiUOH44"></PlaylistCard>
        <PlaylistCard title= 'SEX FREE' description='Quincy Davis picks for That Good Sh*t' cover="https://cdn.sanity.io/images/fnvy29id/tgs/589fcd2ca93c0859812109cd798d373cd22e8a84-895x895.jpg" url="https://open.spotify.com/playlist/3vWRR5lV6sVVIO3dsUi8vm"></PlaylistCard>
        <PlaylistCard title= 'DAHMIN’s TGS PICKS' description='from my ears 2 urs <3' cover="https://cdn.sanity.io/images/fnvy29id/tgs/bd31047fcd5f6986e2cc6d5986007fdb4e51d6ec-3024x3024.png" url="https://open.spotify.com/playlist/7ayxABQLeNWJdq3aZrJ6lD"></PlaylistCard>
        <PlaylistCard title= 'RIA’S TGS PICKS' description='ria x tgs' cover="https://cdn.sanity.io/images/fnvy29id/tgs/6207346f3ceb54735277382e502980e889216ced-2171x2171.png" url="https://open.spotify.com/playlist/7lYECXbWFCVsbNS4bxisQ1"></PlaylistCard>
      </div>
        </div>
    </div>
    <div className="sm:w-[90vw] md:w-9/12 lg:w-8/12 xl:w-3/12 flex-col place-items-center justify-end rounded-xl"> {/* Left Side */}
    <Sidebar items={3}></Sidebar>
    </div>
  </div>
  )
}
