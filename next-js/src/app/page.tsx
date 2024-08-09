import Link from "next/link";
import { SanityDocument } from "next-sanity";

import { sanityFetch } from "@/sanity/client";

const EVENTS_QUERY = `*[
  _type == "event" 
  && defined(slug.current)
]{_id, name, slug, date}|order(date desc)`;

const BLOG_QUERY = `*[
  _type == "post" 
  && defined(slug.current)
]{_id, name, slug, date}|order(date desc)`;

export default async function IndexPage() {
  const events = await sanityFetch<SanityDocument[]>({query: EVENTS_QUERY});
  const blogs = await sanityFetch<SanityDocument[]>({query: BLOG_QUERY});

  return (
    <main className="flex bg-gray-100 min-h-screen flex-col p-24 gap-12">
      <h1 className="text-4xl font-bold tracking-tighter">
        Events
      </h1>
      <ul className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {events.map((event) => (
          <li
            className="bg-white p-4 rounded-lg"
            key={event._id}
          >
            <Link
              className="hover:underline"
              href={`/events/${event.slug.current}`}
            >
              <h2 className="text-xl font-semibold">{event?.name}</h2>
              <p className="text-gray-500">
                {new Date(event?.date).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <h1 className="text-4xl font-bold tracking-tighter">
        Blogs
      </h1>
      <ul className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {blogs.map((event) => (
          <li
            className="bg-white p-4 rounded-lg"
            key={event._id}
          >
            <Link
              className="hover:underline"
              href={`/posts/${event.slug.current}`}
            >
              <h2 className="text-xl font-semibold">{event?.name}</h2>
              <p className="text-gray-500">
                {new Date(event?.date).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}