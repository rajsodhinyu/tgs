
import Image from "next/image"
import Link from "next/link";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../../client";


const projectId = 'fnvy29id';
const dataset = 'tgs'


const ALBUMS_Q = `*[_type == "albums"]{_id, name, artist, thumb, writer, datetime, slug}|order(datetime asc)`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null; 

    function eventImage(event:any) {
      let pull = event.thumb.asset._ref;
      let thing = pull ? urlFor(pull)?.url(): null;
      return (thing)
    }
    function tabResolver(isYoutube:boolean) {
      if (isYoutube){
        return `_blank`
      }
      else {
        return `_self`
      }
      
    }
    function linkResolver(slug:any) {
        
        if (slug?.current == undefined){
          return '/feature/2024'
        }
        return `/feature/2024/${slug.current}`
      
    }
export default async function Page(){

const blogs = await sanityFetch<SanityDocument[]>({query: ALBUMS_Q});


  return (<div className="mt-16 md:mt-14">
    <div className="grid md:grid-cols-5 mx-3 gap-2 grid-cols-2 md:-mt-10 ">
      {blogs.map((blog) => (
        <div className="group flex flex-col text-center justify-around" key={blog._id}>
            <div className="text-white flex flex-col">  
              <div className="relative">
              <Link className="hover:underline decoration-tgs-purple"
            href={linkResolver(blog.slug)}
            >
                <Image className="object-contain rounded-md border-tgs-purple border-0 hover:border-4 hover:scale-[98%]"
                  src={`${eventImage(blog)}?h=700&w=700&fit=crop&crop=center`}
                  width={700}
                  height={700}
                  alt={`${blog.name} Cover`}
                  sizes="(max-width: 400px) 100vw"
                  quality={100}
                /></Link>
              </div>
            </div>
            {/* <div className="flex flex-col text-center text-sm leading-tight font-bit font-bold group-hover:text-tgs-purple">
              <div>{blog.name}</div>
            </div> */}
        </div>
      ))}
    </div>
  </div>
  )
} 

