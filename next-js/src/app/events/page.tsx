import Image from "next/image"
import Link from "next/link";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";

const projectId = 'fnvy29id';
const dataset = 'tgs'


const EVENTS_QUERY = `*[_type == "event"]{_id, name, link, flyer, slug, date}|order(date desc)`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null; 


export function eventImage(event:any) {
  let pull = event.flyer.asset._ref;
  let thing = pull ? urlFor(pull)?.url(): null;
  return (thing)
}

export default async function Page(){
  const events = await sanityFetch<SanityDocument[]>({query: EVENTS_QUERY});

function stringifyDate(input:string) {
  let date = new Date(input);
  let str = date.toDateString();
  return str.substring(0,10);
}

  return (<div>
    <h1 className="bg-orange-500">Events Home</h1>
    <div className=" grid grid-cols-5 pt-3 gap-x-2">
      {events.map((event) => (

        <div className="rounded-lg hover:scale-95" key={event._id}>
          <Link className="hover:underline"
            href={`/events/${event.slug.current}`}>
            <div className="text-white flex place-content-center">
              <div className="relative size-56 ">
                <Image className=" object-contain "
                  src={`${eventImage(event)}`}
                  fill={true}
                  alt={`${event.name}`}
                />
              </div>
            </div>
            <p className="text-gray-500 text-center">
              {stringifyDate(event.date)}
            </p>
            <p className="text-gray-500 text-center font-bold">
              {event.name}
            </p>
            
          </Link>
        </div>
      ))}
    </div>


  </div>
  )
} 

