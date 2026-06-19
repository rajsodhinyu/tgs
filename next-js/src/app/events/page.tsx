import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";
import EventCard from "./EventCard";

const projectId = "fnvy29id";
const dataset = "tgs";

const EVENTS_QUERY = `*[_type == "event"]{_id, name, link, flyer, slug, date, ticketEmbed}|order(date desc)`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.flyer.asset?._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

// Pull the iframe src out of a pasted ITM embed snippet. Falls back to a bare
// URL if that's all that was pasted; returns null when there's nothing usable.
function extractEmbedSrc(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const match = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  if (match) return match[1];
  if (/^https?:\/\/\S+$/.test(trimmed)) return trimmed;
  return null;
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
      <h1 className="text-4xl font-title font-bold text-white uppercase leading-none -mt-2 text-center">
        Events
      </h1>
      <div className="grid lg:grid-cols-5 sm:grid-cols-4 grid-cols-2 md:p-2 mt-4 gap-2">
        {events.map((event) => (
          <EventCard
            key={event._id}
            name={event.name}
            imageUrl={`${eventImage(event)}`}
            dateLabel={stringifyDate(event.date)}
            link={`${event.link}`}
            embedSrc={extractEmbedSrc(event.ticketEmbed)}
          />
        ))}
      </div>
    </div>
  );
}
