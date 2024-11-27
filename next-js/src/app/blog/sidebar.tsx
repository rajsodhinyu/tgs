import Link from "next/link";




export default function Sidebar({ items}: { items: number}) {
  return (
    <div>
      <div className="tracking-wide font-bold hover:underline decoration-tgs-purple text-black flex shrink text-3xl lg:text-4xl font-bit leading-10 ml-4 justify-center text-center"><a href="/blog/archive">ALL POSTS</a></div>
      <a href="/blog/post/flog-gnaw-here-we-come"><img className="w-96 lg:w-full m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple rounded-md" src="https://cdn.sanity.io/images/fnvy29id/tgs/f62f2ccc359ee9466eb666880cafe92a3d61766d-1980x1980.png" /></a>
      <a href="/blog/post/artist-of-the-week-laila"><img className="w-96 lg:w-full m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple rounded-md" src="https://cdn.sanity.io/images/fnvy29id/tgs/a69917951e63fb28e469139c00a97aa638d315a9-1440x1439.jpg" /></a>
      <a href="/blog/post/artist-of-the-week-lexa-gates"><img className="w-96 lg:w-full m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple rounded-md" src="https://cdn.sanity.io/images/fnvy29id/tgs/096c2f3910068c5dbea80aaf6703ff688d8ac694-1170x1174.jpg" /></a>
      <a href="https://www.youtube.com/watch?v=C_FdtnQZftk&t=12s"><img className="w-96 lg:w-full m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple rounded-md" src="https://cdn.sanity.io/images/fnvy29id/tgs/517e85c98f4ae92a1287668e0a9731cbbe032ab7-1440x1440.png" /></a>
    </div>
   
  )
}