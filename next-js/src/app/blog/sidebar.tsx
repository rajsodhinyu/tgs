import Link from "next/link";
import Image from "next/image"

import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";

const projectId = 'fnvy29id';
const dataset = 'tgs'


const BLOGS_QUERY = `*[_type == "post"]{_id, name, youtube,youtubeURL, thumb, writer, banner,playlistURL, content, slug, date}|order(date desc)`;
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null; 


    function eventImage(event:any) {
      let pull = event.thumb.asset._ref;
      let thing = pull ? urlFor(pull)?.url(): null;
      return (thing)
    }

export default async function Sidebar({ items}: { items: number}) {
  const blogs = await sanityFetch<SanityDocument[]>({query: BLOGS_QUERY});
  const truncatedBlogs = []
  for (let i = 0; i < items; i++) {
    truncatedBlogs[i] = blogs[i];
  }

  function linkResolver(isYoutube:boolean,youtubeLink:string,slug:any) {
    if (isYoutube){
      return `${youtubeLink}`
    }
    else {
      return `/blog/post/${slug.current}`
    }
    
  }

  function tabResolver(isYoutube:boolean) {
    if (isYoutube){
      return `_blank`
    }
    else {
      return `_self`
    }
    
  }


  return (
    <div>
      <div className="tracking-wide font-bold hover:underline decoration-tgs-purple text-black flex shrink text-3xl lg:text-4xl font-bit leading-10 ml-4 justify-center text-center"><a href="/blog/archive">Recent Posts</a></div>
      {truncatedBlogs.map((blog) => (
        <div key={blog.name}>
          <Link href={`${linkResolver(blog.youtube,blog.youtubeURL,blog.slug)}`} target={tabResolver(blog.youtube)}><Image className="w-96 lg:w-full m-1 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-2 xl:border-4 border-tgs-purple rounded-md" src={`${eventImage(blog)}`} alt={`${blog.name} Cover`} width={300} height={300}></Image></Link>
        </div>
      ))}
      <a className="tracking-wide font-bold hover:underline decoration-tgs-purple text-black flex shrink text-3xl lg:text-4xl font-bit leading-10 ml-4 justify-center text-center"href="/blog/archive">View All &gt; </a>
    </div>
   
  )
}
