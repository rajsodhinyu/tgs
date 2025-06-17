import Image from "next/image";
import Link from "next/link";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { SanityDocument } from "next-sanity";
import { sanityFetch } from "../client";

const projectId = "fnvy29id";
const dataset = "tgs";

const BLOGS_QUERY = `*[_type == "post"]{_id, name, youtube,youtubeURL, thumb, writer, banner,playlistURL, content, slug, date, description}|order(date desc)`;

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return thing;
}
function tabResolver(isYoutube: boolean) {
  // Always open in same tab since we're not redirecting to YouTube anymore
  return `_self`;
}

export default async function Page() {
  const blogs = await sanityFetch<SanityDocument[]>({ query: BLOGS_QUERY });
  function linkResolver(isYoutube: boolean, youtubeLink: string, slug: any) {
    // Always return local URL for both regular and YouTube posts
    return `/blog/post/${slug.current}`;
  }
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
      <div className="text-2xl min-[340px]:text-4xl font-bold decoration-tgs-purple text-black font-bit leading-10 text-balance w-full justify-center text-center pt-12 md:mb-3 md:pt-0">
        ALL POSTS
      </div>
      <div className="grid lg:grid-cols-5 sm:grid-cols-4 grid-cols-2 mx-3 md:p-2 pt-4 gap-2">
        {blogs.map((blog) => (
          <div
            className="group flex flex-col text-center justify-around"
            key={blog._id}
          >
            <div className="text-white flex flex-col">
              <div className="relative">
                <Link
                  className="hover:underline decoration-tgs-purple"
                  href={`${linkResolver(blog.youtube, blog.youtubeURL, blog.slug)}`}
                  target={tabResolver(blog.youtube)}
                >
                  <Image
                    className="object-contain rounded-md border-tgs-purple border-0 hover:border-4 hover:scale-[98%]"
                    src={`${eventImage(blog)}?h=700&w=700&fit=crop&crop=center`}
                    width={700}
                    height={700}
                    alt={`${blog.name} Cover`}
                    sizes="(max-width: 400px) 100vw"
                    quality={100}
                  />
                </Link>
              </div>
            </div>
            <div className="flex flex-col text-center text-sm leading-tight font-bit font-bold group-hover:text-tgs-purple truncate p-2">
              <div>{blog.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
