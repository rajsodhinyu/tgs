import Link from "next/link"


import Image from "next/image"

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


  function eventImage(event:any) {
  let pull = event.flyer.asset._ref;
  let thing = pull ? urlFor(pull)?.url(): null;
  return (thing)
}

export default async function Page(){
  const events = await sanityFetch<SanityDocument[]>({query: EVENTS_QUERY});
function stringifyDate(input:string) {
  let date = new Date(input);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  let str = date.toDateString();
  const monthNames = ["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November","December"];
  return `${monthNames[(date.getMonth())]} ${date.getDate()}`;

}

  return (<div>
    <div className="text-2xl min-[340px]:text-4xl font-bold hover:underline hover:text-tgs-purple decoration-tgs-purple text-black font-bit leading-10 text-balance w-full justify-center text-center pt-12">
         ALL EVENTS
        </div>
    <div className="grid lg:grid-cols-5 sm:grid-cols-4 grid-cols-2 max-sm:mx-3 md:p-2 pt-4 gap-2">
      {events.map((event) => (
        <div className="group rounded-lg" key={event._id}>
          <Link className=" decoration-tgs-purple"
            href={`${event.link}`}>
            <div className="text-white flex place-content-center">
              <div className="relative lg:size-72 sm:size-44 size-40">
                <Image className="object-contain rounded-md border-tgs-purple border-0 group-hover:border-4 group-hover:scale-[98%]"
                  src={`${eventImage(event)}`}
                  fill={true}
                  alt={`${event.name}`}
                  sizes="(max-width: 1024px) 300"
                  quality={100}
                />
              </div>
            </div>
            <p className="text-center text-md sm:text-xl font-bit font-black text-balance pt-1 leading-tight group-hover:underline group-hover:text-tgs-purple">
              {event.name}
            </p>
            <p className="text-gray-500 text-center text-xs sm:text-base font-roc py-2 -m-2 group-hover:text-tgs-purple">
              {stringifyDate(event.date)}
            </p>
            
          </Link>
        </div>
      ))}
    </div>


  </div>
  )
} 

/* 
No events for now!
export default function Post() {
  return (<div className='font-title sm:text-4xl text-center *:text-balance absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 sm:mt-0'>
    <div className="text-2xl">
      No upcoming events for now!
      <br />
      <Link className="hover:underline" href="sms:+18055002436">Text +1-(805)-500-2436 to be the first to know...</Link>
    </div>
    <br />
    <div className="text-center hover:text-tgs-purple hover:underline"><Link href="/events/archive">Check out the Events Archive &gt;</Link></div>
    
  </div>)
}
 */