import Image from "next/image"
import PlaylistCard from "./playlistCards";
import Sidebar from "./sidebar";
import { sanityFetch } from "../client";
import { SanityDocument } from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";


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
    <div className="place-items-center max-md:mt-12">
    <a href="blog/post/welcome-to-the-blog">
      <div><img className="rounded-md "src="https://cdn.sanity.io/images/fnvy29id/tgs/6f55436753924ff94fa5359d65eadc4084ec898f-1440x1080.png" alt="" /></div>
    </a>
  <div className="grid xl:grid-cols-3 grid-cols-2 pt-4 gap-4">
  {blogs.map((playlist) => (<PlaylistCard title={playlist.name} description={playlist.description} 
  cover = {`${eventImage(playlist)}?h=700&w=700&fit=crop&crop=center`}
  url={playlist.playlistURL}></PlaylistCard>))}
    </div>
    </div>
  )
}
