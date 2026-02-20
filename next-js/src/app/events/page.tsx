import Link from "next/link";

import Image from "next/image";

import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";

const projectId = "fnvy29id";
const dataset = "tgs";

const EVENTS_QUERY = `*[_type == "event"]{_id, name, link, flyer, slug, date}|order(date desc)`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.flyer.asset?._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

export default async function Page() {
  const events = await sanityFetch<SanityDocument[]>({ query: EVENTS_QUERY });
  function stringifyDate(input: string) {
    let date = new Date(input);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let str = date.toDateString();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-4xl font-bold font-title text-white uppercase mx-4 sm:mx-6">
        All Events
      </h1>
      <div className="grid lg:grid-cols-5 sm:grid-cols-4 grid-cols-2 max-sm:mx-2 md:p-2 pt-4 gap-2">
        {events.map((event) => (
          <div className="group rounded-lg" key={event._id}>
            <Link className=" decoration-tgs-purple" href={`${event.link}`}>
              <div className="text-white">
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    className="object-contain rounded-md border-white border-0 group-hover:border-4 group-hover:scale-[98%]"
                    src={`${eventImage(event)}`}
                    fill={true}
                    alt={`${event.name}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    quality={100}
                  />
                </div>
              </div>
              <p className="text-center text-md sm:text-xl font-bit font-black text-balance pt-1 leading-tight text-white group-hover:underline group-hover:text-tgs-pink">
                {event.name}
              </p>
              <p className="text-gray-300 text-center text-xs sm:text-base font-roc py-2 -m-2 group-hover:text-tgs-pink">
                {stringifyDate(event.date)}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
