import Image from "next/image"
import React from "react";
import { sanityFetch } from "@/app/client";
import { PortableText, PortableTextComponents, SanityDocument } from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import Link from "next/link";



const projectId = 'fnvy29id';
const dataset = 'tgs'

const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

    
function eventImage(event: any) {
  let pull = event.thumb.asset._ref;
  let thing = pull ? urlFor(pull)?.url() : null;
  return (thing)
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
  const monthNames = ["January", "February", "March", "April","May", "June", "July", "August", "September", "October", "November","December"];
  return `${monthNames[(date.getUTCMonth())]} ${date.getUTCDate()}`;

}
function renderEmbed(playlist: string) {
  if (playlist == null) {
    return (<div className="-my-4"></div>)
  }
  else {
    const parts = playlist.split("/")
    return (<div className="w-full">
      <div className="place-items-center mt-3 -mb-8 max-sm:ml-2">
      <iframe src={`https://open.spotify.com/embed/${parts[3]}/${parts[4]}`} width="100%" height="180" allow=" clipboard-write; encrypted-media; fullscreen; picture-in-picture" ></iframe>
      </div>
    </div>)
  }
}


function bannerResolver(post: any) {
  if (post?.banner == undefined) {
    return (urlFor(post?.thumb)?.fit('crop').width(700).height(700)?.url())
  } 
  else {
    return (urlFor(post?.banner)?.height(720).width(1280)?.url())
  }
}

async function findWriter(id:string) {
  const writerQ = `*[_type == "writer" && _id == "${id}"]{name}`
  const data:any = await sanityFetch({query:writerQ})

  return (data[0].name)
}

const components: PortableTextComponents = {
  block: {
    // Ex. 1: customizing common block types
    h1: ({children}) => <h1 className="text-2xl text-blue-800">{children}</h1>,
    normal: ({children}) => <p>{children} <br /></p>
    
  },
  list: {
    // Ex. 1: customizing common list types
    bullet: ({children}) => <ul className="mt-xl">{children}</ul>,
    number: ({children}) => <ol className="mt-lg">{children}</ol>,
  },
  listItem: {
    // Ex. 1: customizing common list types
    bullet: ({children}) => <li style={{listStyleType: 'disc'}}>{children}</li>,
    number: ({children}) => <li style={{listStyleType: 'decimal'}}>{children}</li>,
  },
  marks: {
    em: ({children}) => <em className="text-tgs-dark-purple">{children} </em>,
    
    link: ({children, value}) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a className = "underline text-tgs-dark-purple" href={value.href} rel={rel}>
          {children}
        </a>
      )
    },
  }
}


export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = (await params).slug
  
  const ALBUMS_Q = `*[_type == "albums"]{slug, datetime, artist}|order(datetime asc)`;
  const albums = await sanityFetch<SanityDocument[]>({ query: ALBUMS_Q });
  let previousSlug, nextSlug,prevPostslug,nextPostslug = '';
  for (let index = 0; index < albums.length; index++) {
    const element = albums[index];
    if (slug == 'two-star-and-the-dream-police'){
      previousSlug = 'the-skeleton-key'
      nextSlug = 'blue-lips'

      break
    }
    if (slug == 'the-skeleton-key'){
      previousSlug = 'maybe-in-nirvana'
      nextSlug = 'two-star-and-the-dream-police'

      break
    }
    if (element.slug.current == slug) {
      previousSlug = albums[index-1]?.slug.current
      nextSlug = albums[index+1]?.slug.current

    }
  }

  const PREV_SLUG_QUERY = `*[_type == "albums" && slug.current == "${previousSlug}"]`;
  const prevPosts = await sanityFetch<SanityDocument[]>({ query: PREV_SLUG_QUERY});
  const prevPost = prevPosts[0];
  prevPostslug = prevPost.slug.current;

  const NEXT_SLUG_QUERY = `*[_type == "albums" && slug.current == "${nextSlug}"]`;
  const nextPosts = await sanityFetch<SanityDocument[]>({ query: NEXT_SLUG_QUERY});
  const nextPost = nextPosts[0];
  nextPostslug = nextPost.slug.current;

  const SLUG_QUERY = `*[_type == "albums" && slug.current == "${slug}"]`;
  const posts = await sanityFetch<SanityDocument[]>({ query: SLUG_QUERY });
  const post = posts[0];

  return (<div className="font-roc text-lg text-balance max-md:mt-14 max-[300px]:w-80 text-white">
    <div className="m-5 mb-4">
      <div className="text-2xl md:text-4xl font-bold font-title text-center"> {/* Title */}
        <Link href={post.URL}>{post.name}</Link>
      </div>
      <div className="text-xl md:text-2xl font-bold font-bit text-center"> {/* Title */}
        {post.artist}
      </div>
    </div>
    <div className="flex justify-center">
      
        <div className="size-1/6 self-center text-center font-title text-5xl">
        <Link href={`/feature/2024/${prevPostslug}`}>
          &lt;
          <div className="text-sm font-bit invisible md:visible">{prevPost.artist}</div>
          </Link>
          </div>
      
        <img className="rounded-md size-80 md:size-3/6"
          src={`${eventImage(post)}`}
          alt={`{post.name}`}
          loading="eager"
        />

        <Link href={`/feature/2024/${nextPostslug}`} className="size-1/6 self-center justify-items-center font-title text-5xl">
          &gt;
          <div className="text-sm font-bit invisible md:visible">{nextPost.artist}</div>
        </Link>

      </div>
      <div className="text-md font-bold font-title text-center -mb-8 mt-4"> {/* Title */}
        {stringifyDate(post.datetime)}
      </div>
      <div className="mx-14 text-lg lg:text-2xl text-pretty text-justify pt-10 px-4 md:p-10 indent-8 ">
       <PortableText value={post.content} components={components}/> 
      <div className="xl:text-2xl text-xl font-bit text-right"> {/* Title */}
      -{post.writer}
    </div>
    </div>
  </div>)
}