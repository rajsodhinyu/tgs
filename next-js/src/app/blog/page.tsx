import Image from "next/image"
import PlaylistCard from "./playlistCards";
import Sidebar from "./sidebar";
import { sanityFetch } from "../client";
import { SanityDocument } from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";



const projectId = 'fnvy29id';
const dataset = 'tgs'


const PLAYLIST_Q = `
*[_type == "playlist"]| order(order) {_id, order, thumb, name, description, playlistURL}`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null; 


    function eventImage(event:any) {
      let pull = event.thumb.asset._ref;
      let thing = pull ? urlFor(pull)?.url(): null;
      return (thing)
    }



export default async function Page() {
  const blogs = await sanityFetch<SanityDocument[]>({query: PLAYLIST_Q});
  return (
    <div className="place-items-center max-md:mt-16">
    <Link href={'/feature/2024'}> {/*  */}
      <div><Image className="rounded-md" priority={true} src="https://cdn.sanity.io/images/fnvy29id/tgs/b4d65f8eb2ea79b4e10f7e48993f3a5b97875dc0-1440x1080.png" /* https://cdn.sanity.io/images/fnvy29id/tgs/b4d65f8eb2ea79b4e10f7e48993f3a5b97875dc0-1440x1080.png */alt="" width={1440} height={1080} /></div>
    </Link>
    <div className="text-4xl md:text-4xl font-bold hover:underline hover:text-tgs-purple decoration-tgs-purple text-black flex shrink mt-2  font-bit leading-10 text-balance w-full justify-center">
        <Link href="https://open.spotify.com/user/annabelle816">OUR PLAYLISTS &gt;</Link>
        </div>
  <div className="grid lg:grid-cols-3 grid-cols-2 pt-4 gap-4">
  {blogs.map((playlist) => (<PlaylistCard key={playlist.name} title={playlist.name} description={playlist.description} 
  cover = {`${eventImage(playlist)}?h=700&w=700&fit=crop&crop=center`}
  url={playlist.playlistURL}></PlaylistCard>))}
    </div>
    </div>
  )
}
