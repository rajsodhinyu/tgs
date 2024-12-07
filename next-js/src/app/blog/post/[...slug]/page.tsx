import Image from "next/image"
import PlaylistCard from "../../playlistCards";
import Sidebar from "../../sidebar";
import React from "react";
import { sanityFetch } from "@/app/client";
import { PortableText, PortableTextComponents, SanityDocument } from "next-sanity";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import imageUrlBuilder from "@sanity/image-url";
import { writer } from "repl";



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

function renderEmbed(playlist: string) {
  if (playlist == null) {
    return (<div> <br /></div>)
  }
  else {
    const parts = playlist.split("/")

    return (<iframe src={`https://open.spotify.com/embed/${parts[3]}/${parts[4]}`} width="90%" height="200" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>)
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
    em: ({children}) => <em className="text-tgs-purple">{children} </em>,
    
    link: ({children, value}) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a className = "underline text-pink-600" href={value.href} rel={rel}>
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
  const SLUG_QUERY = `*[_type == "post" && slug.current == "${slug}"]`;
  const posts = await sanityFetch<SanityDocument[]>({ query: SLUG_QUERY });
  const post = posts[0];
  console.log(`View [${post.name}]`)
  return (<div className="font-roc text-lg text-balance max-md:mt-14 *:max-[300px]:w-80">
    <div className="place-items-center ">
      <img className="rounded-md"
        src={`${bannerResolver(post)}`}
        alt={`${post.name}`}
      />
    </div>
    <div className="xl:text-4xl text-3xl font-bold font-bit text-center"> {/* Title */}
      {post.name}
    </div>
    <div className="xl:text-2xl text-xl font-bit text-center"> {/* Title */}
      {findWriter(post.writer._ref)}
    </div>
    <div className="place-items-center mt-3 -mb-5"> {/* Spotify Embed */}
      {renderEmbed(post.playlistURL)}
    </div>
    <div className="ml-5 mr-3 text-sm lg:text-lg text-pretty text-justify pb-10 indent-8 first-letter:text-8xl first-letter:font-title first-letter:text-black ">
      <PortableText value={post.content} components={components}/>
    </div>
  </div>)
}