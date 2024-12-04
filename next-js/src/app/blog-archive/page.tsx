import Image from "next/image"
import Link from "next/link";
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

export default async function Page(){

const blogs = await sanityFetch<SanityDocument[]>({query: BLOGS_QUERY});
function linkResolver(isYoutube:boolean,youtubeLink:string,slug:any) {
  if (isYoutube){
    return `${youtubeLink}`
  }
  else {
    return `/blog/post/${slug.current}`
  }
  
}
function stringifyDate(input:string) {
  let date = new Date(input);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  let str = date.toDateString();
  const monthNames = ["January", "February", "March", "April", "June", "July", "August", "September", "October", "December"];
  return `${monthNames[(date.getUTCMonth()-1)]} ${date.getDate()}`;

}
  return (<div className="mt-10">
    <div className="grid lg:grid-cols-4 gap-4 xl:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 md:-mt-10 ">
      {blogs.map((blog) => (
        <div className="" key={blog._id}>
          
            <div className="text-white flex place-content-center">
              <div className="relative size-72">
              <Link className="hover:underline decoration-tgs-purple"
            href={`${linkResolver(blog.youtube,blog.youtubeURL,blog.slug)}`}>
                <Image className=" object-contain rounded-md border-tgs-purple border-0 hover:border-4 hover:scale-[98%]"
                  src={`${eventImage(blog)}?h=700&w=700&fit=crop&crop=center`}
                  width={700}
                  height={700}
                  alt={`${blog.name} Cover`}
                  sizes="(max-width: 400px) 100vw"
                  quality={100}
                /></Link>
              </div>
            </div>
            <div className="text-center text-lg font-bit font-bold leading-5 pt-1 sm:pt-2">
              {blog.name}
            </div>
            
          
        </div>
      ))}
    </div>
  </div>
  )
} 

