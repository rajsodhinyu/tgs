import Image from "next/image"
import Link from "next/link";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../../client";
import { log } from "console";

const projectId = 'fnvy29id';
const dataset = 'tgs'

const EVENTS_QUERY = `*[_type == "event"]{_id, name, link, flyer, slug, date}|order(date desc)`;
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
  const events = await sanityFetch<SanityDocument[]>({query: EVENTS_QUERY});
  const blogs = await sanityFetch<SanityDocument[]>({query: BLOGS_QUERY});

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
  return (<div>
    <div className=" grid grid-cols-4 p-3 gap-2">
      {blogs.map((blog) => (
        <div className="rounded-lg hover:scale-95" key={blog._id}>
          <Link className="hover:underline"
            href={`${blog.link}`}>
            <div className="text-white flex place-content-center">
              <div className="relative size-72 ">
                <Image className=" object-contain "
                  src={`${eventImage(blog)}`}
                  fill={true}
                  alt={`${blog.name}`}
                />
              </div>
            </div>
            <p className="text-center text-xl font-bit font-black text-balance pt-1">
              {blog.name}
            </p>
            <p className="text-gray-500 text-center font-roc pb-4 -m-2">
              {stringifyDate(blog.date)}
            </p>
            
          </Link>
        </div>
      ))}
    </div>


  </div>
  )
} 

