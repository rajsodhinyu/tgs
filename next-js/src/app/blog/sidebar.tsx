import Link from "next/link";
import Image from "next/image";
import ChevronDots from "../components/ChevronDots";

import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";
import SidebarList from "./SidebarList";

const projectId = "fnvy29id";
const dataset = "tgs";

const BLOGS_QUERY = `*[_type == "post" && private != true]{_id, name, youtubeURL, thumb, writer, banner,playlistURL, content, slug, date, description}|order(date desc)`;
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}

export default async function Sidebar() {
  const blogs = await sanityFetch<SanityDocument[]>({ query: BLOGS_QUERY });

  const blogsForClient = blogs.map((blog) => ({
    _id: blog._id,
    name: blog.name,
    slug: blog.slug,
    youtubeURL: blog.youtubeURL,
    imageUrl: eventImage(blog) || "",
  }));

  return (
    <div className="flex flex-col items-center w-full">
      <div className="*:m-1 w-80 -mt-2">
        <div className="sticky top-0 z-10 flex justify-center">
          <Link
            href="/blog-archive"
            className="bg-tgs-purple rounded-2xl px-6 text-4xl font-bold font-title my-2 uppercase text-white border-4 border-transparent hover:border-white text-nowrap flex items-center gap-2 "
          >
            All Posts
            <ChevronDots className="inline-block mt-1" />
          </Link>
        </div>

        {/* Mobile: infinite scroll, no fixed height */}
        <div className="md:hidden">
          <SidebarList blogs={blogsForClient} />
        </div>

        {/* Desktop: fixed-height scrollable container */}
        <div className="hidden md:block relative">
          <div className="flex-col w-full">
            {blogs.map((blog) => (
              <div key={blog._id} className="flex justify-center">
                <Link href={`/blog/post/${blog.slug.current}`} target="_self">
                  <Image
                    className="h-auto object-cover w-80 border-opacity-0 hover:border-opacity-100 hover:scale-95 border-4 border-white rounded-md"
                    src={`${eventImage(blog)}`}
                    alt={`${blog.name} Cover`}
                    width={300}
                    height={300}
                    quality={100}
                  />
                </Link>
              </div>
            ))}
          </div>
          <Link
            href="/blog-archive"
            className="sticky bottom-4 float-right mr-2 bg-tgs-purple rounded-2xl px-3 py-1 text-sm font-bold font-title uppercase text-white border-2 border-transparent hover:border-white flex items-center gap-1"
          >
            See All
            <ChevronDots className="inline-block mt-0.5" color="white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
